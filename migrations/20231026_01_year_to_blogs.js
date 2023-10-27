const { DataTypes, Op } = require('sequelize')

const currentYear = new Date().getFullYear()

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('blogs', 'year', {
      type: DataTypes.INTEGER
    })
    await queryInterface.addConstraint('blogs', {
      fields: ['year'],
      name:'year_check',
      type: 'check',
      where: {
        year: {
          [Op.between]: [1991, currentYear]
        }
      }
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeConstraint('blogs', 'year_check' )
    await queryInterface.removeColumn('blogs', 'year')
  },
}
