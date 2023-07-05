const { createLibraryExam, findAllLibraries } = require("../controllers/libraryExams.controller")
const Router = require("express").Router()
const authMiddleWare = require("../middlewares/auth");
const upload = require('../middlewares/upload')



/*-----------GET----------------*/
Router.route("/create").post(upload.single('file'), createLibraryExam)
Router.route("/getAllExamsLibrary").get(authMiddleWare(["admin", "owner", "super", "teacher"]), findAllLibraries)


module.exports = Router;
