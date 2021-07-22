const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const ejs = require("ejs");
const config = require("./config/database");
var port = process.env.PORT || 3000;
require('dotenv').config({ path: "./.env.example"} );

var csrf = require ('csurf');
var csrfProtection = csrf();

var cookieSession = require('cookie-session')
const multer = require("./config/multer")
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});
mongoose.connect(process.env.database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
let db = mongoose.connection;

db.once("open", function () {
  console.log("Connected to MongoDB");
});

db.on("error", function (err) {
  console.log(err);
});

const app = express();
const csrfApp = express();

let Event = require("./models/events");
let User = require("./models/user");
const { Router } = require("express");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));



csrfApp.set("views", path.join(__dirname, "views"));
csrfApp.set("view engine", "ejs");

csrfApp.use(bodyParser.urlencoded({ extended: false }));
csrfApp.use(bodyParser.json());

csrfApp.use(express.static(path.join(__dirname, "public")));



app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

csrfApp.use(csrfProtection);

app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

app.use(
  expressValidator({
    errorFormatter: function (param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParamn += "[" + namespace.shift() + "]";
      }

      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
  })
);

require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

function convertTZ(date, tzString) {
  return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}

app.get("*", function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("danger", "Please login");
    res.redirect("/");
  }
}

app.get("/", function (req, res) {
  var collection = db.collection("events");
  collection.find({}).toArray(function (err, result) {
    if (err) {
      console.log(err);
    } else {
      let name;
      if(typeof req.session.user !== 'undefined' && req.session.user !== null){
        name = req.session.user.name;
      }
      let length;
      if(result.length > 9 ){
        length = 9;
      }else{
        length = result.length;
      }
      res.render("homepage",{
        eventData: result,
        name:name,
        length:length,
      })
    }
  });
});

app.get("/events", async function (req, res) {
  let name;
  if(typeof req.session.user !== 'undefined' && req.session.user !== null){
    name = req.session.user.name;
  }
  const sportData = await Event.find({event_category:'Sport'});
  const cultureData = await Event.find({event_category:'Culture'});
  const othersData = await Event.find({event_category:'Others'});
  res.render("events", {
    sportData:sportData,
    cultureData:cultureData,
    othersData:othersData,
    name:name,
  });
});

app.get('/search', async function (req, res) {
  let name;
  if(typeof req.session.user !== 'undefined' && req.session.user !== null){
    name = req.session.user.name;
  }
  const sportData = await Event.find({event_category:'Sport'});
  const cultureData = await Event.find({event_category:'Culture'});
  const othersData = await Event.find({event_category:'Others'});
  res.render("events", {
    sportData:sportData,
    cultureData:cultureData,
    othersData:othersData,
    name:name
  });
});

app.post("/search", async function (req, res) {
  let name;
  if(typeof req.session.user !== 'undefined' && req.session.user !== null){
    name = req.session.user.name;
  }
  console.log();
  const sq = req.body.query.toLowerCase();
  const sportData = await Event.find({event_category:'Sport',$or:[{event_name: { $regex: sq, $options: "i" }},{location: { $regex: sq, $options: "i" }}]});
  const cultureData = await Event.find({event_category:'Culture',$or:[{event_name: { $regex: sq, $options: "i" }},{location: { $regex: sq, $options: "i" }}]});
  const othersData = await Event.find({event_category:'Others',$or:[{event_name: { $regex: sq, $options: "i" }},{location: { $regex: sq, $options: "i" }}]});
  res.render("events", {
    sportData:sportData,
    cultureData:cultureData,
    othersData:othersData,
    name:name
  });
});

app.get("/eventDashboard/", async function (req, res) {
  const data = await Event.find({organiser:req.session.id});
  const uData = await User.findById(req.session.id);
  let name;
  console.log(data);
  if(typeof req.session.user !== 'undefined' && req.session.user !== null){
    name = req.session.user.name;
  res.render("addEvent", {
    name:name,
    id: req.session.id,
    eventData:data,
    errors:'',
  });
  }
  else{
  res.redirect("/");
  }
});

