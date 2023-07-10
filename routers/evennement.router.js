const Router = require("express").Router()
const authMiddleWare = require("../middlewares/auth")
const { deleteEvent, updateSessionEvent, createEvent } = require("../controllers/evennement.controller")
const upload = require('../middlewares/upload')
 

Router.route("/create").post(upload.single('file'), createEvent)
Router.route("/updateEvent/:idSession/:day/:startsAt/:endsAt/:classroom").put(authMiddleWare(["admin", "owner", "super"]), updateSessionEvent)
Router.route("/delete/:idSession").delete(authMiddleWare(["admin", "owner", "super"]), createEvent)


module.exports = Router;
