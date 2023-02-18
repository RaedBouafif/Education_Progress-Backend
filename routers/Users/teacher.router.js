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
Router.route("/getById/:teacherId").get(getTeacherById);
Router.route("/update/:teacherId").put(updateTeacher);
Router.route("/getAll").get(getAllTeachers);
Router.route("/addSubject/:teacherId/:subjectId").get(addSubject);

module.exports = Router;
