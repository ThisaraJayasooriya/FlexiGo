// lib/api-client.ts
// Centralized API client with automatic token expiration handling

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private async handleResponse(response: Response) {
    // Check for token expiration (401 Unauthorized)
    if (response.status === 401) {
      this.handleTokenExpiration();
      throw new Error('Session expired. Please login again.');
    }

    // Parse JSON response
    const json = await response.json();
    
    // Check if response was successful
    if (!response.ok) {
      throw new Error(json?.error || `Request failed with status ${response.status}`);
    }

    return json;
  }

  private handleTokenExpiration() {
    // Clear authentication data
    localStorage.removeItem('access_token');
    document.cookie = 'access_token=; path=/; max-age=0';
    
    // Redirect to login page
    window.location.href = '/login';
  }

  async fetch(url: string, options: FetchOptions = {}): Promise<any> {
    const token = localStorage.getItem('access_token');
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const mergedOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}${url}`, mergedOptions);
      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async get(url: string, options: FetchOptions = {}): Promise<any> {
    return this.fetch(url, { ...options, method: 'GET' });
  }

  async post(url: string, data?: any, options: FetchOptions = {}): Promise<any> {
    return this.fetch(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(url: string, data?: any, options: FetchOptions = {}): Promise<any> {
    return this.fetch(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch(url: string, data?: any, options: FetchOptions = {}): Promise<any> {
    return this.fetch(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(url: string, options: FetchOptions = {}): Promise<any> {
    return this.fetch(url, { ...options, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
