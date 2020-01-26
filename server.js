// ---------------------------------------------------------
// SERVER APP
// ---------------------------------------------------------

// Require all models
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var moment = require('moment');
moment().format();

// Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");
var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();


// Configure middleware
// ---------------------------------------------------------

app.use(logger("dev"));
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(express.static(__dirname + "/public"));
mongoose.connect("mongodb://localhost/mongoscraper", {
    useNewUrlParser: true
});
// Parse application body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set Handlebars.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Routes
// ---------------------------------------------------------

// A GET route for the HOME index
app.get("/", function (req, res) {
    db.Article.find({
            "saved": false
        }).then(function (object) {
            console.log(object[0].title);
            // object={ saved: false, title: 'Senate Opens Proceedings in Utter Acrimony', link: 'https://www.nytimes.com/2020/01/21/us/politics/trump-impeachment-trial.html', __v: 0 };
            // res.json(object);
            res.render("home", {data:object});
        })
        .catch(function (err) {
            console.log("catch");
            res.json(err);
        });
});

// A GET route for SCRAPING the mashable.com site
console.log("\n***********************************\n" +
    "Grabbing every thread title and link\n" +
    "from www.nytimes.com HOME page:" +
    "\n***********************************\n");
app.get("/scrape", function (req, res) {
    axios.get("http://www.nytimes.com/").then(function (response) {
        var $ = cheerio.load(response.data);
        var result = {};
        $("article").each(function (i, element) {
            result.title = $(this).find("h2").text();
            result.link = "https://www.nytimes.com" + $(this).find("a").attr("href");
            result.summary = $(this).find("p").text();
            console.log(result);
            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err);
                    res.json(err);
                });
        });
        res.send("www.nytimes.com home page succesfuly scraped and saved to MongoDB " + moment().calendar());
    });
});

// Route for GETTING ALL ARTICLES from the db
app.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    db.Article.findOne({
            _id: req.params.id
        })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Rout dusplaying saved articles
app.get("/saved", function (req, res) {
    db.Article.find({
            "saved": true
        }).then(function (object) {
            console.log(object[0].title);
            res.render("saved", {data:object});
        })
        .catch(function (err) {
            console.log("catch");
            res.json(err);
        });
});

// Posts saved articles 
app.get("/saved/:id", function(req, res) {
    db.Article.findOneAndUpdate({"_id": req.params.id}, {"$set": {"saved": true}})
    .then(function(result) {
        console.log("article saved")
        res.json(result);
    }).catch(function(err){ res.json(err) });
});


var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoscraper";
mongoose.connect(MONGODB_URI);

// Start the server
// ---------------------------------------------------------
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});