const {
    createAdmin,
    findAllAdmins,
    findOneAdmin,
    deleteAdmin,
    login,
    updateAdmin,
    welcome,
    logout,
} = require("../../controllers/Users/admin.controller");
const authMiddleWare = require("../../middlewares/auth");
const Router = require("express").Router();

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

Router.route("/welcome").get(authMiddleWare, welcome);
Router.route("/logout").get(logout);

module.exports = Router;
