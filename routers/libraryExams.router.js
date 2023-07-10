const { createLibraryExam, findAllLibraries, getExam, deleteExamLibrary } = require("../controllers/libraryExams.controller")
const Router = require("express").Router()
const authMiddleWare = require("../middlewares/auth");
const upload = require('../middlewares/upload')
const path = require("path")


/*-----------GET----------------*/
Router.route("/getExam").post(authMiddleWare(["admin", "super", "owner"]), getExam)
Router.route("/create").post(upload.single('file'), createLibraryExam)
Router.route("/deleteLibrary/:libraryId").delete(authMiddleWare(["admin", "super", "owner"]), deleteExamLibrary)
Router.route("/getAllExamsLibrary").get(findAllLibraries)
Router.route("/download/:fileName").get(authMiddleWare(["admin", "super", "owner", "teacher"]), (req, res) => {
    const fileName = req.params.fileName
    const filePath = path.join(__dirname, `../uploads/`, fileName)
    res.download(filePath, (err) => {
        if (err) {
            console.log(err)
            res.status(400).send({ message: "Some error occured while downloading the file" })
        }
    })
})


module.exports = Router;
