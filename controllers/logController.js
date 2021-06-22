const Express = require("express");// importing Express framework, stored inside variable. This becomes my gateway to using express methods
const router = Express.Router(); // new variable called router, that uses the Express variable which gives me access to the Router() method. This method will return a router object for me
let validateSession = require("../middleware/validate-session");
const { LogModel } = require("../models");
const Log = require("../models/log");

/*
===========
Log Create
===========
*/
router.post("/", validateSession, async (req, res) => {
    const { description, definition, result, owner_id } = req.body.log;
    const { id } = req.user;
    const logEntry = {
        description,
        definition,
        result,
        owner_id: id
    }
    try {
        const newLog = await LogModel.create(logEntry);
        res.status(200).json(newLog);
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

/*
============================
Get Logs for Individual User
============================
*/
router.get("/", validateSession, async(req, res) => {
    const { id } = req.user;
    try {
        const userWorkoutLogs = await LogModel.findAll({
            where: {
                owner_id: id
            }
        });
        res.status(200).json(userWorkoutLogs);
    } catch (error) {
        res.status(500).json({ error })
    }
});

/*
============================
Get Logs for User by Log id
============================
*/
router.get("/:id", validateSession, async(req, res) => {
    const logById = req.params.id;

    try {
        let idLog = await Log.findOne({
            where: {
                id: logById,
                owner_id: req.user.id
            }
        });
        res.status(200).json({
            message: "Here is the log you wanted:",
            idLog
        });
    } catch (error) {
        response.status(500).json({
            error: `You have an error: ${error}`,
        });
    }
})

/*
============================
Update Log by Specific Id & User
============================
*/
router.put("/:id", validateSession, async (req, res) => {
    const { description, definition, result } = req.body.log;

    const query = {
        where: {
            id: req.params.id,
            owner_id: req.user.id
        },
    };

    const updatedLog = {
        description: description,
        definition: definition,
        result: result,
    };

    try {
        const update = await Log.update(updatedLog, query);
        res.status(200).json({
            message: "You've updated your workout log!",
            update,
        });
    } catch (error) {
        res.status(500).json({
            message: `Something went wrong with your update ${error} :(.`
        });
    }
});

/*
===================
Delete a Log by Specific Id
===================
*/
router.delete("/:id", validateSession, async (req, res) => {
    const ownerId = req.user.id;
    const logId = req.params.id;

    try {
        const query = {
            where: {
                id: logId,
                owner_id: ownerId
            }
        };
        await LogModel.destroy(query);
        res.status(200).json({ message: "Your workout log has been successfully deleted." });
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

module.exports = router;