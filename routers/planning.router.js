const {
    create,
    getAll,
    getById,
    deleteById,
    update,
    createInitialTemplate,
    createOneSession,
    getTemplate,
    getPlanning,
    refreshPlanning
} = require("../controllers/planning.controller");

const Router = require("express").Router();

//---POST---//
Router.route("/create").post(create);
// Router.route("/createTemp").post(createInitialTemplate);
// Router.route("/test").post(createOneSession);

//---GET---//
// Router.route("/getAll").get(getAll);
// Router.route("/getById/:planningId").get(getById);
// Router.route("/getTemplate/:groupId").get(getTemplate);
// Router.route("/refreshPlanning/:week/:groupId/:semesterId").get(refreshPlanning)
// Router.route("/getPlanning/:week/:groupId/:semesterId").get(getPlanning);

//---DELETE---//*
// Router.route("/deleteById/:planningId").delete(deleteById);

//---UPDATE---//
// Router.route("/update/:planningId").put(update);
module.exports = Router;
