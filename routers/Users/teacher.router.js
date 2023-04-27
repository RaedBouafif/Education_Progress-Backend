const Router = require("express").Router();
const {
    create,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    login,
    addSubject,
    removeSubject,
    deleteTeacher,
    countDocsss,
    getListOfTeachers,
    findTeacherByName,
    getTeacherProfile,
    welcome,
    logout

} = require("../../controllers/Users/teacher.controller");
const authMiddleWare = require("../../middlewares/auth");


//---posts requests---
Router.route("/create").post(create);
Router.route("/login").post(login);

//---put requests---
Router.route("/update/:teacherId").put(updateTeacher);
//---get requests---
Router.route("/getById/:teacherId").get(getTeacherById);
Router.route("/getAll").get(getAllTeachers);
Router.route("/getTeachersByName/:word").get(findTeacherByName)
Router.route("/addSubject/:teacherId/:subjectId").get(addSubject);
Router.route("/count").get(countDocsss)
Router.route("/getListOfTeachers").get(getListOfTeachers)
Router.route("/getTeacherProfile/:teacherId").get(getTeacherProfile)
Router.route("/logout").get(logout);


//---delete requests---//
Router.route("/delete/:teacherId").delete(deleteTeacher)
Router.route("/removeSubject/:teacherId/:subjectId").delete(removeSubject)

module.exports = Router;