app.get("/events/:id",async function (req, res) {
  let name;
  if(typeof req.session.user !== 'undefined' && req.session.user !== null){
    name = req.session.user.name;
  }
  console.log(req.session.user);
  Event.findById(req.params.id, function (err, result) {
    console.log(result);
    User.findById(result.organiser, function (err, user) {
      res.render("singleevent", {
        result: result,
        email: user.email,
        host: user.username,
        name: name,
      });
    });
  });
});
app.get("/category/upc", function (req, res) {
  var collection = db.collection("events");
  collection
    .find()
    .sort({ date: 1 })
    .toArray(function (err, result) {
      if (err) {
        return err;
      } else {
        res.render("orderBy", {
          title: "Up and coming",
          eventData: result,
        });
      }
    });
});

app.get("/category/pop", function (req, res) {
  var collection = db.collection("events");
  collection
    .find()
    .sort({ __v: -1 })
    .toArray(function (err, result) {
      if (err) {
        return err;
      } else {
        res.render("orderBy", {
          title: "Most popular",
          eventData: result,
        });
      }
    });
});

app.get("/category/alpha", function (req, res) {
  var collection = db.collection("events");
  collection
    .find()
    .sort({ event_name: 1 })
    .toArray(function (err, result) {
      if (err) {
        return err;
      } else {
        res.render("orderBy", {
          title: "Alphabetical Order",
          eventData: result,
        });
      }
    });
});

app.get("/about", function (req,res) {
  let name;
  if(typeof req.session.user !== 'undefined' && req.session.user !== null){
    name = req.session.user.name;
  }
  res.render("about",{name:name});
})

app.get("/contact", function (req,res) {
  let name;
  if(typeof req.session.user !== 'undefined' && req.session.user !== null){
    name = req.session.user.name;
  }
  res.render("contact",{name:name});
})

app.get("/register",function(req,res,next){
  csrfApp(req,res,next);
});


app.post("/login",function(req,res,next){
  csrfApp(req,res,next);
});

csrfApp.get("/register", function (req, res) {
  let name;
  if(typeof req.session.user !== 'undefined' && req.session.user !== null){
    name = req.session.user.name;
  }

  res.render("registerpage", {
    info: "",
    name: name,
    csrfToken : req.csrfToken()
  });
});

app.post("/register", function (req, res) {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody("username", "A username is required").notEmpty();
  req.checkBody("email", "An email address is required").notEmpty();
  req.checkBody("email", "Email is not valid").isEmail();
  req.checkBody("password", "Password is required").notEmpty();
  req
    .checkBody("password2", "Passwords do not match")
    .equals(req.body.password);

  let errors = req.validationErrors();

  if (errors) {
    console.log(errors);
    res.render("registerpage", {
      info: errors,
    });
  } else {
    let newUser = new User({
      username: username,
      email: email,
      password: password,
    });

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(newUser.password, salt, function (err, hash) {
        if (err) {
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(async function (err, docs, info) {
          if (err) {
            console.log(err, docs, info);
            return;
          } else {
            req.flash("success", "You are now registered and can log in");
            const data = await Event.find({organiser:docs._doc._id});
            res.render("addEvent", {
              login: true,
              name: username,
              errors: "",
              id: docs._doc._id,
              eventData:data,
            });
          }
        });
      });
    });
  }
});

csrfApp.post("/login",  function (req, res, next) {

  let username = req.body.username;
  
  req.session.user = {
    name : req.body.username,
    password : req.body.password
  }


  passport.authenticate("local",async function (err, docs, info) {
    if (docs == false) {
      res.render("registerpage", {
        info: info,
        csrfToken : req.csrfToken()
      });
    } else {
      console.log('DATA RECEIVED');
      req.session.id = docs._doc._id;
      res.redirect(`/eventDashboard/`);
    }
  })(req, res, next);
});


app.get("/logout", function (req, res) {
  req.session.user = null;
  req.logout();
  req.flash("success", "You are logged out.");
  res.redirect("/");
});

app.get("/create/:id", ensureAuthenticated, async function (req, res) {
  let name;
  if(typeof req.session.user !== 'undefined' && req.session.user !== null){
    name = req.session.user.name;
  }
  const data = await Event.find({organiser:req.session.id});
  res.render("addEvent", {
    name: name,
    id: req.session.id,
    eventData:data,
    errors:'',
  })});

