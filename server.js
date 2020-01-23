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

// NEW ******************************

// Delete an article
app.post("/articles/delete/:id", function (req, res) {
    // Use the article id to find and update its saved boolean
    Article.findOneAndUpdate({
            "_id": req.params.id
        }, {
            "saved": false,
            "notes": []
        })
        // Execute the above query
        .exec(function (err, doc) {
            // Log any errors
            if (err) {
                console.log(err);
            } else {
                // Or send the document to the browser
                res.send(doc);
            }
        });
});


// Create a new note
app.post("/notes/save/:id", function(req, res) {
// Create a new note and pass the req.body to the entry
var newNote = new Note({
  body: req.body.text,
  article: req.params.id
});
console.log(req.body)
// And save the new note the db
newNote.save(function(error, note) {
  // Log any errors
  if (error) {
    console.log(error);
  }
  // Otherwise
  else {
    // Use the article id to find and update it's notes
    Article.findOneAndUpdate({ "_id": req.params.id }, {$push: { "notes": note } })
    // Execute the above query
    .exec(function(err) {
      // Log any errors
      if (err) {
        console.log(err);
        res.send(err);
      }
      else {
        // Or send the note to the browser
        res.send(note);
      }
    });
  }
});
});

// Delete a note
app.delete("/notes/delete/:note_id/:article_id", function(req, res) {
// Use the note id to find and delete it
Note.findOneAndRemove({ "_id": req.params.note_id }, function(err) {
  // Log any errors
  if (err) {
    console.log(err);
    res.send(err);
  }
  else {
    Article.findOneAndUpdate({ "_id": req.params.article_id }, {$pull: {"notes": req.params.note_id}})
     // Execute the above query
      .exec(function(err) {
        // Log any errors
        if (err) {
          console.log(err);
          res.send(err);
        }
        else {
          // Or send the note to the browser
          res.send("Note Deleted");
        }
      });
  }
});
});


// END NEW **************************

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoscraper";
mongoose.connect(MONGODB_URI);


// Start the server
// ---------------------------------------------------------
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});