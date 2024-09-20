const { pool } = require("../conf.js");
const { checkValid } = require("../utils/regex.js");

const roomRoutes = require("express").Router();

roomRoutes.post("/create", async (req, res, next) => {
  let user = req.user;
  let { room_no, total_seat, price_per_seat } = req.body;
  let values = [room_no, total_seat, price_per_seat];
  let keys = ["room_no", { key: "total_seat", type: "number" }, { key: "price_per_seat", type: "number" }];
  let checkvalid = checkValid(values, keys);

  if (checkvalid) {
    return res.status(400).send({ errors: checkvalid, message: "Please fill all fields" });
  }

  values = [room_no, total_seat, 0, price_per_seat, user.id];

  try {
    const [result] = await pool.execute(
      "INSERT INTO rooms (room_no, total_seat, filled_seat,price_per_seat, hostel_id) VALUES (?, ?, ?, ?, ?)",
      [...values]
    );

    return res.status(201).send({ message: `Room ${room_no} created successfully` });
  } catch (err) {
    console.log(err);

    if (err.message.includes("Duplicate")) {
      return res.status(409).send("Duplicate Entry");
    }
  }

  res.status(500).send("something want wrong");
});

roomRoutes.put("/update/:id", async (req, res, next) => {
  let id = req.params.id;
  let hostel_id = req.user.id;
  let { room_no, total_seat, price_per_seat } = req.body;
  let values = [room_no, total_seat, price_per_seat];
  let keys = ["room_no", { key: "total_seat", type: "number" }, { key: "price_per_seat", type: "number" }];
  let checkvalid = checkValid(values, keys);
  if (checkvalid) {
    return res.status(400).send({ errors: checkvalid, message: "Please fill all fields" });
  }

  values = [room_no, total_seat, price_per_seat, id, hostel_id];

  let sqlQuery = "UPDATE rooms SET room_no=?, total_seat=? ,price_per_seat=? WHERE id=? AND hostel_id =?";

  try {
    const [result] = await pool.execute(sqlQuery, values);

    if (result?.affectedRows) return res.status(200).send({ message: `Room ${room_no} updated successfully` });
    return res.status(400).send({ message: `Something went wrong` });
  } catch (err) {
    console.log(err, "update room error");
    if (err.message.includes("Duplicate")) {
      return res.status(409).send("Duplicate Entry");
    }
  }

  res.status(500).send("Something went wrong");
});

roomRoutes.delete("/delete/:id", async (req, res, next) => {
  let id = req.params.id;
  let hostel_id = req.user.id;

  let sqlQuery = "DELETE from rooms WHERE id=? AND hostel_id =?";
  let values = [id, hostel_id];

  try {
    const [result] = await pool.execute(sqlQuery, values);

    if (result?.affectedRows) return res.status(200).send({ message: `Room deleted successfully` });
    return res.status(400).send({ message: `Something went wrong` });
  } catch (err) {
    console.log(err);
  }

  res.status(500).send("Something went wrong");
});

roomRoutes.get("/list", async (req, res, next) => {
  let user = req.user;
  try {
    const [result] = await pool.execute(
      "SELECT id, room_no,total_seat,filled_seat,price_per_seat,status FROM rooms WHERE hostel_id=? AND status='active'",
      [user.id]
    );

    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong");
  }
});

roomRoutes.get("/availablerooms", async (req, res, next) => {
  let user = req.user;
  try {
    const [result] = await pool.execute(
      "SELECT id, room_no,total_seat,filled_seat,price_per_seat,status FROM rooms WHERE hostel_id=? AND filled_seat < total_seat AND  status='active'",
      [user.id]
    );

    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong");
  }
});

module.exports = { roomRoutes };
