// ---------------------------------------------------------
// SERVER APP
// ---------------------------------------------------------

var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

// Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");
var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();


// Configure middleware
// ---------------------------------------------------------

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
mongoose.connect("mongodb://localhost/mongoscraper", { useNewUrlParser: true });


// Routes
// ---------------------------------------------------------

// A GET route for the HOME index
app.get("/", function (req, res) {
    res.send(index.html);
});

// A GET route for SCRAPING the mashable.com site
console.log("\n***********************************\n" +
            "Grabbing every thread title and link\n" +
            "from www.nytimes.com HOME page:" +
            "\n***********************************\n");
app.get("/scrape", function (req, res) {
    axios.get("http://www.nytimes.com/").then(function (response) {
        var $ = cheerio.load(response.data);
        var results = [];
        $("article").each(function (i, element) {
            var title = $(this).find("h2").text();
            var link = "https://www.nytimes.com" + $(this).find("a").attr("href");
            results.push({
                title: title,
                link: link
            });
        });
        console.log(results);
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

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({
                _id: req.params.id
            }, {
                note: dbNote._id
            }, {
                new: true
            });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);


// Start the server
// ---------------------------------------------------------
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
  