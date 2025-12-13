import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/errors.js'
import logger from '../utils/logger.js'

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error caught in global error handler', { error: err })

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    })
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  })
}