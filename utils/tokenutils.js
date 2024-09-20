const jwt = require("jsonwebtoken");
const { CustomError } = require("../controllers/CustomErrors");

const generateToken = (data) => {
  const secretKey = process.env.SECRET_KEY;
  const expiresIn = "20d";
  const token = jwt.sign(data, secretKey, { expiresIn });

  return token;
};

const decodeToken = (token) => {
  const secretKey = process.env.SECRET_KEY;

  try {
    const decodedToken = jwt.verify(token, secretKey);
    return decodedToken;
  } catch (error) {
    console.error("Error decoding token:", error.message);
    return null;
  }
};

const tokenHandler = (req, res, next) => {
  let token = req.headers.authorization;
  if (token) {
    token = token.split(" ")[1];
  }

  token = decodeToken(token);

  if (!token) {
    next(new CustomError(401));
  }
  req.user = token;
  next();
};

module.exports = { generateToken, decodeToken, tokenHandler };
