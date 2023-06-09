const {
    createAdmin,
    findAllAdmins,
    findOneAdmin,
    deleteAdmin,
    login,
    updateAdmin,
    welcome,
    logout,
    findAdminByName,
    countDocsss
} = require("../../controllers/Users/admin.controller");
const authMiddleWare = require("../../middlewares/auth");
const Router = require("express").Router();

//post
Router.route("/create").post(authMiddleWare(["super", "owner"]), createAdmin);
Router.route("/login").post(login);
//get
Router.route("/getAll").get(authMiddleWare(["super", "owner"]), findAllAdmins);
Router.route("/getById/:adminId").get(authMiddleWare(["super", "owner", "admin", "teacher"]), findOneAdmin);
Router.route("/findAdminByName/:word").get(authMiddleWare(["owner", "admin", "teacher", "super"]), findAdminByName)
//put
Router.route("/update/:adminId").put(authMiddleWare(["super", "owner"]), updateAdmin);
//delete
Router.route("/delete/:adminId").delete(authMiddleWare(["super", "owner"]), deleteAdmin);

Router.route("/welcome").get(authMiddleWare(["owner", "admin", "teacher", "super"]), welcome);
Router.route("/logout").get(logout);
Router.route("/count").get(countDocsss)

module.exports = Router;
