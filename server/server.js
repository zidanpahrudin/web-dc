const express = require('express')
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 9000;
const router = express.Router();
const getDb = require('../server/config/db');

getDb();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));


app.use("/", require("../server/src/api"));

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});