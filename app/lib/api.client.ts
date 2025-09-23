export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  recommendedProducts: ProductRecommendation[];
}

export interface ProductRecommendation {
  name: string;
  price: string;
  features: string[];
  benefits: string[];
  availability: string;
  productUrl: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ChatApiClient {
  private apiUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor(apiUrl: string, apiKey: string, timeout: number = 30000) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.timeout = timeout;
  }

  async sendMessage(
    message: string,
    sessionId: string,
    userId?: string
  ): Promise<ChatResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'sessionId': sessionId,
        'apiKey': this.apiKey,
      };

      if (userId) {
        headers['userId'] = userId;
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({ message }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(
          `API request failed: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      return this.validateResponse(data);

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }

      throw new ApiError(`Network error: ${error.message}`, 0);
    }
  }

  private validateResponse(data: any): ChatResponse {
    if (!data || typeof data !== 'object') {
      throw new ApiError('Invalid response format', 400);
    }

    if (typeof data.response !== 'string') {
      throw new ApiError('Missing or invalid response field', 400);
    }

    if (!Array.isArray(data.recommendedProducts)) {
      throw new ApiError('Missing or invalid recommendedProducts field', 400);
    }

    // Validate each product recommendation
    for (const product of data.recommendedProducts) {
      if (!product.name || !product.price || !product.productUrl) {
        throw new ApiError('Invalid product recommendation format', 400);
      }
    }

    return data as ChatResponse;
  }

  async testConnection(): Promise<{ success: boolean; message: string; }> {
    try {
      await this.sendMessage('test', 'test-session', 'test-user');
      return { success: true, message: 'API connection successful' };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, message: error.message };
      }
      return { success: false, message: 'Connection test failed' };
    }
  }
}

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 401:
        return 'Invalid API key. Please check your settings.';
      case 403:
        return 'Access denied. Please contact support.';
      case 404:
        return 'API endpoint not found. Please check the URL.';
      case 408:
        return 'Request timeout. Please try again.';
      case 429:
        return 'Too many requests. Please wait a moment.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `API error: ${error.message}`;
    }
  }

  return 'An unexpected error occurred. Please try again.';
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
    }
  }

  throw lastError!;
}
