import {
  CreatePasteRequest,
  CreatePasteResponse,
  GetPasteResponse,
  DeletePasteResponse,
  ApiErrorResponse,
} from '@codeshare/shared';

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(message: string, status: number, code = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!res.ok) {
    if (isJson) {
      const errorData: ApiErrorResponse = await res.json();
      throw new ApiError(
        errorData.error?.message || `Request failed with status ${res.status}`,
        res.status,
        errorData.error?.code || 'API_ERROR'
      );
    }
    const text = await res.text();
    throw new ApiError(text || `Request failed with status ${res.status}`, res.status);
  }

  return (await res.json()) as T;
}

export const api = {
  async createPaste(payload: CreatePasteRequest): Promise<CreatePasteResponse> {
    const res = await fetch('/api/pastes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<CreatePasteResponse>(res);
  },

  async getPaste(id: string): Promise<GetPasteResponse> {
    const res = await fetch(`/api/pastes/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    return handleResponse<GetPasteResponse>(res);
  },

  async deletePaste(id: string, token: string): Promise<DeletePasteResponse> {
    const res = await fetch(`/api/pastes/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-delete-token': token,
      },
    });
    return handleResponse<DeletePasteResponse>(res);
  },
};

