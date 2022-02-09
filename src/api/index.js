const express  = require('express');
const router   = express.Router();




router.use("/api/admin", require("./router/admin.js"));




module.exports = router;