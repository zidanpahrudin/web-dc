const express = require('express')
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 9000;
const router = express.Router();
const cors = require('cors');
const getDb = require('./config/db');

getDb();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, './client/public')));


app.use("/", require("./src/api"));

app.get("https://dokumenrahasia.com/kategori.html", auth, async (req, res) => {
    const file = req.params.file;
    try {
    if(req.cookies['token']) {
      res.redirect("https://dokumenrahasia.com/kategori.html")
    }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});

app.get("https://dokumenrahasia.com/liputan-admin.html", auth, async (req, res) => {
    const file = req.params.file;
    try {
    if(req.cookies['token']) {
      res.redirect("https://dokumenrahasia.com/liputan-admin.html")
    }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});

app.get("hhttps://dokumenrahasia.com/pojok-psikologi-admin.html", auth, async (req, res) => {
    const file = req.params.file;
    try {
    if(req.cookies['token']) {
      res.redirect("https://dokumenrahasia.com/pojok-psikologi-admin.html")
    }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});