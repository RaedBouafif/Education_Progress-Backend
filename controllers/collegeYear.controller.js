const CollegeYear = require("../models/collegeYear.model")


// create a new section
exports.createCollegeYear = async (req,res) => {
    try{
        if (!req.body.year){
            return res.status(400).send({
                error : "BadRequest"
            })
        }
        const collegeYear = await CollegeYear.create({year : req.body.year})
        collegeYear.save()
        return res.status(201).send({
            collegeYear,
            created : true
        })
    }catch(e) {
        return res.status(500).send({
            error : e.message,
            message: "Server ERROR!"
        })
    }
}
