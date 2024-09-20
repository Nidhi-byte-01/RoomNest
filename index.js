const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const timeout = require("connect-timeout");
const { CustomError, errorHandler } = require("./controllers/CustomErrors");
const adminLoginRoutes = require("./routes/adminLoginRoutes");
const { hostelRoutes } = require("./routes/hostelRoutes");
const { tokenHandler } = require("./utils/tokenutils");
const { roomRoutes } = require("./routes/roomRoutes");
const { studentRoutes } = require("./routes/studentRoutes");
const { dataCount } = require("./routes/totalCounts");
require("dotenv").config();
const cron = require("node-cron");
const checkForEndedSubscriptions = require("./routes/sendNotifications");
const { detailsRoutes } = require("./routes/detailsData");
const { paymentRoutes } = require("./routes/paymentRoutes");
const { notesRoutes } = require("./routes/notesRoutes");

const app = express();
// const corsOptions = {
//   origin: process.env.FRONTEND_URL,
//   exposedHeaders: ["totalPages"],
//   optionsSuccessStatus: 204,
// };

const corsOptions = "*";

const port = process.env.PORT || 5400;
const IP_ADDRESS = process.env.IP_ADDRESS;

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 250,
});
app.use(limiter);

app.use(timeout("30000"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  helmet({
    contentSecurityPolicy: false,
    referrerPolicy: {
      policy: "same-origin",
    },
    xssFilter: true,
    noSniff: true,
    frameguard: {
      action: "same-origin",
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

cron.schedule("8 * * * *", () => {
  checkForEndedSubscriptions();
});

app.use(adminLoginRoutes);
app.use("/hostel", hostelRoutes);

app.use(tokenHandler);
app.use(notesRoutes);
app.use("/room", roomRoutes);
app.use(paymentRoutes);
app.use("/student", studentRoutes);
app.use("/details", dataCount);
app.use("/hostel", detailsRoutes);

app.use("*", (req, res, next) => {
  next(new CustomError(404));
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
