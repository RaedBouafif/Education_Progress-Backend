const ParentModel = require("./../../models/Users/parent.model.js");
const StudentModel = require("./../../models/Users/student.model")
const bcrypt = require("bcryptjs");
const generateToken = require("./../../functions/generateToken.js");
require("dotenv").config();


exports.createParent = async (req, res) => {
  try {
    console.log(req.body)
    const { firstName, lastName, email, tel, password, gender, adresse, birth, file, note } = req.body
    if (!firstName || !lastName || !email || !tel || !password)
      return res.status(400).json({
        error: "badRequest",
      });
    if (password.length < 6)
      return res.status(400).json({
        error: "passwordMinLength",
      });
    const encryptedPassword = await bcrypt.hash(password, 10);
    const parent = await ParentModel.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      tel: tel,
      password: encryptedPassword,
      gender: gender,
      adresse: adresse,
      birth: birth,
      image: file || null,
      note: note || null
    });
    await parent.save();
    return res.status(201).json({
      created: true,
      parent
    });
  } catch (e) {
    if (e.code === 11000) {
      console.log(e);
      return res.status(409).send({
        error: "BadRequest"
      })
    }
    if (e.keyValue?.email)
      res.status(409).json({
        error: "conflictEmail",
        message: "Email already used",
      });
    else if (e.keyValue?.tel)
      res.status(409).json({
        error: "conflictTel",
        message: "Tel already used",
      });
    else if (e.error?.email) {
      res.status(400).send({
        error: "InvalidEmail"
      })
    }
    else {
      console.log(e);
      return res.status(500).json({
        error: "serverSideError",
      });
    }
  }
};

exports.findParentsByName = async (req, res) => {
  try {
    const { word } = req.params
    const regex = new RegExp(word, "i");
    const parents = await ParentModel.find({
      $expr: {
        $regexMatch: {
          input: { $concat: ["$firstName", " ", "$lastName"] },
          regex: regex,
        },
      }
    }, { password: 0 }).sort({ createdAt: -1 })
    if (parents.length) {
      return res.status(200).json(parents)
    }
    else {
      return res.status(204).json([])
    }
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      error: "serverSideError"
    })
  }
}
//get All parents with filtering
exports.getAllParents = async (req, res) => {
  try {
    const { offset } = req.query
    if (Object.keys(req.body).length === 0) {
      console.log("dqsdqs")
      const numberOfParents = await ParentModel.countDocuments()
      // const totalPages = Math.ceil(numberOfParents / process.env.PAGE_LIMIT)
      if (numberOfParents === 0) {
        return res.status(204).json({
          countDocs: numberOfParents,
          found: false,
          message: "noParents"
        })
      } else {
        const parents = await ParentModel.find({}, { password: 0 }).skip(offset * 10).limit(process.env.PAGE_LIMIT)
        return parents.length ?
          res.status(200).json(
            {
              countDocs: numberOfParents,
              parents,
              found: true
            })
          :
          res.status(204).json(
            {
              countDocs: numberOfParents,
              found: false,
              message: "noParents"
            })
      }
    } else {
      // req.body is not empty => i have a filter
      const fieldKeys = Object.keys(req.body)
      console.log(fieldKeys.length)
      if (fieldKeys.length === 3) {
        // if (req.body.firstName && req.body.lastName && req.body.tel){
        const filter = {
          firstName: { $regex: req.body.firstName, $options: 'i' },
          lastName: { $regex: req.body.lastName, $options: 'i' },
          tel: { $regex: req.body.tel, $options: 'i' }
        }
        const numberOfParents = await ParentModel.countDocuments(filter)
        if (numberOfParents === 0) {
          return res.status(204).send({
            countDocs: numberOfParents,
            found: false,
            message: "NoParents",
          })
        } else {
          const parents = await ParentModel.find(filter, { password: 0 }).skip(offset * 10).limit(process.env.PAGE_LIMIT)
          return (parents.length > 0) ?
            res.status(200).send({
              countDocs: numberOfParents,
              found: true,
              parents
            })
            :
            res.status(204).send({
              countDocs: numberOfParents,
              found: false,
              message: "NoParents",
            })
        }
      } else {
        return res.status(400).send({
          error: "BadRequest",
          message: "We cannot filter with an non valid Attribute"
        })
      }
    }
  } catch (e) {
    console.log(e)
    return res.status(500).json({ error: "serverSideError" });
  }
}



//getparent by id
exports.getParentById = async (req, res) => {
  try {
    if (!req.params.parentId)
      return res.status(400).json({ error: "parentIdRequired" });
    const parent = await ParentModel.findById(
      req.params.parentId,
      "firstName lastName email tel image"
    );
    if (parent) return res.status(200).json({ found: true, parent });
    else return res.status(404).json({ found: false })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ error: "serverSideError" });
  }
};

