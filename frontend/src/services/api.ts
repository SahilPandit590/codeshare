import {
  CreatePasteRequest,
  CreatePasteResponse,
  GetPasteResponse,
  DeletePasteResponse,
  CreateSnippetRequest,
  CreateSnippetResponse,
  GetSnippetResponse,
  ApiErrorResponse,
} from '@codeshare/shared';

// Leave empty for the current single-service deployment, where the frontend
// and API share an origin. Set VITE_API_URL to a backend origin for split
// frontend/backend deployments.
const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function apiUrl(path: string): string {
  return `${apiBaseUrl}${path}`;
}

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
    const res = await fetch(apiUrl('/api/pastes'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<CreatePasteResponse>(res);
  },

  async createSnippet(payload: CreateSnippetRequest): Promise<CreateSnippetResponse> {
    const res = await fetch(apiUrl('/api/snippets'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<CreateSnippetResponse>(res);
  },

  async getPaste(id: string): Promise<GetPasteResponse> {
    const res = await fetch(apiUrl(`/api/pastes/${encodeURIComponent(id)}`), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    return handleResponse<GetPasteResponse>(res);
  },

  async getSnippet(id: string): Promise<GetSnippetResponse> {
    const res = await fetch(apiUrl(`/api/snippets/${encodeURIComponent(id)}`), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    return handleResponse<GetSnippetResponse>(res);
  },

  async deletePaste(id: string, token: string): Promise<DeletePasteResponse> {
    const res = await fetch(apiUrl(`/api/pastes/${encodeURIComponent(id)}`), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-delete-token': token,
      },
    });
    return handleResponse<DeletePasteResponse>(res);
  },
};
