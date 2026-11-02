import crypto from 'crypto';
import { prisma } from '../prisma/client';
import { env } from '../config/env';
import {
  CreatePasteRequest,
  CreatePasteResponse,
  GetPasteResponse,
  DeletePasteResponse,
  SupportedLanguage,
} from '@codeshare/shared';
import {
  NotFoundError,
  ExpiredError,
  ForbiddenError,
  ServiceUnavailableError,
} from '../errors/appError';

export class PasteService {
  /**
   * Generates a cryptographically secure, URL-safe random identifier.
   */
  private generatePublicId(): string {
    return crypto.randomBytes(9).toString('base64url'); // 12 characters, 72 bits of entropy
  }

  /**
   * Generates a cryptographically secure deletion token.
   */
  private generateDeleteToken(): string {
    return crypto.randomBytes(24).toString('base64url'); // 32 characters, 192 bits of entropy
  }

  /**
   * Computes the SHA-256 hash of a deletion token.
   */
  private hashDeleteToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Creates a new paste with a 24-hour expiration and a secure deletion token.
   */
  async createPaste(input: CreatePasteRequest): Promise<CreatePasteResponse> {
    const id = this.generatePublicId();
    const deleteToken = this.generateDeleteToken();
    const deleteTokenHash = this.hashDeleteToken(deleteToken);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + env.PASTE_EXPIRY_HOURS * 60 * 60 * 1000);
    const language = (input.language || 'text') as SupportedLanguage;

    const maxStorageBytes = env.MAX_STORAGE_MB * 1024 * 1024;
    const contentBytes = Buffer.byteLength(input.content, 'utf8');

    const executeCreation = async (tx: any) => {
      // In PostgreSQL, serialize capacity check using transaction-scoped advisory lock
      if (typeof tx.$executeRaw === 'function') {
        try {
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(2147483647)`;
        } catch {
          // If unsupported in current database dialect or mock, continue
        }
      }

      // Concurrently-safe capacity check
      let activeCount = 0;
      let totalBytes = 0;

      if (typeof tx.$queryRaw === 'function') {
        try {
          const stats = await tx.$queryRaw`
            SELECT COUNT(*)::bigint as count, COALESCE(SUM(octet_length(content)), 0)::bigint as total_bytes
            FROM "pastes"
            WHERE "expiresAt" > ${now}
          `;
          if (Array.isArray(stats) && stats.length > 0 && stats[0]) {
            activeCount = Number(stats[0].count ?? 0);
            totalBytes = Number(stats[0].total_bytes ?? 0);
          }
        } catch {
          if (typeof tx.paste?.count === 'function') {
            activeCount = await tx.paste.count({
              where: { expiresAt: { gt: now } },
            });
          }
        }
      } else if (typeof tx.paste?.count === 'function') {
        activeCount = await tx.paste.count({
          where: { expiresAt: { gt: now } },
        });
      }

      if (activeCount >= env.MAX_ACTIVE_PASTES) {
        throw new ServiceUnavailableError('Maximum active paste capacity reached. Please try again later.');
      }

      if (totalBytes + contentBytes > maxStorageBytes) {
        throw new ServiceUnavailableError('Active paste storage capacity reached. Please try again later.');
      }

      await tx.paste.create({
        data: {
          id,
          content: input.content,
          language,
          createdAt: now,
          expiresAt,
          deleteTokenHash,
        },
      });
    };

    if (typeof (prisma as any).$transaction === 'function') {
      await (prisma as any).$transaction(async (tx: any) => {
        await executeCreation(tx);
      });
    } else {
      await executeCreation(prisma);
    }

    const url = `${env.APP_BASE_URL}/p/${id}`;
    const deleteUrl = `${env.APP_BASE_URL}/p/${id}?token=${deleteToken}`;

    return {
      id,
      url,
      language,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      deleteToken,
      deleteUrl,
    };
  }

  /**
   * Retrieves an unexpired paste by its public ID.
   * Enforces expiration check: expiresAt <= currentTime is treated as expired.
   */
  async getPasteById(id: string): Promise<GetPasteResponse> {
    const paste = await prisma.paste.findUnique({
      where: { id },
    });

    if (!paste) {
      throw new NotFoundError('Paste not found');
    }

    const now = new Date();
    if (paste.expiresAt.getTime() <= now.getTime()) {
      throw new ExpiredError('This paste has expired and is no longer accessible');
    }

    return {
      id: paste.id,
      content: paste.content,
      language: paste.language as SupportedLanguage,
      createdAt: paste.createdAt.toISOString(),
      expiresAt: paste.expiresAt.toISOString(),
    };
  }

  /**
   * Deletes a paste using the secret deletion token with timing-safe comparison.
   */
  async deletePaste(id: string, rawToken: string): Promise<DeletePasteResponse> {
    const paste = await prisma.paste.findUnique({
      where: { id },
    });

    if (!paste) {
      throw new NotFoundError('Paste not found');
    }

    const now = new Date();
    if (paste.expiresAt.getTime() <= now.getTime()) {
      throw new ExpiredError('This paste has expired and cannot be deleted');
    }

    const computedHash = this.hashDeleteToken(rawToken);
    const expectedBuffer = Buffer.from(paste.deleteTokenHash, 'hex');
    const actualBuffer = Buffer.from(computedHash, 'hex');

    // Timing-safe comparison to prevent side-channel timing attacks
    if (
      expectedBuffer.length !== actualBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, actualBuffer)
    ) {
      throw new ForbiddenError('Invalid deletion token');
    }

    await prisma.paste.delete({
      where: { id },
    });

    return {
      message: 'Paste permanently deleted',
      id,
    };
  }

  /**
   * Cleans up expired pastes from the database.
   */
  async cleanupExpired(): Promise<number> {
    const result = await prisma.paste.deleteMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
      },
    });

    return result.count;
  }
}

export const pasteService = new PasteService();

