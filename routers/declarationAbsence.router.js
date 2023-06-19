const Router = require("express").Router()
const authMiddleWare = require("../middlewares/auth")
const { create, deleteDeclarationAbsence, changeAbsenceStatus} = require("../controllers/declarationAbsence.controller")
const upload = require("../middlewares/upload")


Router.route("/create").post(upload.single('file'), create)
Router.route("/delete/:idAbsence").delete(deleteDeclarationAbsence)
Router.route("/changeState/:idAbsence").get(authMiddleWare(["admin", "super", "owner"]) ,changeAbsenceStatus)

module.exports = Router