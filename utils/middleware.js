const jwt = require('jsonwebtoken')
const { SECRET } = require('../utils/config')
const { User, Session } = require('../models')

const errorHandler = (error, req, res, next) => {
  if (error.name === 'SequelizeDatabaseError') {
    return res.status(400).json({ error: error.message })
  } else if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: error.message })
  } else if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'invalid token' })
  }
  next(error)
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get('Authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    const decodedToken = jwt.verify(authorization.substring(7), SECRET)
    const user = await User.findByPk(decodedToken.id)
    if (await user.hasUserRights({ token: authorization.substring(7) })) {
      req.decodedToken = decodedToken
    } else {
      return res.status(401).json({ error: 'user disabled or session is not active' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

module.exports = {
  errorHandler, unknownEndpoint, tokenExtractor
}
