// logger.ts or logger.js

type LogLevel = 'info' | 'warn' | 'error';

export const log = (level: LogLevel, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} [${level.toUpperCase()}] ${message}`;

  switch (level) {
    case 'info':
      console.log(logMessage, data ? data : '');
      break;
    case 'warn':
      console.warn(logMessage, data ? data : '');
      break;
    case 'error':
      console.error(logMessage, data ? data : '');
      break;
  }

  // Here you could also send logs to a server or external logging service
};

export const logError = (error: unknown, userMessage: string) => {
  log('error', userMessage, error);
  if (error instanceof Error) {
    log('error', 'Error details:', { message: error.message, stack: error.stack });
  }
  return userMessage;
};

export const logSuccess = (message: string, data?: any) => {
  log('info', message, data);
};