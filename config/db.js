const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: "mysql",
});

const conn = async () => {
    try{
        await sequelize.authenticate();
        console.log("Connection has been established successfully.")
    }
    catch (error){
        console.log(error);
    }
}

console.log("DB Name:", process.env.DB_NAME);
console.log("DB User:", process.env.DB_USER);
console.log("DB Host:", process.env.DB_HOST);

module.exports = {sequelize , conn};