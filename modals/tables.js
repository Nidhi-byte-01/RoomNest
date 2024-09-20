let tablesArr = [
  {
    tableName: "users",
    tableQry: `CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`name\` varchar(50) NOT NULL,
  \`username\` varchar(50) NOT NULL,
  \`password\` varchar(255) NOT NULL,
  \`phone\` varchar(20) NOT NULL,
  \`email\` varchar(60) NOT NULL,
  \`token\` varchar(1000) NULL,
  \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`id_UNIQUE\` (\`id\`),
  UNIQUE KEY \`username_UNIQUE\` (\`username\`),
  UNIQUE KEY \`phone_UNIQUE\` (\`phone\`),
  UNIQUE KEY \`email_UNIQUE\` (\`email\`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4`,
  },
  {
    tableName: "hostels",
    tableQry: `CREATE TABLE IF NOT EXISTS \`hostels\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`user_id\` int NULL,
  \`name\` varchar(50) NOT NULL,
  \`username\` varchar(50) NOT NULL,
  \`password\` varchar(255) NOT NULL,
  \`phone\` varchar(20) NOT NULL,
  \`email\` varchar(60) NOT NULL,
  \`status\` varchar(60) NOT NULL DEFAULT 'active',
  \`token\` varchar(1000) NULL,
  \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`id_UNIQUE\` (\`id\`),
  UNIQUE KEY \`username_UNIQUE\` (\`username\`),
  UNIQUE KEY \`phone_UNIQUE\` (\`phone\`),
  UNIQUE KEY \`email_UNIQUE\` (\`email\`),
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4`,
  },
  {
    tableName: "rooms",
    tableQry: `CREATE TABLE IF NOT EXISTS \`rooms\` (
       \`id\` int NOT NULL AUTO_INCREMENT,
       \`hostel_id\` int NULL,
       \`room_no\` varchar(50) NOT NULL,
       \`total_seat\` int NOT NULL CHECK (total_seat >= 0),
       \`filled_seat\` int NULL  CHECK (filled_seat >= 0),
       \`price_per_seat\` int NOT NULL,
       \`status\` varchar(60) NOT NULL DEFAULT 'active',
       \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
       \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       PRIMARY KEY (\`id\`),
       UNIQUE KEY \`id_UNIQUE\` (\`id\`),
       FOREIGN KEY (\`hostel_id\`) REFERENCES \`hostels\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
       CHECK (filled_seat <= total_seat)
       ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4`,
  },
  {
    tableName: "students",
    tableQry: `CREATE TABLE IF NOT EXISTS \`students\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`hostel_id\` int NOT NULL,
  \`additional_notes\` varchar(1000) NULL,
  \`room_id\` int NULL, 
  \`name\` varchar(50) NOT NULL, 
  \`phone\` varchar(20) NOT NULL,
  \`email\` varchar(60) NULL DEFAULT NULL, 
  \`rent\` int NOT NULL,
  \`status\` varchar(60) NOT NULL DEFAULT 'active',
  \`subscription_date\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  \`subscription_end_date\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`id_UNIQUE\` (\`id\`), 
  UNIQUE KEY \`phone_UNIQUE\` (\`phone\`),
  UNIQUE KEY \`email_UNIQUE\` (\`email\`),
  FOREIGN KEY (\`room_id\`) REFERENCES \`rooms\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (\`hostel_id\`) REFERENCES \`hostels\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4`,
  },
  {
    tableName: "payments",
    tableQry: `CREATE TABLE IF NOT EXISTS \`payments\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`hostel_id\` int NULL,
      \`student_id\` int NOT NULL,
      \`rent\` int NULL DEFAULT '0',
      \`payment\` int NOT NULL DEFAULT '0',
      \`payment_method\` int NOT NULL,
      \`due_payment\` varchar(60) NOT NULL DEFAULT '0',
      \`subscription_end_date\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, 
      \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`id_UNIQUE\` (\`id\`),
      FOREIGN KEY (\`hostel_id\`) REFERENCES \`hostels\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (\`student_id\`) REFERENCES \`students\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      FOREIGN KEY (\`payment_method\`) REFERENCES \`paymentMethods\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  },
  {
    tableName: "paymentMethods",
    tableQry: `CREATE TABLE IF NOT EXISTS \`paymentMethods\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      \`name\` varchar(255) NOT NULL DEFAULT 'cash',
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`id_UNIQUE\` (\`id\`) 
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  },
  {
    tableName: "notes",
    tableQry: `CREATE TABLE IF NOT EXISTS \`notes\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      \`title\` varchar(1500) NOT NULL,
      \`student_id\` int NOT NULL,
      PRIMARY KEY (\`id\`),
      FOREIGN KEY (\`student_id\`) REFERENCES students (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      UNIQUE KEY \`id_UNIQUE\` (\`id\`) 
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  },
];

module.exports = { tablesArr };