app.post("/eventDashboard/:id", multer.any(), async function (req, res) {
  req.checkBody("event_category", "You need to select an event").notEmpty();
  req.checkBody("event_name", "Event name is required").notEmpty();
  req.checkBody("location", "Location is required").notEmpty();
  req.checkBody("description", "Description is required").notEmpty();
  req.checkBody("date", "Date is required").notEmpty();

  let name;
  if(typeof req.session.user !== 'undefined' && req.session.user !== null){
    name = req.session.user.name;
  }
  let errors = await req.validationErrors();
  let data = await Event.find({organiser:req.body.id});
  if (errors) {
    console.log(errors);
    res.render("addEvent", {
      login: true,
      name: name,
      errors: errors,
      id: req.body.id,
      eventData:data,
    });
  } else {
    let url = "";
    try{
      const result = await cloudinary.uploader.upload(req.files[0].path);
      url = result.url
    }
    catch(err){
      console.log(err);
      res.render("addEvent", {
        login: true,
        name: name,
        errors: errors,
        id: req.body.id,
        eventData:data,
      });
      return;
    }
    let events = new Event();
    events.event_category = req.body.event_category;
    events.event_name = req.body.event_name;
    events.location = req.body.location;
    events.description = req.body.description;
    events.date = req.body.date;
    events.organiser = req.body.id;
    events.image = url;
    events.save(async function (err) {
      if (err) {
        console.log(err);
        res.render("addEvent", {
          errors: { message: "An error occurred.Please refresh the page" },
          id: events.organiser,
          name: req.body.name,
          login: true,
          eventData:data,
        });
      } else {
        res.redirect(`/eventDashboard`);
      }
    });
  }
  
});

app.post("/edit/:id", async function (req, res) {
  req.checkBody("event_category", "You need to select an event").notEmpty();
  req.checkBody("event_name", "Event name is required").notEmpty();
  req.checkBody("location", "Location is required").notEmpty();
  req.checkBody("description", "Description is required").notEmpty();
  req.checkBody("date", "Date is required").notEmpty();

  let errors = req.validationErrors();
  if (errors) {
    console.log(errors);
    res.redirect("/");
  } else {
    let events = {};
    events.event_category = req.body.event_category;
    events.event_name = req.body.event_name;
    events.location = req.body.location;
    events.description = req.body.description;
    events.date = req.body.date;
    Event.findByIdAndUpdate(req.params.id,events,async function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('SUCCESS');
        req.flash("success", "Event Updated");
        let data = await Event.find({organiser:req.body.id});
        res.redirect(`/eventDashboard`);
      }});
  }
});

app.post("/delete/:id", function (req, res) {
    Event.findByIdAndRemove(req.params.id,function (err) {
      if (err) {
        console.log(err);
      }else{
        console.log('Deleted');
      }
    });
});

app.get("/events/", function (req, res) {
  let name;
  if(typeof req.session.user !== 'undefined' && req.session.user !== null){
    name = req.session.user.name;
  }
  Event.findById(req.session.id, function (err, result) {
    User.findById(result.organiser, function (err, user) {
      res.render("events", {
        result: result,
        email: user.email,
        host: user.username,
        name:name,
      });
    });
  });
});
app.post("/events/:id", function (req, res) {
  Event.findById(req.params.id, function (err, theUser) {
    if (err) {
      console.log(err);
    } else {
      theUser.__v += 1;
      theUser.save();
    }
  });
});

app.get("/events/edit/", ensureAuthenticated, function (req, res) {
  let name;
  if(typeof req.session.user !== 'undefined' && req.session.user !== null){
    name = req.session.user.name;
  }
  Event.findById(req.session.id, function (err, result) {
    if (result.organiser != req.user._id) {
      req.flash("danger", "Not Authorized");
      res.redirect("/eventsDashboard");
    }
    res.render("edit_event", {
      result: result,
      name:name,
    });
  });
});

app.listen(port, function () {
  console.log("Server started on port 3000");
})
