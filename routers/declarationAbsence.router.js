const Router = require("express").Router()
const authMiddleWare = require("../middlewares/auth")
const { createDeclaration, deleteDeclarationAbsence, changeAbsenceStatus } = require("../controllers/declarationAbsence.controller")
const upload = require("../middlewares/upload")

Router.route("/create").post(upload.single('file'), createDeclaration)
Router.route("/delete/:idAbsence").delete(authMiddleWare(["admin", "super", "owner", "teacher"]), deleteDeclarationAbsence)
Router.route("/changeState/:idAbsence").get(authMiddleWare(["admin", "super", "owner", "teahcer"]), changeAbsenceStatus)

module.exports = Router