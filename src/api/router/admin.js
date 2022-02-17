const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieSesion = require("cookie-session");
const config = require("config");
const multer = require("multer");
const fs = require("fs");
const { check, validationResult, cookie } = require("express-validator");
const auth = require("../../middleware/auth");
const Admin = require("../../models/Admin");
const Content = require("../../models/Content");
const Rekomendasi = require("../../models/Rekomendasi");
const path = require('path');
const console = require('console');

let upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../../../client/public/assets/uploads/'));
    },
    filename: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    }
  })
});



// @route   POST api/admin/web
// @desc    Login user & get token for web
// @access  Public
router.post(
    "/web",
    [
      check("email", "Email harus diisi").not().isEmpty(),
      check("password", "Password harus diisi").not().isEmpty(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: "failed", message: "Data ada yang kosong", data: errors.array() });
      }
      
      const { email, password } = req.body;
  
      try {
        let user = await Admin.findOne({
          active: 1,
          username: email,
        });
        
        if (!user) {
          return res
            .status(400)
            .json({status: "failed", message: "Invalid Login", data: [] });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
          return res
            .status(400)
            .json({status: "failed", message: "Invalid Login", data: [] });
        }
  
        const payload = {
          user: {
            id: user._id,
          },
        };
  
        jwt.sign(
          payload,
          config.get("jwt").get("jwtSecret"),
          { expiresIn: config.get("jwt").get("jwtExpired") },
          (err, token) => {
            if (err) throw err;
            res.cookie('token', token, {httpOnly: true, secure: true, sameSite: true});
            
            return res.redirect('https://dokumenrahasia.com/kategori.html');
          }
        );
      } catch (err) {
        console.log(err.message);
        res.status(500).json({ status: "failed", message: "Server error: " + err.message, data: [] });
      }
    }
);


// @route   Get api/admin/signout
// @desc    Logout user & clear cookie
// @access  Private
router.get("/logout", async (req, res) => {
  try {
      res.clearCookie('token');
      
      return res.redirect("/login.html");
  } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
  }
});


