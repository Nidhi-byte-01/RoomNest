const { pool } = require("../conf.js");
const { getDateAfterOneMonth, getMonthsDifference } = require("../utils/dateUtils.js");
const { checkValid, matchRegex } = require("../utils/regex.js");

const studentRoutes = require("express").Router();

const getStudent = async (id) => {
  const existingStudentqry = "select * from students where id = " + id;
  const [existingStudent] = await pool.execute(existingStudentqry);

  return existingStudent;
};

const createNotes = async (note, id) => {
  const sqlQuery = "INSERT INTO notes (title, student_id) VALUES(?, ?)";

  if (note) {
    const [result] = await pool.execute(sqlQuery, [note, id]);
    return result;
  } else {
    return null;
  }
};

const createPayments = async (arr) => {
  const sqlQuery =
    "INSERT INTO payments (payment, subscription_end_date, student_id, hostel_id,rent,payment_method) VALUES (?, ?, ?, ?,?,?)";

  const [result] = await pool.execute(sqlQuery, arr);
  return result;
};

studentRoutes.post("/create", async (req, res, next) => {
  let user = req.user;

  let hostel_id = user.id;

  let {
    name,
    room_id,
    phone,
    email,
    subscription_date,
    subscription_end_date,
    rent,
    payment,
    payment_method,
    additional_notes = "",
  } = req.body;

  let values = [name, rent, room_id, subscription_date, subscription_end_date, payment, payment_method];
  let keys = [
    "name",
    { key: "rent", type: "number" },
    { key: "room_id", type: "number" },
    "subscription_date",
    "subscription_end_date",
    { key: "payment", type: "number" },
    { key: "payment_method", type: "number" },
  ];

  let valuesValidate = [phone, email];
  let keysValidate = ["phone", "email"];

  let checkvalid = checkValid(values, keys);
  let validateData = matchRegex(valuesValidate, keysValidate);

  if (validateData) {
    return res.status(400).send({ errors: validateData, message: "Please fill all fields" });
  }

  if (checkvalid) {
    return res.status(400).send({ errors: checkvalid, message: "Please fill all fields" });
  }

  try {
    values = [
      name,
      phone,
      email,
      new Date(subscription_date),
      new Date(subscription_end_date),
      rent,
      room_id,
      hostel_id,
      additional_notes,
    ];
    const [createResult] = await pool.execute(
      "INSERT INTO students (name, phone, email, subscription_date, subscription_end_date, rent, room_id, hostel_id,additional_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [...values]
    );

    let student_id = createResult?.insertId;

    let notes = await createNotes(additional_notes, student_id);

    let payArr = [payment, new Date(subscription_end_date), student_id, hostel_id, rent, payment_method];
    const paymentResult = await createPayments(payArr);

    const [roomresult] = await pool.execute("UPDATE rooms SET filled_seat= filled_seat+1 WHERE id=? AND hostel_id=?", [
      room_id,
      hostel_id,
    ]);

    return res.status(201).send({ message: `students ${name} created successfully` });
  } catch (err) {
    console.log(err);

    if (err.message.includes("Duplicate")) {
      return res.status(409).send("Duplicate Entry");
    }
  }

  res.status(500).send("something want wrong");
});

