const crypto = require("crypto");

const hashPassword = (password) => {
  const staticKey = process.env.SECRET_KEY;

  password = String(password);
  try {
    const hash = crypto.createHash("sha256");
    hash.update(password + staticKey);
    const hashedPassword = hash.digest("hex");
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
};

module.exports = { hashPassword };
