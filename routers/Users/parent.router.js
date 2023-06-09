const {
    createParent,
    getParentById,
    updateParent,
    login,
    getParentAndChildsById,
    getAllParents,
    deleteParent,
    findParentsByName,
    getParentProfile,
    countDocsss
} = require("./../../controllers/Users/parent.controller");
const upload = require("../../middlewares/upload")
const Router = require("express").Router();
const authMiddleWare = require("../../middlewares/auth");
//post
// Router.route("/filter").post(filterParents)
Router.route("/create").post(authMiddleWare(["admin", "owner", "super"]), createParent);
Router.route("/login").post(login);
//get
Router.route("/getById/:parentId").get(authMiddleWare(["admin", "owner", "super", "teacher"]), getParentById);
Router.route("/getWithChildsById/:parentId").get(authMiddleWare(["admin", "owner", "super"]), getParentAndChildsById);
Router.route("/getParentsByName/:word").get(authMiddleWare(["owner", "admin", "teacher", "super"]), findParentsByName)
Router.route("/getAll").post(authMiddleWare(["admin", "owner", "super"]), getAllParents);
Router.route("/getParentProfile/:parentId").get(authMiddleWare(["admin", "owner", "super"]), getParentProfile)
Router.route("/count").get(countDocsss)
//put
Router.route("/update/:parentId").put(authMiddleWare(["admin", "owner", "super"]), updateParent);
//delete
Router.route("/delete/:parentId").delete(authMiddleWare(["admin", "owner", "super"]), deleteParent)

module.exports = Router;
