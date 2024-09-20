const { pool } = require("../conf.js");

const dataCount = require("express").Router();

dataCount.get("/hostel", async (req, res, next) => {
  let hostel_id = req.user.id;

  let [hostelResult] = await pool.execute(
    `SELECT SUM(total_seat) AS total_seats, SUM(filled_seat) AS available_seats, COUNT(*) AS rooms FROM rooms WHERE hostel_id = ?`,
    [hostel_id]
  );

  let [studentsResult] = await pool.execute(
    `
    SELECT  
      SUM(CASE WHEN status = 'active' THEN  1 ELSE  0 END) as active_students,
      SUM(CASE WHEN status = 'inactive' THEN  1 ELSE  0 END) as inactive_students
    FROM students  
    WHERE hostel_id = ?
`,
    [hostel_id]
  );

  if (hostelResult.length) {
    hostelResult = hostelResult[0];
  } else {
    hostelResult = {};
  }

  if (studentsResult.length) {
    studentsResult = studentsResult[0];
  } else {
    studentsResult = {};
  }

  res.status(200).send({ ...hostelResult, ...studentsResult });
});

dataCount.get("/summary", async (req, res, next) => {
  let hostel_id = req.user.id;

  let [studentsResult] = await pool.execute(
    `
    SELECT  
      SUM(income) as income,
    FROM payments  
    WHERE hostel_id = ?
`,
    [hostel_id]
  );

  res.status(200).send(studentsResult);
});

module.exports = { dataCount };
