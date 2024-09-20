const mysql = require("mysql2/promise");

let pool;

async function connectToDatabase() {
  if (!pool) {
    pool = mysql.createPool({
      connectionLimit: 10000,
      host: "127.0.0.1",
      user: "root",
      database: "hostel",
      password: "112233dD$",
    });
  }

  try {
    const connection = await pool.getConnection();
    console.log("Connected to database");
    connection.release();
  } catch (err) {
    console.error("Error connecting to database:", err);
  }
}

connectToDatabase();

module.exports = {
  pool,
};
