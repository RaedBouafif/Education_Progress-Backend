const {
    createLog,
    getSessionsLogsBy,
    justifyReport,
    getAllLogs,
    addRate
} = require('../controllers/sessionLogs.controller')
const Router = require('express').Router()

//------------POST------------------/
Router.route("/create").post(createLog)
Router.route("/getSessionsLogsByDate").post(getSessionsLogsBy)
Router.route("/rateSession/:logId/:studentId").post(addRate)


//------------GET------------------/
Router.route("/getAllLogs").get(getAllLogs)
Router.route("/justifyReport/:logId/:studentId").get(justifyReport)


module.exports = Router