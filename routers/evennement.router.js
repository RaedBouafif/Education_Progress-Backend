const Router = require("express").Router()
const authMiddleWare = require("../middlewares/auth")
const { deleteEvent, updateSessionEvent, createEvent } = require("../controllers/evennement.controller")
const upload = require('../middlewares/upload')
const path = require("path")


Router.route("/create").post(upload.single('file'), createEvent)
Router.route("/updateEvent/:idSession/:day/:startsAt/:endsAt/:classroom").put(authMiddleWare(["admin", "owner", "super"]), updateSessionEvent)
Router.route("/delete/:idSession").delete(authMiddleWare(["admin", "owner", "super"]), createEvent)
Router.route("/download/:fileName").get(authMiddleWare(["admin", "super", "owner", "teacher"]), (req, res) => {
    const fileName = req.params.fileName
    const filePath = path.join(__dirname, `../uploads/`, fileName)
    res.download(filePath, (err) => {
        if (err) {
            console.log(err)
            res.status(400).send({ message: "Some error occured while downloading the file" })
        }
    })
})


module.exports = Router;
