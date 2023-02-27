const {
    createStudent,
    login,
    updateStudent,
    deleteStudent,
    findOneStudent,
    findAllStudents,
    findOneStudentWithParent,
    findAllStudentsWithParent,
    graduationStudent,
    permutationStudent,
} = require("../../controllers/Users/student.controller");
const {
    getStudentAbsence,
    getStudentPresence,
    justifyStudentAbsence,
    saveStudentPresence,
} = require("../../controllers/studentPresence.controller");

const Router = require("express").Router();


//get
Router.route("/getById/:studentId").get(findOneStudent);
Router.route("/getByIdWithParent/:studentId").get(findOneStudentWithParent);
Router.route("/getAll").get(findAllStudents);
Router.route("/getAllWithParent").get(findAllStudentsWithParent);
Router.route("/graduated/:studentId/:groupId").get(graduationStudent);
Router.route("/permutation/:studentId/:groupId").get(permutationStudent);
//post
Router.route("/create").post(createStudent);
Router.route("/login").post(login);
//put
Router.route("/update/:studentId").put(updateStudent);
//delete
Router.route("/delete/:studentId").delete(deleteStudent);

//////presence

Router.route("/savePresence").post(saveStudentPresence);
Router.route("/getAbsence").get(getStudentAbsence);
Router.route("/getPresence").get(getStudentPresence);
Router.route("/justifyAbsence/:absenceId").get(justifyStudentAbsence);

module.exports = Router;
