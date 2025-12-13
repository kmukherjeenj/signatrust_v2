import express from 'express'
import logger from '../utils/logger.js'

const router = express.Router()

router.get('/', (req, res) => {
  logger.info('Health check requested')
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

export default router