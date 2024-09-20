const { pool } = require("../conf.js");
const notesRoutes = require("express").Router();

notesRoutes.get("/notes/:id", async (req, res, next) => {
  const student_id = req.params.id;
  const qry = "select id,created_at,title from notes where student_id =?";

  let [result] = await pool.execute(qry, [student_id]);

  res.status(200).send({ data: result });
});

module.exports = { notesRoutes };
