const { createSection , findAllSections , findSectionByName, changeSectionState, addSubject } = require('../controllers/section.controller')
const Router = require('express').Router()

//post
Router.route("/create").post(createSection)
//get
Router.route("/getAll").get(findAllSections)
Router.route("/getByName/:sectionName").get(findSectionByName)
Router.route("/addSubject/:sectionName/:subjectId").get(addSubject)
//put
Router.route("/changeState/:sectionName").put(changeSectionState)


module.exports = Router