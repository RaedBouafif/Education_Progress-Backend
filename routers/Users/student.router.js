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
    findAllStudentsWithFilter,
    countDocsss,
    findStudentsWithName,
    getStudentProfile,
    getLatestStudents
} = require("../../controllers/Users/student.controller");
const {
    saveStudentAbsence,
    getStudentPresencesByYear,
    justifyAbsence,
    saveStudentPresence,
} = require("../../controllers/studentPresence.controller");
const upload = require('../../middlewares/upload')
const authMiddleWare = require("../../middlewares/auth");
const Router = require("express").Router();


//get
Router.route("/getById/:studentId").get(authMiddleWare(["admin", "owner", "super"]), findOneStudent);
Router.route("/getByIdWithParent/:studentId").get(authMiddleWare(["admin", "owner", "super"]), findOneStudentWithParent);
Router.route("/getAll").get(authMiddleWare(["admin", "owner", "super"]), findAllStudents);
Router.route("/getAllWithParent").get(authMiddleWare(["admin", "owner", "super"]), findAllStudentsWithParent);
Router.route("/graduated/:studentId/:groupId").get(authMiddleWare(["admin", "owner", "super"]), graduationStudent);
Router.route("/permutation/:studentId/:groupId").get(authMiddleWare(["admin", "owner", "super"]), permutationStudent);
Router.route("/getAllToassign").get(authMiddleWare(["admin", "owner", "super"]), findAllStudentsWithFilter)
Router.route("/getStudentByName/:word").get(authMiddleWare(["owner", "admin", "teacher", "super"]), findStudentsWithName)
Router.route("/getStudentProfile/:studentId").get(authMiddleWare(["admin", "owner", "super"]), getStudentProfile)
Router.route("/getLatestStudents").get(authMiddleWare(["admin", "owner", "super"]), getLatestStudents)
//post
//upload.single('image'), 
Router.route("/create").post(authMiddleWare(["admin", "owner", "super"]), createStudent);
Router.route("/login").post(login);
//put
Router.route("/update/:studentId").put(authMiddleWare(["admin", "owner", "super"]), updateStudent);
//delete
Router.route("/delete/:studentId").delete(authMiddleWare(["admin", "owner", "super"]), deleteStudent);

//////presence

Router.route("/saveStudentPresence").post(authMiddleWare(["owner", "admin", "teacher", "super"]), saveStudentPresence);
Router.route("/saveStudentAbsence").post(authMiddleWare(["owner", "admin", "teacher", "super"]), saveStudentAbsence);
Router.route("/getStudentPresencesByYear/:studentId/:collegeYear").get(authMiddleWare(["owner", "admin", "teacher", "super"]), getStudentPresencesByYear);
Router.route("/justifyAbsence/:absenceId").get(authMiddleWare(["admin", "owner", "super"]), justifyAbsence);
Router.route("/count").get(countDocsss)

module.exports = Router;
