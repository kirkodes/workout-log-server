const { DataTypes }= require("sequelize"); // object destructuring here to extrapolate DataTypes from sequelize
const db = require("../db"); // importing connection to database so we can use sequelize methods

const User = db.define("user", { // user as the parameter will become users in postgres
    username: { // username and passwordhash are columns in our database
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    passwordhash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

module.exports = User;