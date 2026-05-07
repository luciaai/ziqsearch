export type ErrorType =
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'rate_limit'
  | 'upgrade_required'
  | 'model_restricted'
  | 'offline'
  | 'model_unavailable'
  | 'api_error'
  | 'insufficient_credits';

export type Surface = 'chat' | 'auth' | 'api' | 'stream' | 'database' | 'history' | 'model' | 'provider';

export type ErrorCode = `${ErrorType}:${Surface}`;

export type ErrorVisibility = 'response' | 'log' | 'none';

export const visibilityBySurface: Record<Surface, ErrorVisibility> = {
  database: 'log',
  chat: 'response',
  auth: 'response',
  stream: 'response',
  api: 'response',
  history: 'response',
  model: 'response',
  provider: 'response',
};

export class ChatSDKError extends Error {
  public type: ErrorType;
  public surface: Surface;
  public statusCode: number;

  constructor(errorCode: ErrorCode, cause?: string) {
    super();

    const [type, surface] = errorCode.split(':');

    this.type = type as ErrorType;
    this.cause = cause;
    this.surface = surface as Surface;
    this.message = getMessageByErrorCode(errorCode);
    this.statusCode = getStatusCodeByType(this.type);
  }

  public toResponse() {
    const code: ErrorCode = `${this.type}:${this.surface}`;
    const visibility = visibilityBySurface[this.surface];

    const { message, cause, statusCode } = this;

    if (visibility === 'log') {
      console.error({
        code,
        message,
        cause,
      });

      return Response.json(
        { code: '', message: 'Something went wrong. Please try again later.' },
        { status: statusCode },
      );
    }

    return Response.json({ code, message, cause }, { status: statusCode });
  }
}

export function getMessageByErrorCode(errorCode: ErrorCode): string {
  if (errorCode.includes('database')) {
    return 'An error occurred while executing a database query.';
  }

  switch (errorCode) {
    case 'bad_request:api':
      return "The request couldn't be processed. Please check your input and try again.";
    case 'rate_limit:api':
      return 'You have reached your daily free limit for today.';

    case 'unauthorized:auth':
      return 'You need to sign in before continuing.';
    case 'forbidden:auth':
      return 'Your account does not have access to this feature.';
    case 'upgrade_required:auth':
      return 'This feature requires a Pro subscription. Sign in and upgrade to continue.';

    case 'rate_limit:chat':
      return 'You have exceeded your maximum number of messages for the day. Please try again later.';
    case 'upgrade_required:chat':
      return 'You have reached your daily search limit. Upgrade to Pro for unlimited searches.';
    case 'not_found:chat':
      return 'The requested chat was not found. Please check the chat ID and try again.';
    case 'forbidden:chat':
      return 'This chat belongs to another user. Please check the chat ID and try again.';
    case 'unauthorized:chat':
      return 'You need to sign in to view this chat. Please sign in and try again.';
    case 'offline:chat':
      return "We're having trouble sending your message. Please check your internet connection and try again.";

    case 'unauthorized:model':
      return 'You need to sign in to access this AI model.';
    case 'forbidden:model':
      return 'This AI model requires a Pro subscription.';
    case 'model_restricted:model':
      return 'Access to this AI model is restricted. Please upgrade to Pro or contact support.';
    case 'upgrade_required:model':
      return 'This premium AI model is only available with a Pro subscription.';
    case 'rate_limit:model':
      return 'You have reached the usage limit for this AI model. Upgrade to Pro for unlimited access.';

    case 'forbidden:api':
      return 'Access denied';

    case 'model_unavailable:model':
      return 'This AI model is temporarily unavailable. Please try a different model or try again in a few minutes.';
    case 'model_unavailable:provider':
      return 'The AI service is currently experiencing issues. Please try again in a few minutes or select a different model.';
    
    case 'api_error:provider':
      return 'There was a problem connecting to the AI service. Please try again.';
    case 'api_error:model':
      return 'The AI model encountered an error. Please try again or select a different model.';
    
    case 'insufficient_credits:provider':
      return 'The AI service has run out of credits. Our team has been notified and will resolve this shortly. Please try again later.';
    case 'insufficient_credits:model':
      return 'This AI model is temporarily unavailable due to quota limits. Please try a different model.';
    
    case 'rate_limit:provider':
      return 'The AI service is experiencing high demand. Please wait a moment and try again.';

    default:
      return 'Something went wrong. Please try again later.';
  }
}

