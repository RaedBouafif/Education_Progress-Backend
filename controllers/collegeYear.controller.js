const CollegeYear = require("../models/collegeYear.model")
const Semester = require("../models/semester.model")
const moment = require("moment-timezone")
const { DateTime } = require('luxon')
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
        console.log(e.message)
        return res.status(500).send({
            error: e.message,
            message: "Server ERROR!"
        })
    }
}

// create a new section
exports.createCollegeYearWithSemesters = async (req, res) => {
    try {
        const { semester1, semester2, year } = req.body
        if (!semester1 || !semester2 || !year) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        const dateBegin1 = DateTime.fromISO(semester1.dateBegin, { zone: 'utc' })
        var begin1 = dateBegin1.toISO({ includeOffset: false })
        const finishDate1 = DateTime.fromISO(semester1.dateEnd, { zone: 'utc' })
        var finish1 = finishDate1.toISO({ includeOffset: false })
        const dateBegin2 = DateTime.fromISO(semester2.dateBegin, { zone: 'utc' })
        var begin2 = dateBegin2.toISO({ includeOffset: false })
        const finishDate2 = DateTime.fromISO(semester2.dateEnd, { zone: 'utc' })
        var finish2 = finishDate2.toISO({ includeOffset: false })
        begin1 = new Date(begin1)
        finish1 = new Date(finish1)
        begin2 = new Date(begin2)
        finish2 = new Date(finish2)
        const sem1 = await Semester.create({ ...semester1, dateBegin: begin1, dateEnd: finish1 })
        const sem2 = await Semester.create({ ...semester2, dateBegin: begin2, dateEnd: finish2 })
        await sem1.save()
        await sem2.save()
        if (sem1 && sem2) {
            const collegeYear = await CollegeYear.create({
                year: year,
                semesters: [sem1._id, sem2._id]
            })
            await collegeYear.save()
            if (collegeYear) {
                sem1.collegeYear = collegeYear._id
                sem2.collegeYear = collegeYear._id
                await sem1.save()
                await sem2.save()
                return res.status(201).send({
                    collegeYear,
                    created: true
                })
            } else {
                return res.status(204).send({
                    error: "Some error occured while saving the new college year"
                })
            }
        } else {
            return res.status(204).send({
                error: "Some error occured while saving one of the semesters"
            })
        }
    } catch (e) {
        console.log(e.message)
        if (e.code === 11000) {
            return res.status(409).send({
                error: "BadRequest"
            })
        }
        if (e.keyValue?.year) {
            return res.status(409).send({
                error: "conflictYear",
                message: "Year already exist"
            })
        }
        return res.status(500).send({
            error: e.message,
            message: "Server ERROR!"
        })
    }
}

//find all college years without population
exports.findAllToPlot = async (req,res) => {
    try{
        var collegeYears = await CollegeYear.find({}, {semesters: 0, note : 0})
        if (!collegeYears){
            return res.status(204).send({
                message: "No CollegeYears yet"
            })
        }
        collegeYears.sort((a, b) => (a.year > b.year) ? 1 : -1)
        returnedData = collegeYears.map((element) => element.year)
        return res.status(200).send(returnedData)
    }catch(e){
        console.log(e)
        return res.status(500).send({
            error : e.message,
            message: "Server Error"
        })
    }
}

// GET All college years 
exports.findAllCollegeYears = (req, res) => {
    try {
        CollegeYear.find({}).populate({ path: "semesters", options: { sort: { dateBegin: 1 } } }).then(collegeYears => {
            if (!collegeYears) {
                return res.status(204).send({
                    message: "There is no College years in the database!!",
                    found: false
                })
            }
            return res.status(200).send({ collegeYears, found: true })
        }).catch(err => {
            return res.status(400).send({
                error: err.message,
                message: "Some Error occured while getting all the College years"
            })
        })
    } catch (e) {
        console.log(e.message)
        return res.status(500).send(({
            error: e.message,
            message: "Server ERROR!"
        }))
    }
}

