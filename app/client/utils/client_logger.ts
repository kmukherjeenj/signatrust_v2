// C:\Source\signatrust\app\client\utils\client_logger.ts

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
};

export const logError = (error: Error, userMessage: string) => {
  log('error', userMessage, { message: error.message, stack: error.stack });
  return userMessage;
};

export const logSuccess = (message: string, data?: any) => {
  log('info', message, data);
};
