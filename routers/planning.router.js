const {
    create,
    getPlanningByWeek,
    getPlanningByNextWeek,
    getPlanningByPredWeek,
    getCurrentPlanning,
    addSessionToPlanning,
    updateSessionFromPlanning,
    deleteSessionFromPlanning,
    switchSessionsFromPlanning,
    getAvailableGroups,
    checkSessionDurationAvailability,
    findAvailableClassroms,
    findAvailableTeachers,
    toggleCancelSession,
    getTeacherPlanning,
    getCurrentTeacherPlanning,
    getNextTeacherPlanning,
    getPredTeacherPlanning,
    changeTeacherController
} = require("../controllers/planning.controller");

const Router = require("express").Router();
const authMiddleWare = require("../middlewares/auth")
//---POST---//
Router.route("/create").post(authMiddleWare(["admin", "super", "owner"]), create);
Router.route("/addSession").post(authMiddleWare(["admin", "super", "owner"]), addSessionToPlanning)
Router.route("/updateSession").post(authMiddleWare(["admin", "super", "owner"]), updateSessionFromPlanning)
Router.route("/switchSessions").post(authMiddleWare(["admin", "super", "owner"]), switchSessionsFromPlanning)
Router.route("/checkDurationAvailability").post(authMiddleWare(["owner", "admin", "teacher", "super"]), checkSessionDurationAvailability)
Router.route("/getAvailableClassrooms").post(authMiddleWare(["owner", "admin", "teacher", "super"]), findAvailableClassroms)
Router.route("/getAvailableTeachers/:subjectId").post(authMiddleWare(["owner", "admin", "teacher", "super"]), findAvailableTeachers)
Router.route("/availableGroups").post(authMiddleWare(["owner", "admin", "teacher", "super"]), getAvailableGroups)



//---GET---//
Router.route("/getByWeek/:collegeYear/:group/:week").get(authMiddleWare(["admin", "super", "owner"]), getPlanningByWeek)
Router.route("/getNextWeek/:collegeYear/:group/:week").get(authMiddleWare(["admin", "super", "owner"]), getPlanningByNextWeek)
Router.route("/getPredWeek/:collegeYear/:group/:week").get(authMiddleWare(["admin", "super", "owner"]), getPlanningByPredWeek)
Router.route("/getCurrentWeek/:collegeYear/:group").get(authMiddleWare(["admin", "super", "owner"]), getCurrentPlanning)
Router.route("/toggleCancelSession/:sessionId/:status").get(authMiddleWare(["admin", "super", "owner"]), toggleCancelSession)
Router.route("/getTeacherPlanning/:collegeYear/:week/:idTeacher").get(authMiddleWare(["admin", "super", "owner", "teacher"]), getTeacherPlanning)
//teacher Template
Router.route("/getTeacherCurrentWeek/:collegeYear/:idTeacher").get(authMiddleWare(["admin", "super", "owner", "teacher"]), getCurrentTeacherPlanning)
Router.route("/getTeacherPredWeek/:collegeYear/:week/:idTeacher").get(authMiddleWare(["admin", "super", "owner", "teacher"]), getPredTeacherPlanning)
Router.route("/getNextTeacherWeek/:collegeYear/:week/:idTeacher").get(authMiddleWare(["admin", "super", "owner", "teacher"]), getNextTeacherPlanning)




//---DELETE---//*
// Router.route("/deleteById/:planningId").delete(deleteById);
Router.route("/deleteSession/:planningId/:sessionId").delete(authMiddleWare(["admin", "super", "owner"]), deleteSessionFromPlanning)

//---UPDATE---//
Router.route("/changeTeacher/:sessionId/:idSubTeacher").put(authMiddleWare(["admin", "owner", "super"]), changeTeacherController)

module.exports = Router;
