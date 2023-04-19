const { compareSync } = require("bcryptjs")
const SessionLogs = require("../models/sessionLogs.model")

exports.createLog = async (req, res) => {
    try {
        //session , startedAt , endedAt , canceled , reports! : [{studentId:,studentName:}]
        const log = await SessionLogs.create(req.body)
        await log.save()
        return res.status(201).json({
            log,
            created: true
        })
    } catch (e) {
        console.log(e)
        if (e.code === 11000) {
            return res.status(409).json({
                error: "conflict"
            })
        }
        else if (e.errors?.session?.properties?.message === "SessionRequired") {
            return res.status(400).json({
                error: "SessionRequired"
            })
        }
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}


//find All sessions by (CollegeYear or semester)
exports.getSessionsLogsBy = async (req, res) => {
    try {
        const sessionsLogs = await SessionLogs.find({ ...req.body, startedAt: { $gte: new Date(req.body.dateBegin), $lte: new Date(req.body.dateEnd) } })
        return sessionsLogs
            ? res.status(200).send({
                found: true,
                sessionsLogs
            })
            : res.status(400).send({
                found: false,
                message: "There is no Session passed between " + req.body.dateBegin + " And " + req.body.dateEnd
            })
    } catch (e) {
        return res.status(500).json({
            error: e.message,
            error: "Server ERROR!"
        })
    }
}

//justify report
exports.justifyReport = async (req, res) => {
    // data passed from params : { logId , studentId}
    try {
        const { logId, studentId } = req.params
        const justifiedReport = await SessionLogs.findOneAndUpdate(
            {
                _id: logId, 'reports.studentId': studentId
            },
            {
                $set: { 'reports.$.justifiedReports': true }
            },
            { new: true, runValidators: true }
        )
        return justifiedReport
            ? res.status(200).send({
                justified: true,
                justifiedReport
            })
            :
            res.status(404).send({
                justified: false,
                message: "Session Log with Id : " + logId + " Not Found OR Student with Id : " + studentId + " Is not Reported"
            })
    } catch (e) {
        console.log(e)
        if (e.code === 11000) {
            return res.status(409).json({
                error: "conflict"
            })
        }
        return res.status(500).json({
            error: e.message,
            error: "Server ERROR!"
        })
    }
}


//find All sessionsLogs
exports.getAllLogs = async (req, res) => {
    try {
        const sessionsLogs = await SessionLogs.findAll({})
        return sessionsLogs
            ? res.status(200).send({
                found: true,
                sessionsLogs
            })
            : res.status(204).send({
                found: false,
                message: "DataBase is Empty from Logs"
            })
    } catch (e) {
        return res.status(500).json({
            error: e.message,
            error: "Server ERROR!"
        })
    }
}

exports.addRate = async (req, res) => {//after session 
    try {
        const { logId, studentId } = req.params
        //req.body containe rate data directly
        const log = await SessionLogs.findById(logId)
        if (log) {
            var rates = []
            if (!log.rates.find((element) => element.studentId.toString() === studentId)) {
                log.rates.push(req.body)
                rates = await log.save()
            }
            return res.status(200).json({
                found: true,
                rates
            })
        } else {
            return res.status(404).json({
                found: false
            })
        }
    } catch (e) {
        console.log(e)
        if (e.code === 11000) {
            return res.status(409).json({
                error: "conflict"
            })
        }
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}