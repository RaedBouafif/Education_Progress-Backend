const { createSection, findAllSections, findSectionByName, changeSectionState, addSubject, removeSubject, updateSection, deleteById } = require('../controllers/section.controller')
const Router = require('express').Router()
const authMiddleWare = require("../middlewares/auth")
//post
Router.route("/create").post(authMiddleWare(["admin", "super", "owner"]), createSection)
//get
Router.route("/getAll").get(authMiddleWare(["admin", "super", "owner", "teacher"]), findAllSections)
Router.route("/getByName/:sectionName").get(authMiddleWare(["admin", "super", "owner", "teacher"]), findSectionByName)
Router.route("/addSubject/:sectionName/:subjectId").get(authMiddleWare(["admin", "super", "owner"]), addSubject)
Router.route("/removeSubject/:sectionName/:subjectId").get(authMiddleWare(["admin", "super", "owner"]), removeSubject)
//put
Router.route("/changeState/:sectionName").put(authMiddleWare(["admin", "super", "owner"]), changeSectionState)
Router.route("/update/:sectionId").post(authMiddleWare(["admin", "super", "owner"]), updateSection)

//delete 
Router.route("/delete/:sectionId").delete(authMiddleWare(["admin", "super", "owner"]), deleteById)


module.exports = Router