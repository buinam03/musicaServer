const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.pass, {
    host: env.db.host,
    dialect: 'mysql',
    logging: false,
});

const connectDatabase = async () => {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
};

module.exports = { sequelize, connectDatabase };
