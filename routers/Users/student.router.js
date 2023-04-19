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
    countDocsss
} = require("../../controllers/Users/student.controller");
const {
    saveStudentAbsence,
    getStudentPresencesByYear,
    justifyAbsence,
    saveStudentPresence,
} = require("../../controllers/studentPresence.controller");
const upload = require('../../middlewares/upload')

const Router = require("express").Router();


//get
Router.route("/getById/:studentId").get(findOneStudent);
Router.route("/getByIdWithParent/:studentId").get(findOneStudentWithParent);
Router.route("/getAll").get(findAllStudents);
Router.route("/getAllWithParent").get(findAllStudentsWithParent);
Router.route("/graduated/:studentId/:groupId").get(graduationStudent);
Router.route("/permutation/:studentId/:groupId").get(permutationStudent);
Router.route("/getAllToassign").get(findAllStudentsWithFilter)
//post
//upload.single('image'), 
Router.route("/create").post(createStudent);
Router.route("/login").post(login);
//put
Router.route("/update/:studentId").put(updateStudent);
//delete
Router.route("/delete/:studentId").delete(deleteStudent);

//////presence

Router.route("/saveStudentPresence").post(saveStudentPresence);
Router.route("/saveStudentAbsence").post(saveStudentAbsence);
Router.route("/getStudentPresencesByYear/:studentId/:collegeYear").get(getStudentPresencesByYear);
Router.route("/justifyAbsence/:absenceId").get(justifyAbsence);
Router.route("/count").get(countDocsss)

module.exports = Router;
