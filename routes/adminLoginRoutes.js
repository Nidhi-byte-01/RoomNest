const { pool } = require("../conf.js");
const { hashPassword, comparePassword } = require("../utils/password.js");
const { matchRegex } = require("../utils/regex.js");
const { generateToken } = require("../utils/tokenutils.js");

const adminLoginRoutes = require("express").Router();

adminLoginRoutes.post("/login", async (req, res, next) => {
  let { username, password, phone, email } = req.body;
  let values = [username, password];
  let keys = ["username", "password"];
  let checkvalid = matchRegex(values, keys);
  if (checkvalid) {
    return res.status(400).send({ errors: checkvalid, message: "Please fill all fields" });
  }

  password = await hashPassword(password);

  try {
    let [result] = await pool.execute(
      "SELECT id, username, email, phone FROM users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (!result.length) {
      return res.status(404).send({ message: "User Not Found" });
    }

    let dataToSet = result[0];
    dataToSet.type = "admin";
    let genratedToken = generateToken(dataToSet);

    return res.status(200).send({ token: genratedToken, type: "admin", message: "login successful" });
  } catch (e) {
    console.log(e);
  }
});

adminLoginRoutes.post("/signup", async (req, res, next) => {
  let { username, password, phone, email, name } = req.body;

  let values = [username, password, phone, email, name];
  let keys = ["username", "password", "phone", "email", "name"];

  let checkvalid = matchRegex(values, keys);
  if (checkvalid) {
    return res.status(400).send({ errors: checkvalid, message: "Please fill all fields" });
  }

  password = await hashPassword(password);
  values = [username, password, email, phone, name];

  try {
    const [result] = await pool.execute(
      "INSERT INTO users (username, password, email, phone,name) VALUES (?, ?, ?, ?, ?)",
      [...values]
    );

    return res.status(201).send({ message: username + " registered successfully" });
  } catch (err) {
    console.log(err);
    if (err.message.includes("Duplicate")) {
      return res.status(409).send("Duplicate Entry");
    }
  }

  res.status(500).send("something want wrong");
});

module.exports = adminLoginRoutes;
