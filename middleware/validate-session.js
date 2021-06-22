const jwt = require("jsonwebtoken"); 
const { UserModel } = require("../models"); // we want to find info about a specific use so we will need to communicate with our user model in our database

const validateSession = async (req, res, next) => { // asynchronous fat arrow function called validateJWT. takes in those 3 params
    if (req.method == "OPTIONS") { // this function starts with a conditional statement that checks the method of the request. Sometimes a request will come in as OPTIONS rather than POST, GET, PUT, DELETE. OPTIONS is the first part of the pre-flight request. This determines if the actual request is safe to send or not.
        next(); // if there IS a preflight request, we pass in the 3rd param, declared in the asynchronous function. req, res, and next are parameters that can only be accessed by express middleware functions. next() is a nested middleware function that, when called, passes control to the next middleware function
    } else if ( // if we're dealing with a GET, POST, PUT, DELETE request, we want to see if there is any data in authorization header of the incoming request AND if that string includes the word Bearer
        req.headers.authorization &&
        req.headers.authorization.includes("Bearer")
    ) {
        const { authorization } = req.headers; // object deconstruction to pull the value of the authorization header and store it in a variable called authorization
        // console.log("authorization -->", authorization);
        const payload = authorization
        ? jwt.verify(
            authorization.includes("Bearer") // if we have token that includes the word Bearer, we extrapolate and return just the token from the whole string. If the word Bearer is not included in the authorization header, the just return the token
            ? authorization.split(" ")[1]
            : authorization,
            process.env.JWT_SECRET
        ) // dependent on the token and the conditional statement, the value of payload will either be the token excluding the word Bearer or undefined
        : undefined;

        // console.log("payload -->", payload);

        if (payload) {
            let foundUser = await UserModel.findOne({ where: { id: payload.id } }); // if payload comes back truthy, we use Sequelize's findOne method to look for a user in our UserModel where the ID of the user in database matches the ID stored in the token. It then stores the value of the located user in a variable called foundUser
            // console.log("foundUser -->", foundUser);
            if (foundUser) {
                // console.log("request -->", req);
                req.user = foundUser; 
                next();
            } else {
                res.status(400).send({ message: "Not Authorized" }); // if our code can't locate a user in the database
            }
        } else {
            res.status(401).send({ message: "Invalid token" }); // if the payload comes back as undefined
        }
    } else {
        res.status(403).send({ message: "Forbidden" }); // if the authorization object in the headers object of the request is empty or doesn't include the word Bearer
    }
};

module.exports = validateSession;