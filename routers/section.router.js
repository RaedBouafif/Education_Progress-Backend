const { createSection , findAllSections , findSectionByName, changeSectionState, addSubject, removeSubject, updateSection, deleteById } = require('../controllers/section.controller')
const Router = require('express').Router()

//post
Router.route("/create").post(createSection)
//get
Router.route("/getAll").get(findAllSections)
Router.route("/getByName/:sectionName").get(findSectionByName)
Router.route("/addSubject/:sectionName/:subjectId").get(addSubject)
Router.route("/removeSubject/:sectionName/:subjectId").get(removeSubject)
//put
Router.route("/changeState/:sectionName").put(changeSectionState)
Router.route("/update/:sectionId").post(updateSection)

//delete 
Router.route("/delete/:sectionId").delete(deleteById)


module.exports = Router