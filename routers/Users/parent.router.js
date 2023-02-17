const {
    createParent,
    getParentById,
    updateParent,
    login,
    getParentAndChildsById,
    getAllParents
} = require("./../../controllers/Users/parent.controller");
const Router = require("express").Router();

Router.route("/create").post(createParent);
Router.route("/login").post(login);
Router.route("/getById/:id").get(getParentById);
Router.route("/update/:id").put(updateParent);
Router.route("/getWithChildsById/:id").get(getParentAndChildsById);
Router.route("/getAll").get(getAllParents);

module.exports = Router;
