const router = require('express').Router()
const { Op } = require('sequelize')
const { tokenExtractor } = require('../utils/middleware')
const { Blog, User } = require('../models')

router.get('/', async (req, res) => {
  let where = {}
  if (req.query.search) {
    where = {
      [Op.or]: [
        {
          title: { [Op.iLike]: `%${req.query.search}%` }
        },
        {
          author: { [Op.iLike]: `%${req.query.search}%` }
        }
      ]
    }
  }
  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: { model: User, attributes: ['name']},
    where,
    order: [
       ['likes', 'DESC']
    ]
  })
  res.json(blogs)
})

router.post('/', tokenExtractor, async (req, res) => {
  const user = await User.findByPk(req.decodedToken.id)
  const blog = await Blog.create({ ...req.body, userId: user.id })
  res.json(blog)
})

router.delete('/:id', tokenExtractor, async (req, res) => {
  const user = await User.findByPk(req.decodedToken.id)
  await Blog.destroy({where: { id: req.params.id, userId: user.id }})
  res.status(204).end()
})

router.put('/:id', async (req, res) => {
  const blog = await Blog.findByPk(req.params.id)
  if (blog) {
    blog.likes = req.body.likes
    await blog.save()
    res.json(blog)
  } else {
    res.status(404).end()
  }
})

module.exports = router
