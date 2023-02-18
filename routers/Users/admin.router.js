const { createAdmin, findAllAdmins, findOneAdmin, deleteAdmin, login, updateAdmin } = require('../../controllers/Users/admin.controller')

const Router = require('express').Router()

//post
Router.route("/create").post(createAdmin);
Router.route("/login").post(login);
//get
Router.route("/getAll").get(findAllAdmins);
Router.route("/getById/:adminId").get(findOneAdmin);
//put
Router.route("/update/:adminId").put(updateAdmin);
//delete
Router.route("/delete/:adminId").delete(deleteAdmin);

module.exports = Router 