const { pool } = require("../conf.js");
const { hashPassword, comparePassword } = require("../utils/password.js");
const { matchRegex } = require("../utils/regex.js");
const { tokenHandler, generateToken } = require("../utils/tokenutils.js");

const hostelRoutes = require("express").Router();

hostelRoutes.post("/login", async (req, res, next) => {
  let { username, password } = req.body;
  let values = [username, password];
  let keys = ["username", "password"];
  let checkvalid = matchRegex(values, keys);
  if (checkvalid) {
    return res.status(400).send({ errors: checkvalid, message: "Please fill all fields" });
  }

  password = await hashPassword(password);

  try {
    let [result] = await pool.execute(
      "SELECT id, username, email, phone FROM hostels WHERE username = ? AND password = ?",
      [username, password]
    );

    if (!result.length) {
      return res.status(404).send({ message: "User Not Found" });
    }

    let data = { ...result[0] };
    data.type = "hostel";

    let genratedToken = generateToken(data);

    return res.status(200).send({ token: genratedToken, type: "hostel", message: "login successful" });
  } catch (e) {
    console.log(e);
  }
});

hostelRoutes.post("/register", tokenHandler, async (req, res, next) => {
  let user = req.user;
  let { username, password, phone, email, name } = req.body;
  let values = [username, password, phone, email, name];
  let keys = ["username", "password", "phone", "email", "name"];
  let checkvalid = matchRegex(values, keys);
  if (checkvalid) {
    return res.status(400).send({ errors: checkvalid, message: "Please fill all fields" });
  }

  password = await hashPassword(password);
  values = [name, username, password, email, phone, user.id];

  try {
    const [result] = await pool.execute(
      "INSERT INTO hostels (name, username, password, email, phone, user_id) VALUES (?, ?, ?, ?, ?, ?)",
      [...values]
    );

    return res.status(201).send({ message: username + " Created successfully" });
  } catch (err) {
    if (err.message.includes("Duplicate")) {
      return res.status(409).send("Duplicate Entry");
    }
  }

  res.status(500).send("something want wrong");
});

hostelRoutes.put("/update/:id", tokenHandler, async (req, res, next) => {
  let hostelId = req.params.id;

  let { username, password, phone, email, name } = req.body;

  let values = [username, phone, email, name];
  let keys = ["username", "phone", "email", "name"];

  let sqlQuery = "UPDATE hostels SET name=?, username=?, phone=?, email=?";
  let sqlValues = [name, username, phone, email];

  if (password) {
    values.push(password);
    keys.push("password");

    password = await hashPassword(password);
    sqlQuery += ", password=?";
    sqlValues.push(password);
  }

  let checkvalid = matchRegex(values, keys);
  if (checkvalid) {
    return res.status(400).send({ errors: checkvalid, message: "Please fill all fields" });
  }

  sqlQuery += " WHERE id=?";
  sqlValues.push(hostelId);

  try {
    const [result] = await pool.execute(sqlQuery, sqlValues);

    return res.status(200).send({ message: username + " Updated successfully" });
  } catch (err) {
    if (err.message.includes("Duplicate")) {
      return res.status(409).send("Duplicate Entry");
    }
  }

  res.status(500).send("Something went wrong");
});

hostelRoutes.get("/list", tokenHandler, async (req, res, next) => {
  let user = req.user;
  try {
    const [result] = await pool.execute(
      "SELECT id, name, phone, email, username, created_at FROM hostels WHERE user_id=? AND status='active'",
      [user.id]
    );

    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong");
  }
});

module.exports = { hostelRoutes };