exports.getParentAndChildsById = async (req, res) => {
  try {
    if (!req.params.parentId)
      return res.status(400).json({ error: "parentIdRequired" });
    const parent = await ParentModel.findById(
      req.params.parentId,
      "firstName lastName email tel"
    ).populate({
      path: "students",
      select: "username firstName lastName birth",
    });
    return parent
      ? res.status(200).json({ found: true, parent })
      : res.status(404).json({ found: false });
  } catch (e) {
    console.log(e)
    return res.status(200).json({ error: "serverSideError" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({
        error: "credentialsRequired",
      });
    const parent = await ParentModel.findOne({ email: email.toLowerCase().trim() });
    if (parent && (await bcrypt.compare(password, parent.password))) {
      const token = generateToken(
        {
          email: parent.email.toLowerCase().trim(),
          firstName: parent.firstName,
          lastName: parent.lastName,
          tel: parent.tel,
        },
        "3d"
      );
      return res.status(200).json({ logged: true, token });
    } else {
      return res.status(404).json({ logged: false });
    }
  } catch (e) {
    console.log(e)
    return res.status(500).json({ error: "serverSideError" });
  }
};

exports.updateParent = async (req, res) => {
  //request with same name of parent attributs
  try {
    if (!req.params.parentId)
      return res.status(400).json({
        error: "badRequest",
      });
    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).send({
          error: "password Length should be >= 6"
        })
      } else {
        req.body.password = await bcrypt.hash(req.body.password, 10)
      }
    }
    if (req.body.email)
      req.body.email = req.body.email.toLowerCase().trim()
    const newParent = await ParentModel.findByIdAndUpdate(req.params.parentId, req.body, {
      new: true,
      runValidators: true,
      fields: { password: 0 }
    });
    if (newParent)
      return res.status(200).json({
        found: true,
        newParent
      });
    else
      return res.status(404).json({
        found: false,
      });
  } catch (e) {
    console.log(e);
    if (e.keyValue?.email)
      return res.status(409).json({
        error: "conflictEmail",
        message: "Email already used",
      });
    else if (e.keyValue?.tel)
      return res.status(409).json({
        error: "conflictTel",
        message: "Tel already used",
      });
    else {
      console.log(e);
      return res.status(500).json({
        error: "serverSideError",
      });
    }
  }
};

exports.deleteParent = (req, res) => {
  try {
    if (!req.params.parentId) {
      return res.status(400).send({
        error: "Bad Request!",
      });
    }
    const { parentId } = req.params;
    ParentModel.findByIdAndRemove(parentId)
      .then((parent) => {
        if (!parent) {
          return res.status(404).send({
            message: "Parent not found with id " + parentId,
            deleted: false,
          });
        }
        return res.status(200).send({
          message: "Parent deleted Successfully!!",
          deleted: true,
        });
      })
      .catch((err) => {
        if (err.kind === "ObjectId" || err.name === "NotFound") {
          return res.status(404).send({
            error: "Parent not found with id" + parentId,
          });
        }
        return res.status(400).send({
          error: "Some Error occured while finding parent with id" + parentId,
        });
      });
  } catch (e) {
    return res.status(500).send({
      error: e.message,
      message: "Server error!",
    });
  }
};



exports.getParentProfile = async (req, res) => {
  try {
    const parentId = req.params.parentId
    var parent = await ParentModel.findById(parentId, { password: 0 })
      .populate({ path: "students", populate: { path: "group", populate: { path: "section" } }, select: { password: 0 } })
    if (parent) return res.status(200).json(parent)
    return res.status(404).json({})
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      error: "serverSideError"
    })
  }
}

// exports.filterParents = async (req,res) => {
//   try{
//     const fieldKeys = Object.keys(req.body)
//     if (fieldKeys.length === 3){
//       const filteredParents = await ParentModel.find({
//          firstName : { $regex: req.body.firstName, $options : 'i' },
//          lastName : { $regex: req.body.lastName, $options : 'i' },
//          tel : { $regex: req.body.tel, $options : 'i' }
//       }, {password : 0})
//       return (filteredParents.length > 0) ? 
//         res.status(200).send({
//           found : true,
//           filteredParents
//         })
//         :
//         res.status(204).send({
//           found : false,
//           message : "NoParents",
//         })
//     }else if (fieldKeys.length === 2 ){
//       let firstNameCheck = false
//       let lastNameCheck = false
//       let telCheck = false
//       if (req.body.firstName){
//         firstNameCheck = true
//       }
//       if (req.body.lastName){
//         lastNameCheck = true
//       }
//       if (req.body.tel){
//         telCheck = true
//       }
//       if ( (firstNameCheck && lastNameCheck) ){
//         console.log("first and last")
//       }else if ( (firstNameCheck && telCheck) ){
//         console.log("first and tel")
//       } else if ( (telCheck && lastNameCheck) ){
//         console.log(" last and tel")
//       }
//       const filteredParents = await ParentModel.find({
//          att_1 : { $regex: req.body.fieldKeys[0], $options : 'i' },
//          att_2 : { $regex: req.body.fieldKeys[1], $options : 'i' }
//       }, {password : 0})
//       return (filteredParents.length > 0) ? 
//         res.status(200).send({
//           found : true,
//           filteredParents
//         })
//         :
//         res.status(204).send({
//           found : false,
//           message : "NoParents",
//         })
//     }else if (fieldKeys.length === 1 ){
//       let att_1 = fieldKeys[0]
//       const filteredParents = await ParentModel.find({
//          att_1 : { $regex: req.body.fieldKeys[0], $options : 'i' }
//       }, {password : 0})
//       return (filteredParents.length > 0) ? 
//         res.status(200).send({
//           found : true,
//           filteredParents
//         })
//         :
//         res.status(204).send({
//           found : false,
//           message : "NoParents",
//         })
//     }else{
//       return res.status(400).send({
//         error : "BadRequest"
//       })
//     }

//   }catch(e) {
//     console.log(e.message)
//     return res.status(500).send({
//       error : "Server Error!"
//     })
//   }
// }

exports.countDocsss = async (req, res) => {
  try {
    const countParents = await ParentModel.countDocuments()
    return res.status(200).send({ number: countParents || 0 })
  } catch (e) {
    return res.status(500).send({
      error: "Server Error!"
    })
  }
}


