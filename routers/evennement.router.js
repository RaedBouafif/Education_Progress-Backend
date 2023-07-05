const Router = require("express").Router()
const authMiddleWare = require("../middlewares/auth")
const { deleteEvent, updateSessionEvent, createEvent } = require("../controllers/evennement.controller")

Router.route("/create").post(authMiddleWare(["admin", "owner", "super"]), createEvent)
Router.route("/updateEvent/:idSession/:day/:startsAt/:endsAt/:classroom").put(authMiddleWare(["admin", "owner", "super"]), updateSessionEvent)
Router.route("/create/:idSession").delete(authMiddleWare(["admin", "owner", "super"]), createEvent)


module.exports = Router;
