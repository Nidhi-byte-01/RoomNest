const mysql = require("mysql2/promise");
const { tablesArr } = require("./tables");

const pool = mysql.createPool({
  connectionLimit: 10000,
  host: "127.0.0.1",
  user: "root",
  database: "hostel",
  password: "112233dD$",
});

async function connectToDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to database");
    connection.release();
  } catch (err) {
    console.error("Error connecting to database:", err);
  }
}

async function tableExists(tableName) {
  try {
    const [rows] = await pool.execute(`SHOW TABLES LIKE '${tableName}'`);
    return rows.length > 0;
  } catch (err) {
    console.error("Error checking table existence:", err);
    return false;
  }
}

async function createTableIfNotExists(tableName, tableQry) {
  try {
    const exists = await tableExists(tableName);

    if (!exists) {
      await pool.execute(tableQry);
      console.log(`Table '${tableName}' created successfully.`);
    } else {
      console.log(`Table '${tableName}' already exists.`);
    }
  } catch (err) {
    console.error(`Error creating table '${tableName}':`, err);
  }
}

async function runMigrations() {
  const tableInfoArray = tablesArr;

  await connectToDatabase();

  for (const tableInfo of tableInfoArray) {
    await createTableIfNotExists(tableInfo.tableName, tableInfo.tableQry);
  }

  pool.end();
}

runMigrations();
