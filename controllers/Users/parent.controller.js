const ParentModel = require("./../../models/Users/parent.model.js");
const StudentModel = require("./../../models/Users/student.model")
const bcrypt = require("bcryptjs");
const generateToken = require("./../../functions/generateToken.js");

exports.createParent = async (req, res) => {
  try {
    const { firstName, lastName, email, tel, password } = req.body
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
      firstName,
      lastName,
      email,
      tel,
      password: encryptedPassword,
    });
    await parent.save();
    return res.status(201).json({
      _id: parent._id,
      firstName: parent.firstName,
      latName: parent.lastName,
      email: parent.email,
      tel: parent.tel
    });
  } catch (e) {
    console.log(e);
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
    else {
      console.log(e);
      return res.status(500).json({
        error: "serverSideError",
      });
    }
  }
};

exports.getAllParents = async (req, res) => {
  try {
    const parents = await ParentModel.find({}, { password: 0 })
    return parents.length ? res.status(200).json({ parents, found: true }) :
      res.status(204).json({ found: false, message: "noParents" })
  } catch {
    return res.status(500).json({ error: "serverSideError" });
  }
}

exports.getParentById = async (req, res) => {
  try {
    if (!req.params.parentId)
      return res.status(400).json({ error: "parentIdRequired" });
    const parent = await ParentModel.findById(
      req.params.parentId,
      "firstName lastName email tel"
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
    const parent = await ParentModel.findOne({ email: email.trim() });
    if (parent && (await bcrypt.compare(password, parent.password))) {
      const token = generateToken(
        {
          email: parent.email,
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
    if (req.body.password?.length < 6)
      return res.status(400).json({
        error: "passwordMinLength",
      });
    if (req.body.password)
      req.body.password = await bcrypt.hash(req.body.password, 10)
    const newParent = await ParentModel.findByIdAndUpdate(req.params.parentId, req.body, {
      new: true,
      runValidators: true,
      fields: { password: 0 }
    });
    if (newParent)
      return res.status(200).json({
        newParent,
        found: true,
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


