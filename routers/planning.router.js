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
    getTeacherPlanning
} = require("../controllers/planning.controller");

const Router = require("express").Router();

//---POST---//
Router.route("/create").post(create);
Router.route("/addSession").post(addSessionToPlanning)
Router.route("/updateSession").post(updateSessionFromPlanning)
Router.route("/switchSessions").post(switchSessionsFromPlanning)
Router.route("/checkDurationAvailability").post(checkSessionDurationAvailability)
Router.route("/getAvailableClassrooms").post(findAvailableClassroms)
Router.route("/getAvailableTeachers/:subjectId").post(findAvailableTeachers)
Router.route("/availableGroups").post(getAvailableGroups)



//---GET---//
Router.route("/getByWeek/:collegeYear/:group/:week").get(getPlanningByWeek)
Router.route("/getNextWeek/:collegeYear/:group/:week").get(getPlanningByNextWeek)
Router.route("/getPredWeek/:collegeYear/:group/:week").get(getPlanningByPredWeek)
Router.route("/getCurrentWeek/:collegeYear/:group").get(getCurrentPlanning)
Router.route("/toggleCancelSession/:sessionId/:status").get(toggleCancelSession)
Router.route("/getTeacherPlanning/:collegeYear/:week/:idTeacher").get(getTeacherPlanning)



//---DELETE---//*
// Router.route("/deleteById/:planningId").delete(deleteById);
Router.route("/deleteSession/:planningId/:sessionId").delete(deleteSessionFromPlanning)

//---UPDATE---//

module.exports = Router;
