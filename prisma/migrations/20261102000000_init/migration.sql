-- CreateTable
CREATE TABLE "pastes" (
    "id" VARCHAR(32) NOT NULL,
    "content" TEXT NOT NULL,
    "language" VARCHAR(32) NOT NULL DEFAULT 'text',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "deleteTokenHash" VARCHAR(64) NOT NULL,

    CONSTRAINT "pastes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_pastes_expires_at" ON "pastes"("expiresAt");

