const Router = require("express").Router()
const {
    createNote,
    getExamNotes
} = require("../controllers/note.controller")
const authMiddleWare = require("../middlewares/auth")


Router.route("/create").post(authMiddleWare(["admin", "super", "owner"]), createNote)
Router.route("/getExamNotes/:examId").get(authMiddleWare(["admin", "super", "owner"]), getExamNotes)

module.exports = Router