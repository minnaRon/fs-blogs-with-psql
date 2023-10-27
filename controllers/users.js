const router = require('express').Router()
const { tokenExtractor } = require('../utils/middleware')
const { User, Blog } = require('../models')

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: {
      model: Blog,
      attributes: { exclude: ['userId'] }
    }
  })
  res.json(users)
})

router.post('/', async (req, res) => {
  const user = await User.create(req.body)
  res.json(user)
})

router.put('/:username', tokenExtractor, async (req, res) => {
  const currentUser = await User.findByPk(req.decodedToken.id)
  const user = await User.findOne({ where: {username: req.params.username}})
  if (user.id === currentUser.id) {
    user.name = req.body.name
    await user.save()
    res.json(user)
  } else {
    res.status(404).end()
  }
})

router.get('/:id', async (req, res) => {
  const where = {}
  if (req.query.read) {
    where.read = req.query.read === 'true'
  }
  const user = await User.findByPk(req.params.id, { 
    attributes: { exclude: ['id', 'createdAt', 'updatedAt'] },
    include:[{
        model: Blog,
        as: 'readings',
        attributes: { exclude: ['createdAt', 'updatedAt', 'userId'] },
        through: {
          attributes: ['read', 'id'],
          where
        }
    }],
  })
  if (user) {
    res.json(user)
  } else {
    res.status(404).end()
  }
})

module.exports = router
