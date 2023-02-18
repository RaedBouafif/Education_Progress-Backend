const Router = require("express").Router();
const {
    create,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    login,
    addSubject,
    removeSubject,
    deleteAll
} = require("../../controllers/Users/teacher.controller");

//---posts requests---
Router.route("/create").post(create);
Router.route("/login").post(login);
//---put requests---
Router.route("/update/:teacherId").put(updateTeacher);
//---get requests---
Router.route("/getById/:teacherId").get(getTeacherById);
Router.route("/getAll").get(getAllTeachers);
Router.route("/addSubject/:teacherId/:subjectId").get(addSubject);
//---delete requests---
Router.route("/removeSubject/:teacherId/:subjectId").delete(removeSubject)
Router.route("/deleteAll").delete(deleteAll)

module.exports = Router;