studentRoutes.put("/update/:id", async (req, res, next) => {
  let id = req.params.id;
  let hostel_id = req.user.id;

  let { name, room_id, phone, email, subscription_date, subscription_end_date, rent, additional_notes } = req.body;
  let values = [name, rent, room_id, subscription_date, subscription_end_date];
  let keys = [
    "name",
    { key: "rent", type: "number" },
    { key: "room_id", type: "number" },
    "subscription_date",
    "subscription_end_date",
  ];
  let valuesValidate = [phone, email];
  let keysValidate = ["phone", "email"];

  let checkvalid = checkValid(values, keys);
  let validateData = matchRegex(valuesValidate, keysValidate);

  if (validateData) {
    return res.status(400).send({ errors: validateData, message: "Please fill all fields" });
  }

  if (checkvalid) {
    return res.status(400).send({ errors: checkvalid, message: "Please fill all fields" });
  }

  values = [name, phone, email, id, hostel_id];
  // values = [
  //   name,
  //   phone,
  //   email,
  //   new Date(subscription_date),
  //   new Date(subscription_end_date),
  //   rent,
  //   room_id,
  //   id,
  //   hostel_id,
  // ];

  const existingStudent = await getStudent(id);
  let existingRoomId = existingStudent[0].room_id;

  let sqlQuery = "UPDATE students SET name=?, phone=? ,email=? WHERE id=? AND hostel_id =?";

  // "UPDATE students SET name=?, phone=? ,email=?, subscription_date=?, subscription_end_date=?,rent=?,room_id=? WHERE id=? AND hostel_id =?";

  try {
    const [result] = await pool.execute(sqlQuery, values);

    // const [roomresult] = await pool.execute(
    //   `UPDATE rooms
    //    SET filled_seat =
    //    CASE
    //        WHEN id = ? AND hostel_id = ? THEN filled_seat - 1
    //        WHEN id = ? AND hostel_id = ? THEN filled_seat + 1
    //        ELSE filled_seat
    //    END
    //    WHERE (id = ? AND hostel_id = ?) OR (id = ? AND hostel_id = ?)`,
    //   [existingRoomId, hostel_id, room_id, hostel_id, existingRoomId, hostel_id, room_id, hostel_id]
    // );

    if (additional_notes) {
      let notes = await createNotes(additional_notes, id);
    }

    if (result?.affectedRows) return res.status(200).send({ message: `student ${name} updated successfully` });
    return res.status(400).send({ message: `Something went wrong` });
  } catch (err) {
    console.log(err, "update student error");
    if (err.message.includes("Duplicate")) {
      return res.status(409).send("Duplicate Entry");
    }
  }

  res.status(500).send("Something went wrong");
});

studentRoutes.put("/status/:student_id/:status", async (req, res, next) => {
  let status = req.params.status;
  let hostel_id = req.user.id;
  let student_id = req.params.student_id;
  let statuses = ["active", "inactive"];

  let existingStudent = await getStudent(student_id);
  existingStudent = existingStudent[0];

  const room_id = existingStudent.room_id;
  let studentStatusDB = existingStudent.status;

  if (!statuses.includes(status)) {
    return res.status(400).send({ message: "Invalid status" });
  }

  let sqlQuery = "UPDATE students SET room_id=null, status=? WHERE id=? AND hostel_id =?";
  values = [status, student_id, hostel_id];

  console.log(room_id, hostel_id);
  try {
    if (studentStatusDB != status && status == "inactive") {
      const [roomresult] = await pool.execute(
        "UPDATE rooms SET filled_seat= filled_seat-1 WHERE id=? AND hostel_id=?",
        [room_id, hostel_id]
      );
    }

    const [result] = await pool.execute(sqlQuery, values);

    if (result?.affectedRows) return res.status(200).send({ message: `student ${status}ed successfully` });
    return res.status(400).send({ message: `Something went wrong` });
  } catch (err) {
    console.log(err, "update student status error");
    if (err.message.includes("Duplicate")) {
      return res.status(409).send("Duplicate Entry");
    }
  }

  res.status(500).send("Something went wrong");
});

studentRoutes.delete("/delete/:id", async (req, res, next) => {
  let id = req.params.id;
  let hostel_id = req.user.id;

  let sqlQueryPayment = "DELETE from payments WHERE student_id=? AND hostel_id =?";
  let sqlQuery = "DELETE from students WHERE id=? AND hostel_id =?";
  let values = [id, hostel_id];

  const existingStudent = await getStudent(id);

  let existingRoomId = existingStudent[0].room_id;

  try {
    const [deletePayment] = await pool.execute(sqlQueryPayment, values);
    const [result] = await pool.execute(sqlQuery, values);

    const [roomresult] = await pool.execute("UPDATE rooms SET filled_seat= filled_seat-1 WHERE id=? AND hostel_id=?", [
      existingRoomId,
      hostel_id,
    ]);

    if (result?.affectedRows) return res.status(200).send({ message: `Room deleted successfully` });
    return res.status(500).send({ message: `Something went wrong` });
  } catch (err) {
    return res.status(500).send({ message: `Something went wrong` });
  }
});

