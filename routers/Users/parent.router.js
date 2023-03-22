const {
    createParent,
    getParentById,
    updateParent,
    login,
    getParentAndChildsById,
    getAllParents,
    deleteParent,
    countDocsss
} = require("./../../controllers/Users/parent.controller");
const upload = require("../../middlewares/upload")
const Router = require("express").Router();
//post
// Router.route("/filter").post(filterParents)
Router.route("/create").post(createParent);
Router.route("/login").post(login);
//get
Router.route("/getById/:parentId").get( getParentById);
Router.route("/getWithChildsById/:parentId").get(getParentAndChildsById);
Router.route("/getAll").post(getAllParents);
Router.route("/count").get(countDocsss)
//put
Router.route("/update/:parentId").put(updateParent);
//delete
Router.route("/delete/:parentId").delete(deleteParent)

module.exports = Router;
