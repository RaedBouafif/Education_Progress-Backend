const CollegeYear = require("../models/collegeYear.model")


// create a new section
exports.createCollegeYear = async (req,res) => {
    try{
        const year = req.params.year
        if (!year){
            return res.status(400).send({
                error : "BadRequest"
            })
        }
        const collegeYear = await CollegeYear.create({year : year})
        collegeYear.save()
    }catch(e) {
        return res.status(500).send({
            error : e.message,
            message: "Server ERROR!"
        })
    }
}
