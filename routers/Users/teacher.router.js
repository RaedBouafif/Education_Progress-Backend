const Router = require("express").Router();
const {
    create,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    login,
    addSubject,
} = require("../../controllers/Users/teacher.controller");

Router.route("/create").post(create);
Router.route("/login").post(login);
Router.route("/getById/:id").get(getTeacherById);
Router.route("/update/:id").put(updateTeacher);
Router.route("/getAll").get(getAllTeachers);
Router.route("/addSubject/:idTeacher/:idSubject").get(addSubject);

module.exports = Router;