function getStatusCodeByType(type: ErrorType) {
  switch (type) {
    case 'bad_request':
      return 400;
    case 'unauthorized':
      return 401;
    case 'forbidden':
      return 403;
    case 'not_found':
      return 404;
    case 'rate_limit':
      return 429;
    case 'upgrade_required':
      return 402; // Payment Required
    case 'model_restricted':
      return 403;
    case 'offline':
      return 503;
    case 'model_unavailable':
      return 503;
    case 'api_error':
      return 502;
    case 'insufficient_credits':
      return 503;
    default:
      return 500;
  }
}

// Utility functions for error handling
export function isAuthError(error: ChatSDKError): boolean {
  return error.surface === 'auth';
}

export function isUpgradeRequiredError(error: ChatSDKError): boolean {
  return error.type === 'upgrade_required';
}

export function isModelError(error: ChatSDKError): boolean {
  return error.surface === 'model';
}

export function isSignInRequired(error: ChatSDKError): boolean {
  return (
    error.type === 'unauthorized' && (error.surface === 'auth' || error.surface === 'chat' || error.surface === 'model')
  );
}

export function isProRequired(error: ChatSDKError): boolean {
  return error.type === 'upgrade_required' || error.type === 'forbidden' || error.type === 'model_restricted';
}

export function isRateLimited(error: ChatSDKError): boolean {
  return error.type === 'rate_limit';
}

// Helper function to get error action suggestions
export function getErrorActions(error: ChatSDKError): {
  primary?: { label: string; action: string };
  secondary?: { label: string; action: string };
} {
  if (isSignInRequired(error)) {
    return {
      primary: { label: 'Sign In', action: 'signin' },
      secondary: { label: 'Try Again', action: 'retry' },
    };
  }

  if (isProRequired(error)) {
    return {
      primary: { label: 'Upgrade to Pro', action: 'upgrade' },
      secondary: { label: 'Check Again', action: 'refresh' },
    };
  }

  if (isRateLimited(error)) {
    return {
      primary: { label: 'Upgrade to Pro', action: 'upgrade' },
      secondary: { label: 'Try Again Later', action: 'retry' },
    };
  }

  return {
    primary: { label: 'Try Again', action: 'retry' },
  };
}

// Helper function to get error icon type
export function getErrorIcon(error: ChatSDKError): 'warning' | 'error' | 'upgrade' | 'auth' {
  if (isSignInRequired(error)) return 'auth';
  if (isProRequired(error) || isRateLimited(error)) return 'upgrade';
  if (error.type === 'offline') return 'warning';
  return 'error';
}

// Helper function to parse AI SDK errors and convert to user-friendly ChatSDKError
export function parseAIError(error: any): ChatSDKError {
  const errorMessage = error?.message || error?.toString() || '';
  const errorString = errorMessage.toLowerCase();

  // Check for API key issues
  if (errorString.includes('api key') || errorString.includes('api_key') || errorString.includes('authentication')) {
    return new ChatSDKError('api_error:provider', 'API authentication failed');
  }

  // Check for quota/credit issues
  if (errorString.includes('quota') || errorString.includes('insufficient') || errorString.includes('credit')) {
    return new ChatSDKError('insufficient_credits:provider', 'Service quota exceeded');
  }

  // Check for rate limiting
  if (errorString.includes('rate limit') || errorString.includes('too many requests') || errorString.includes('429')) {
    return new ChatSDKError('rate_limit:provider', 'Rate limit exceeded');
  }

  // Check for model unavailability
  if (errorString.includes('model') && (errorString.includes('unavailable') || errorString.includes('not found') || errorString.includes('does not exist'))) {
    return new ChatSDKError('model_unavailable:model', 'Model not available');
  }

  // Check for service unavailability
  if (errorString.includes('503') || errorString.includes('service unavailable') || errorString.includes('temporarily unavailable')) {
    return new ChatSDKError('model_unavailable:provider', 'Service temporarily unavailable');
  }

  // Check for timeout
  if (errorString.includes('timeout') || errorString.includes('timed out')) {
    return new ChatSDKError('api_error:provider', 'Request timed out');
  }

  // Check for network errors
  if (errorString.includes('network') || errorString.includes('econnrefused') || errorString.includes('enotfound')) {
    return new ChatSDKError('offline:chat', 'Network connection failed');
  }

  // Generic API error
  return new ChatSDKError('api_error:provider', 'AI service error');
}
