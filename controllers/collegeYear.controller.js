const CollegeYear = require("../models/collegeYear.model")
const Semester = require("../models/semester.model")

// create a new collegeYear
exports.createCollegeYear = async (req, res) => {
    try {
        if (!req.body.year) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        const collegeYear = await CollegeYear.create(req.body)
        await collegeYear.save()
        return res.status(201).json(collegeYear)
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server ERROR!"
        })
    }
}

// create a new section
exports.createCollegeYearWithSemesters = async (req, res) => {
    try {
        const { semester1, semester2, year} = req.body
        if (!semester1 || !semester2 || !year) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        const sem1 = await Semester.create(semester1)
        const sem2 = await Semester.create(semester2)
        await sem1.save()
        await sem2.save()
        if ( sem1 && sem2 ){
            const collegeYear = await CollegeYear.create({
                year : year,
                semesters : [sem1._id , sem2._id]
            })
            await collegeYear.save()
            if (collegeYear){
                sem1.collegeYear = collegeYear._id
                sem2.collegeYear = collegeYear._id
                await sem1.save()
                await sem2.save()
                return res.status(201).send({
                    collegeYear,
                    created : true
                })
            }else {
                return res.status(204).send({
                    error : "Some error occured while saving the new college year"
                })
            }
        }else{
            return res.status(204).send({
                error : "Some error occured while saving one of the semesters"
            })
        }
    } catch (e) {
        if ( e.code === 11000) {
            return res.status(409).send({
              error : "BadRequest"
            })
        }
        if (e.keyValue?.year){
            return res.status(409).send({
                error : "conflictYear",
                message : "Year already exist"
            })
        }
        return res.status(500).send({
            error: e.message,
            message: "Server ERROR!"
        })
    }
}


// GET All college years 
exports.findAllCollegeYears = (req, res) => {
    try {
        CollegeYear.find({}).then(collegeYears => {
            if (!collegeYears) {
                return res.status(204).send({
                    message: "There is no College years in the database!!",
                    found: false
                })
            }
            return res.status(200).send({
                collegeYears,
                found: true
            })
        }).catch(err => {
            return res.status(400).send({
                error: err.message,
                message: "Some Error occured while getting all the College years"
            })
        })
    } catch (e) {
        return res.status(500).send(({
            error: e.message,
            message: "Server ERROR!"
        }))
    }
}

// GET All college years 
exports.findOneCollegeYear = (req, res) => {
    try {
        if (!req.params.yearId){
            return res.status(400).send({
                error : "BadRequest"
            })
        }
        CollegeYear.findById(req.params.yearId).populate("semesters").then(collegeYear => {
            if (!collegeYear) {
                return res.status(404).send({
                    message: "College year not found!!",
                    found: false
                })
            }
            return res.status(200).send({
                collegeYear,
                found: true
            })
        }).catch(err => {
            return res.status(400).send({
                error: err.message,
                message: "Some Error occured while getting all the College years"
            })
        })
    } catch (e) {
        return res.status(500).send(({
            error: e.message,
            message: "Server ERROR!"
        }))
    }
}


//update college year 
exports.updateCollegeYear =  (req,res) => {
    try{
        if (!req.body.year){
            return res.status(400).send({
                error : "BadRequest"
            })
        }
        console.log(req.body)
        CollegeYear.findOne({ year: req.body.year })
        .populate('semesters')
        .then(  collegeYear => {
            // Modify the post documents associated with the user
            if (collegeYear){
                console.log(collegeYear)
                collegeYear.semesters.forEach((semester, index) => {
                    semester.dateBegin = req.body.semesters[index].dateBegin;
                    semester.dateEnd = req.body.semesters[index].dateEnd;
                    semester.coefficient = req.body.semesters[index].coefficient;
                    semester.save();
                });
                // Save the updated user document
                collegeYear.note = req.body.note
                collegeYear.save().then( data => {
                    if (data){
                        return res.status(200).send({
                            data,
                            updated : true
                        })
                    }
                }).catch(err => {
                    console.log(err.message)
                    return res.status(400).send({
                        error : "some error occured while updating"
                    })
                })
            }else {
                return res.status(404).send({
                    error : "College year is not found"
                })
            }
        }).catch( err => {
            console.log(err)
            return res.status(400).send({
                error : "Some error occured while updating"
            })
        })
    }catch(e) {
        return res.status(500).send({
            error :"Server Error!"
        })
    }
}


// Delete college Year
exports.deleteCollegeYear = (req, res) => {
    try {
        if (!req.params.yearId) {
            return res.status(400).send({
                error: "Bad Request!"
            })
        }
        const { yearId } = req.params
        CollegeYear.findByIdAndRemove(yearId).then(collegeYear => {
            if (!collegeYear) {
                return res.status(404).send({
                    message: "student not found with id " + adminId,
                    deleted: false
                })
            }
            collegeYear.semesters.forEach( (semester) => {
                Semester.findByIdAndRemove(semester._id).then( deletedSemester => {
                    if (!deletedSemester){
                        return res.status(404).send({
                            error : "Semester is not found"
                        })
                    }
                })
            })
            return res.status(200).send({
                message: "CollegeYear deleted Successfully!!",
                deleted: true
            })
        }).catch(err => {
            return res.status(400).send({
                error: err.message
            })
        })
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server error!"
        })
    }
}

