const router = require('express').Router()
const { Op } = require('sequelize')
const { tokenExtractor } = require('../utils/middleware')
const { Readinglist, User } = require('../models')

router.post('/', tokenExtractor, async (req, res) => {
  const user = await User.findByPk(req.decodedToken.id)
  if (user.id.toString() === req.body.user_id.toString()) {
    const addedToReadinglist = await Readinglist.create({
      blogId: req.body.blog_id, userId: req.body.user_id
    })
    res.json(addedToReadinglist)
  } else {
    res.status(403).end()
  }
})

router.put('/:id', tokenExtractor, async (req, res) => {
  const reading = await Readinglist.findOne({
    where: { blogId: req.params.id, userId: req.decodedToken.id }
  })
  if (reading){
    reading.read = req.body.read 
    await reading.save()
    res.json(reading)
  } else {
    res.status(404).end()
  }
})

module.exports = router
