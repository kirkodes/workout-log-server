const router = require("express").Router(); 
const { UniqueConstraintError } = require("sequelize/lib/errors");
const { UserModel } = require("../models");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

router.post("/register", async (req, res) => {
    let { username, passwordhash } = req.body.user;

    try {
        const User = await UserModel.create({ // UserModel.create() create makes a new instance of the User model and sends off to db
            username,
            passwordhash: bcrypt.hashSync(passwordhash, 13),
        });

        let token = jwt.sign({id: User.id}, process.env.JWT_SECRET, {expiresIn: 60 * 60 * 24});

        res.status(201).json({
            message: "User successfully registered",
            user: User,
            sessionToken: token
        });
    } catch (err) {
        if (err instanceof UniqueConstraintError) {
            res.status(409).json({
                message: "Email already in use",
            });
        } else {
            res.status(500).json({
                message: "Failed to register user",
            });
        }
    }
});

router.post("/login", async (req, res) => {
    let { username, passwordhash } = req.body.user;

    try {
        const loginUser = await UserModel.findOne({ // after waiting for the data to come back, retrieved data is stored in the variable loginUser
            where: {
                username: username, // if findOne can't locate a matching username, it will provide us with an empty object or null. Null is not an error, so user will get a message that they're logged in. We've added the if else, to make sure that the username comes back as TRUTHY. 
            },
        });
        if (loginUser) {
            let passwordComparison = await bcrypt.compare(passwordhash, loginUser.passwordhash);

            if (passwordComparison) {
                let token = jwt.sign({id: loginUser.id}, process.env.JWT_SECRET, {expiresIn: 60 * 60 * 24});
                res.status(200).json({
                    username: loginUser,
                    message: "User has logged in successfully.",
                    sessionToken: token
                });
            } else {
                res.status(401).json({
                    message: "Incorrect email or password." // this is for incorrect password
                })
            }
        } else {
            res.status(401).json({
                message: "Login has failed. We can't this username." // username does not exist
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Failed to get user logged in. There's an issue with the server... bear with us!"
        })
    }
})


module.exports = router;