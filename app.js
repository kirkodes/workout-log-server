require("dotenv").config();
const Express = require("express"); 
const app = Express(); 
const dbConnection = require("./db");

const controllers = require("./controllers");

app.use(Express.json());

app.use(require("./middleware/headers"));

app.use("/user", controllers.userController);
app.use("/log", controllers.logController);

dbConnection.authenticate()
    .then(() => dbConnection.sync())
    .then(() => {
        app.listen(3000, () => {
            console.log(`[Server]: App is listening on 3000.`);
        });
    })
    .catch((err) => { 
        console.log(`[Server]: Server crashed. Error = ${err}`);
    });
