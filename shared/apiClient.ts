// shared/apiClient.ts
// Centralized API client for consistent authentication and error handling

export interface ApiClientConfig {
  baseUrl: string;
  getUserId?: () => string | null;
}

export class ApiClient {
  private baseUrl: string;
  private getUserId?: () => string | null;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.getUserId = config.getUserId;
  }

  /**
   * Get default headers with authentication
   */
  private getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    // Add user ID header if available
    if (this.getUserId) {
      const userId = this.getUserId();
      if (userId) {
        headers['x-user-id'] = userId;
      }
    }

    return headers;
  }

  /**
   * Handle API response and parse JSON
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorBody = await response.json();
        if (errorBody?.error) {
          errorMessage = errorBody.error;
        }
      } catch {
        // If we can't parse the error body, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, customHeaders: Record<string, string> = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(customHeaders)
    });

    return this.handleResponse<T>(response);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, customHeaders: Record<string, string> = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(customHeaders),
      body: data ? JSON.stringify(data) : undefined
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, customHeaders: Record<string, string> = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(customHeaders),
      body: data ? JSON.stringify(data) : undefined
    });

    return this.handleResponse<T>(response);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, customHeaders: Record<string, string> = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(customHeaders)
    });

    return this.handleResponse<T>(response);
  }
}

// Default API client instance
let defaultApiClient: ApiClient | null = null;

/**
 * Initialize the default API client
 */
export function initializeApiClient(getUserId?: () => string | null, baseUrl?: string): ApiClient {
  const apiBaseUrl = baseUrl || (typeof window !== 'undefined' 
    ? ((import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000')
    : 'http://localhost:3000');

  defaultApiClient = new ApiClient({
    baseUrl: apiBaseUrl,
    getUserId
  });

  return defaultApiClient;
}

/**
 * Get the default API client instance
 */
export function getApiClient(): ApiClient {
  if (!defaultApiClient) {
    throw new Error('API client not initialized. Call initializeApiClient() first.');
  }
  return defaultApiClient;
}
