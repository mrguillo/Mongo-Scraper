// Require mongoose
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
// var uniqueValidator = require("mongoose-unique-validator");
var Note = require("./Note");

// Create article schema
var ArticleSchema = new Schema({
    title: {
        type: String,
        required: true,

    },
    summary: {
        type: String,
        default: "no summary available",
    },
    link: {
        type: String,
        required: true,

    },
    scraped_at: { 
        type: Date, 
        required: true, 
        default: Date.now 
    },
    saved: {
        type: Boolean,
        default: false
    },
    notes: [{
        type: Schema.Types.ObjectId,
        ref: "Note"
    }]
});

// Create the Article model with the ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);

// Export the model
module.exports = Article;