const ParentModel = require("../models/Users/parent.model.js");
const bcrypt = require("bcryptjs");
const generateToken = require("../../functions/generateToken.js");

exports.createParent = async (req, res) => {
  try {
    const { firstName, lastName, email, tel, password } = req.body;
    if (!firstName || !lastName || !email || !tel || !password)
      return res.status(400).json({
        error: "badRequest",
      });
    const encryptedPassword = await bcrypt.hash(password.trim(), 10);
    const parent = ParentModel.create({
      firstName,
      lastName,
      email,
      tel,
      encryptedPassword,
    });
    await parent.save();
    return res.status(201).json({});
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

exports.getParentById = async (req, res) => {
  try {
    if (!req.params.parentId)
      return res.status(400).json({ error: "parentIdRequired" });
    const parent = await ParentModel.findById(
      req.params.parentId,
      "firstName lastName email tel"
    );
    return res.status(200).json(parent);
  } catch (e) {
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
    return res.status(200).json({ error: serverSideError });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({
        error: "credentialsRequired",
      });
    const parent = await ParentModel.findOne({ email: email });
    if (parent && (await bcrypt.compare(password.trim(), parent.password))) {
      const token = generateToken(
        {
          email: parent.email,
          firstName: parent.firstName,
          lastName: parent.lastName,
          tel: parent.tel,
        },
        "3j"
      );
      return res.status(200).json({ logged: true, token });
    } else {
      return res.status(404).json({ logged: false });
    }
  } catch (e) {
    return res.status(500).json({ error: "serverSideError" });
  }
};

exports.updateParent = async (req, res) => {
  //request with same name of parent attributs
  try {
    if (!req.params.idParent)
      return res.status(400).json({
        error: "badRequest",
      });
    const newParent = await ParentModel.findByIdAndupdate(idParent, req.body, {
      new: true,
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
