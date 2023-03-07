const {
    createParent,
    getParentById,
    updateParent,
    login,
    getParentAndChildsById,
    getAllParents
} = require("./../../controllers/Users/parent.controller");
const upload = require("../../middlewares/upload")
const Router = require("express").Router();
// upload.single('image'),
Router.route("/create").post(createParent);
Router.route("/login").post(login);
Router.route("/getById/:parentId").get( getParentById);
Router.route("/update/:parentId").put(updateParent);
Router.route("/getWithChildsById/:parentId").get(getParentAndChildsById);
Router.route("/getAll").get(getAllParents);

module.exports = Router;