// @route   POST api/admin/upload?jenis
// @desc    Post liputan
// @access  Private
router.post("/upload", upload.array('photos', 4), async (req, res) => {
  
  const {title, category, body, creator} = req.body;
  let content = {};
  try {
      content = new Content({
        title: title,
        content: body,
        jenis: category,
        creator: creator,
        src_img: `/assets/uploads/${req.files[0].filename}`,
      });

      let newContent = await content.save();
      if(newContent){
        return res.status(200).json({status: "success", message: "Berhasil menambahkan konten", data: newContent});
      } else {
        return res.status(400).json({status: "failed", message: "Invalid data", data: [] });
      }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/admin/content
// @desc    Get all content
// @access  Private
router.get("/content", /*auth,*/ async (req, res) => {
  let sort = req.query.sort;
  let limit = req.query.limit;
  let kategori = req.query.kategori;
  let content;
  try {
    if(kategori){
      content = await Content.find({jenis: kategori}).limit(limit).sort(sort);
    } else {
      content = await Content.find({}).limit(limit).sort(sort);
    }
    return res.status(200).json({status: "success", message: "Berhasil mengambil data", data: content});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/admin/content/:id
// @desc    Get content by id
// @access  Private
router.get("/content/:id", /*auth,*/ async (req, res) => {
  try {
    let data = [];

    let content = await Content.findById(req.params.id).limit(req.query);
    let sortContent = await Content.find({}).sort({createdAt: 1});
    if(!content && !sortContent){
      return res.status(400).json({status: "failed", message: "Data tidak ditemukan", data: [] });
    }
    if(content) {
      data.push(content);
    }
    if(sortContent) {
      data.push(sortContent);
    }
    
    return res.status(200).json({status: "success", message: "Berhasil mengambil data", data: data});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/admin/content/:id
// @desc    Update content by id
// @access  Private
router.post("/content/:id", upload.array('photos', 4), /*auth,*/ async (req, res) => {
  try {
   
    let {title, category, body, creator} = req.body;
    let newContent = await Content.findOneAndUpdate({_id: req.params.id}, {
      title: title,
      content: body,
      jenis: category,
      creator: creator,
      src_img: `/assets/uploads/${req.files[0].filename}`,
    });
    console.log(newContent);
    return res.status(200).json({status: "success", message: "Berhasil mengubah data", data: newContent});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/admin/upload
// @desc    Get liputan
// @access  Private
router.get("/upload", async (req, res) => {
  try {
      let content = await Content.find({});
      if(content){
        return res.status(200).json({status: "success", message: "Berhasil mengambil konten", data: content});
      } else {
        return res.status(400).json({status: "failed", message: "Invalid data", data: [] });
      }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/admin/content/:id
// @desc    Delete content by id
// @access  Private
router.delete("/content/:id", /*auth,*/ async (req, res) => {
  try {
    let content = await Content.findByIdAndDelete(req.params.id);
    if(!content){
      return res.status(400).json({status: "failed", message: "Data tidak ditemukan", data: [] });
    }
    return res.status(200).json({status: "success", message: "Berhasil menghapus data", data: [] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/admin/rekomendasi
// @desc    Post rekomendasi
// @access  Private

router.post("/rekomendasi", upload.array('photos', 4), async (req, res) => {
  const {title, category, body} = req.body;
  let rekomendasi = {};
  try {
    rekomendasi = new Rekomendasi({
        title: title,
        content: body,
        category: category,
        src_img: `/assets/uploads/${req.files[0].filename}`,
      });
      
      let newRekomendasi = await rekomendasi.save();

      if(!newRekomendasi){
        return res.status(400).json({status: "failed", message: "Invalid data", data: [] });
      } 
      return res.status(200).json({status: "success", message: "Berhasil menambahkan rekomendasi", data: newRekomendasi});
    } catch (err) {
      return res.status(400).json({status: "failed", message: "Invalid data", data: [] });
    }
});

// @route   GET api/admin/rekomendasi
// @desc    Get all rekomendasi
// @access  Private
router.get("/rekomendasi", /*auth,*/ async (req, res) => {
  let sort = req.query.sort;
  let limit = req.query.limit;
  let category = req.query.category;
  let rekomendasi;
  try {
    if(category){
      rekomendasi = await Rekomendasi.find({category: category}).limit(limit).sort(sort);
    } else {
      rekomendasi = await Rekomendasi.find({}).limit(limit).sort(sort);
    }
    return res.status(200).json({status: "success", message: "Berhasil mengambil data", data: rekomendasi});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/admin/rekomendasi/:id
// @desc    Get rekomendasi by id
// @access  Private
router.get("/rekomendasi/:id", /*auth,*/ async (req, res) => {
  try {
    let data = [];
    let rekomendasi = await Rekomendasi.findById(req.params.id);
    if(!rekomendasi){
      return res.status(400).json({status: "failed", message: "Data tidak ditemukan", data: [] });
    }
    if(rekomendasi) {
      data.push(rekomendasi);
    }
    
    res.status(200).json({status: "success", message: "Berhasil mengambil data", data: data});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/admin/rekomendasi/:id
// @desc    Update rekomendasi by id
// @access  Private
router.post("/rekomendasi/:id", upload.array('photos', 4), /*auth,*/ async (req, res) => {
  try {
    let {title, category, body} = req.body;
    let newRekomendasi = await Rekomendasi.findOneAndUpdate({_id: req.params.id}, {
      title: title,
      content: body,
      category: category,
      src_img: `/assets/uploads/${req.files[0].filename}`,
    });
    
    return res.status(200).json({status: "success", message: "Berhasil mengubah data", data: newRekomendasi});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/admin/rekomendasi/:id
// @desc    Delete rekomendasi by id
// @access  Private
router.delete("/rekomendasi/:id", /*auth,*/ async (req, res) => {
  try {
    let rekomendasi = await Rekomendasi.findByIdAndDelete(req.params.id);
    if(!rekomendasi){
      return res.status(400).json({status: "failed", message: "Data tidak ditemukan", data: [] });
    }
    return res.status(200).json({status: "success", message: "Berhasil menghapus data", data: [] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});



// @route   GET api/admin/search
// @desc    Get search
// @access  Public
router.get("/search", async (req, res) => {
  let search = req.query.search;
  //let search = req.body.search;
  //search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  try {
    console.log(search);
    if(search) {
      Content.find({$or: [{"title": {$regex: search, $options: 'i'}}, {"content": {$regex: search, $options: 'i'}}, {"creator": {$regex: search, $options: "i"}}]}, (err, data) => {
        if(err) {
          return res.status(400).json({status: "failed", message: "Data tidak ditemukan", data: [] });
        }
        return res.status(200).json({status: "success", message: "Berhasil mengambil data", data: data});
      }
    );
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});




// @route   Get api/admin
// @desc get admin to dashboard
// @access  Private








module.exports = router;