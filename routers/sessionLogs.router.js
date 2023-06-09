const {
    createLog,
    getSessionsLogsBy,
    justifyReport,
    getAllLogs,
    addRate
} = require('../controllers/sessionLogs.controller')
const Router = require('express').Router()
const authMiddleWare = require("../middlewares/auth")
//------------POST------------------/
Router.route("/create").post(authMiddleWare(["admin", "teacher", "owner", "super"]), createLog)
Router.route("/getSessionsLogsByDate").post(authMiddleWare(["owner", "super"]), getSessionsLogsBy)
Router.route("/rateSession/:logId/:studentId").post(addRate)


//------------GET------------------/
Router.route("/getAllLogs").get(authMiddleWare(["owner", "super"]), getAllLogs)
Router.route("/justifyReport/:logId/:studentId").get(authMiddleWare(["admin", "owner", "super"]), justifyReport)


module.exports = Router