// GET All college years 
// exports.findOneCollegeYear = (req, res) => {
//     try {
//         if (!req.params.yearId){
//             return res.status(400).send({
//                 error : "BadRequest"
//             })
//         }
//         CollegeYear.findById(req.params.yearId).populate({ path :"semesters",  options: { sort: { dateBegin: 1 } } }).then(collegeYear => {
//             if (!collegeYear) {
//                 return res.status(404).send({
//                     message: "College year not found!!",
//                     found: false
//                 })
//             }
//             return res.status(200).send({
//                 collegeYear,
//                 found: true
//             })
//         }).catch(err => {
//             return res.status(400).send({
//                 error: err.message,
//                 message: "Some Error occured while getting all the College years"
//             })
//         })
//     } catch (e) {
//         return res.status(500).send(({
//             error: e.message,
//             message: "Server ERROR!"
//         }))
//     }
// }


//update college year 
exports.updateCollegeYear = async (req, res) => {
    try {
        const { semesters, year } = req.body
        if (!year) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        const collegeYear = await CollegeYear.findOne({ year: req.body.year }).populate({ path: "semesters", options: { sort: { dateBegin: 1 } } })
            .populate('semesters')
        if (collegeYear) {
            for (let semester of collegeYear.semesters) {
                const foundSemester = semesters.find((element) => element._id == semester._id.toString())
                if (foundSemester) {
                    console.log(foundSemester)
                    const dateBegin = DateTime.fromISO(foundSemester.dateBegin, { zone: 'utc' })
                    var sameDate = dateBegin.toISO({ includeOffset: false })
                    const dateEnd = DateTime.fromISO(foundSemester.dateEnd, { zone: 'utc' })
                    var sameDate2 = dateEnd.toISO({ includeOffset: false })
                    // const dateBegin = moment.tz(new Date(foundSemester.dateBegin), 'Europe/Paris').toDate()
                    // const dateEnd = moment.tz(new Date(foundSemester.dateEnd), 'Europe/Paris').toDate()
                    sameDate = new Date(sameDate)
                    sameDate2 = new Date(sameDate2)
                    console.log(new Date(sameDate.setDate(sameDate.getDate() + 1)))
                    await Semester.findByIdAndUpdate(semester._id, { dateBegin: sameDate, dateEnd: sameDate2, coefficient: foundSemester.coefficient })
                }
            }
            await collegeYear.save()
            return res.status(200).send(collegeYear)
        } else {
            return res.status(404).send({
                error: "College year is not found"
            })
        }
        // .then(  collegeYear => {
        //     // Modify the post documents associated with the user
        //     if (collegeYear){
        //         console.log(collegeYear)
        //         collegeYear.semesters.forEach((semester, index) => {
        //             semester.dateBegin = req.body.semesters[index].dateBegin;
        //             semester.dateEnd = req.body.semesters[index].dateEnd;
        //             semester.coefficient = req.body.semesters[index].coefficient;
        //             semester.save();
        //         });
        //         // Save the updated user document
        //         collegeYear.note = req.body.note
        //         collegeYear.save().then( data => {
        //             if (data){
        //                 return res.status(200).send({
        //                     data,
        //                     updated : true
        //                 })
        //             }
        //         }).catch(err => {
        //             console.log(err.message)
        //             return res.status(400).send({
        //                 error : "some error occured while updating"
        //             })
        //         })

        // }).catch( err => {
        //     console.log(err)
        //     return res.status(400).send({
        //         error : "Some error occured while updating"
        //     })
        // })
    } catch (e) {
        console.log(e.message)
        return res.status(500).send({
            error: "Server Error!"
        })
    }
}


// Delete college Year
// exports.deleteCollegeYear = (req, res) => {
//     try {
//         if (!req.params.yearId) {
//             return res.status(400).send({
//                 error: "Bad Request!"
//             })
//         }
//         const { yearId } = req.params
//         CollegeYear.findByIdAndRemove(yearId).then(collegeYear => {
//             if (!collegeYear) {
//                 return res.status(404).send({
//                     message: "student not found with id " + adminId,
//                     deleted: false
//                 })
//             }
//             collegeYear.semesters.forEach((semester) => {
//                 Semester.findByIdAndRemove(semester._id).then(deletedSemester => {
//                     if (!deletedSemester) {
//                         return res.status(404).send({
//                             error: "Semester is not found"
//                         })
//                     }
//                 })
//             })
//             return res.status(200).send({
//                 message: "CollegeYear deleted Successfully!!",
//                 deleted: true
//             })
//         }).catch(err => {
//             return res.status(400).send({
//                 error: err.message
//             })
//         })
//     } catch (e) {
//         return res.status(500).send({
//             error: e.message,
//             message: "Server error!"
//         })
//     }
// }

