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
Router.route("/create").post(authMiddleWare(["owner", "super", "admin"]), create);
Router.route("/login").post(login);

//---put requests---
Router.route("/update/:teacherId").put(authMiddleWare(["owner", "super", "admin"]), updateTeacher);
//---get requests---
Router.route("/getById/:teacherId").get(authMiddleWare(["owner", "super", "admin", "teacher"]), getTeacherById);
Router.route("/getAll").get(authMiddleWare(["owner", "super", "admin"]), getAllTeachers);
Router.route("/getTeachersByName/:word").get(authMiddleWare(["owner", "admin", "teacher", "super"]), findTeacherByName)
Router.route("/addSubject/:teacherId/:subjectId").get(authMiddleWare(["owner", "super", "admin"]), addSubject);
Router.route("/count").get(countDocsss)
Router.route("/getListOfTeachers").get(authMiddleWare(["owner", "super", "admin", "teacher"]), getListOfTeachers)
Router.route("/getTeacherProfile/:teacherId").get(authMiddleWare(["owner", "super", "admin"]), getTeacherProfile)
// Router.route("/welcome").get(authMiddleWare, welcome);
// Router.route("/logout").get(logout);


//---delete requests---//
Router.route("/delete/:teacherId").delete(authMiddleWare(["owner", "super", "admin"]), deleteTeacher)
Router.route("/removeSubject/:teacherId/:subjectId").delete(authMiddleWare(["owner", "super", "admin"]), removeSubject)

module.exports = Router;
