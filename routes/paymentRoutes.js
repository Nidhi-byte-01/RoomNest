const { pool } = require("../conf.js");
const paymentRoutes = require("express").Router();

paymentRoutes.get("/paymentMethods", async (req, res, next) => {
  try {
    const [result] = await pool.execute("SELECT * FROM paymentMethods");

    return res.status(200).send({ data: result });
  } catch (err) {
    console.log(err);
  }

  res.status(500).send("something want wrong");
});

module.exports = { paymentRoutes };