let modifyStudentData = (data) => {
  data.map((item) => {
    if (item.payments) {
      let lastPayment = item.payments[0]?.end_date;
      let lastPaymentAmount = item.payments[0]?.payment;
      let startPaymentDate = item.subscription_date;
      let lastPaymentDate = item.payments[0]?.end_date;
      let totalPaymentAmount = 0;

      if (lastPayment) {
        lastPayment = new Date(lastPayment);
      }

      item.payments.map((payment) => {
        let payDate = new Date(payment.end_date);
        if (payDate > lastPayment) {
          lastPaymentDate = payment.end_date;
          lastPayment = payDate;
          lastPaymentAmount = payment.payment;
        }
        totalPaymentAmount += payment.payment;
      });

      let activePayment = 0;
      if (item.status == "active") {
        let activeMonths = getMonthsDifference(lastPaymentDate);
        if (activeMonths < 0) activeMonths = 0;
        activePayment = activeMonths * item.rent;
      }

      item.payment_subscription_end_date = lastPaymentDate;
      const monthsDifference = getMonthsDifference(startPaymentDate, lastPaymentDate);
      let totalPayments = monthsDifference * item.rent;

      item.payment = lastPaymentAmount;
      item.due_payment = totalPayments + activePayment - totalPaymentAmount;
    }
  });
  return data;
};

studentRoutes.get("/list", async (req, res, next) => {
  let { status = "active" } = req.query;

  let user = req.user;
  try {
    const [result] = await pool.execute(
      `SELECT s.*, r.room_no, h.name AS hostel_name,
    (
      SELECT JSON_ARRAYAGG(JSON_OBJECT('payment', p.payment, 'date', p.created_at, 'end_date', p.subscription_end_date))
      FROM payments p
      WHERE p.student_id = s.id
    ) AS payments,
    (
    SELECT SUM(payment)
    FROM payments p
    WHERE p.student_id = s.id AND p.subscription_end_date >= CURRENT_DATE()
    ) AS current_month_payment
    FROM students s LEFT JOIN rooms r ON s.room_id = r.id
    INNER JOIN hostels h ON s.hostel_id = h.id
    WHERE s.hostel_id = ? AND s.status = ?;`,
      [user.id, status]
    );

    let modifyedData = modifyStudentData(result);

    return res.status(200).json(modifyedData);
  } catch (err) {
    console.log(err);

    return res.status(500).send("Something went wrong");
  }
});

studentRoutes.post("/payment/:student_id", async (req, res, next) => {
  let hostel_id = req.user.id;
  let student_id = req.params.student_id;
  let { payment, additional_notes, payment_method } = req.body;

  let errors = {};

  if (!payment || isNaN(payment)) {
    errors.payment = "invalid payment";
  }

  if (!payment_method || isNaN(payment_method)) {
    errors.payment_method = "invalid payment_method";
  }

  if (Object.keys(errors).length) {
    return res.status(400).send({ errors: errors, message: "Invalid input" });
  }

  let [studentPaymentData] = await pool.execute(
    `SELECT * FROM payments WHERE student_id = ? ORDER BY subscription_end_date DESC LIMIT 1 `,
    [student_id]
  );

  if (!studentPaymentData.length) {
    return res.status(400).send({ message: "no students found" });
  }

  studentPaymentData = studentPaymentData[0];
  let subscription_end_date = studentPaymentData.subscription_end_date;

  if (subscription_end_date < new Date()) {
    let monthsDiff = getMonthsDifference(subscription_end_date);
    subscription_end_date = getDateAfterOneMonth(subscription_end_date, monthsDiff);
  }

  values = [student_id, hostel_id];

  try {
    let payArr = [payment, subscription_end_date, student_id, hostel_id, studentPaymentData.rent, payment_method];
    const paymentResult = await createPayments(payArr);

    if (additional_notes) {
      let notes = await createNotes(additional_notes, student_id);
    }

    if (paymentResult?.affectedRows) return res.status(200).send({ message: `updated successfully` });
    return res.status(400).send({ message: `Something went wrong` });
  } catch (err) {
    console.log(err, "update payment error");
    if (err.message.includes("Duplicate")) {
      return res.status(409).send("Duplicate Entry");
    }
  }

  res.status(500).send("Something went wrong");
});

module.exports = { studentRoutes };
