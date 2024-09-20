const detailsRoutes = require("express").Router();
const { pool } = require("../conf.js");

let convertGraphData = (data) => {
  // let objKeys = Object.keys(data[0]);
  // let graphData = [objKeys];
  let graphData = [["Month", "Amount"]];
  let total_amount = 0;
  if (data.length) {
    data.map((item) => {
      // let newData = Object.values(item);
      total_amount += Number(item.total_amount);
      let newData = [item.month, Number(item.total_amount)];

      graphData.push(newData);
    });
  } else {
    graphData.push([0, 0]);
  }

  return { graphData, total_amount };
};

detailsRoutes.get("/details/graph/:id", async (req, res, next) => {
  const user_id = req.user.id;
  const hostel_id = req.params.id;

  let { year } = req.query;

  let query = `SELECT  
    DATE_FORMAT(created_at, '%Y-%m') AS month,
    COUNT(*) AS total_payments,
    SUM(payment) AS total_amount
    FROM payments
    WHERE YEAR(created_at) IN (${year}) and hostel_id = ?
    GROUP BY month ORDER BY month; `;

  if (!year || isNaN(year) || String(year).length != 4) {
    query = `SELECT  
    DATE_FORMAT(created_at, '%Y-%m') AS month,
    COUNT(*) AS total_payments,
    SUM(payment) AS total_amount FROM  
    payments WHERE  
    created_at >= DATE_SUB(CURDATE(), INTERVAL  2 MONTH) and hostel_id = ?
    GROUP BY month ORDER BY month;`;
  }

  let [result] = await pool.execute(query, [hostel_id]);

  let { graphData, total_amount } = convertGraphData(result);

  res.status(200).send({ data: graphData, total_amount: total_amount });
});

module.exports = { detailsRoutes };
