//API information
var yourConsumerKey = "";
var yourConsumerSecret = "";
var yourAccessToken = "";
var yourTokenSecret = "";

//setting
var twitterAPI = require('node-twitter-api');
var fs = require("fs");
var rita = require('rita');

// rita markov
var text = fs.readFileSync("speech.txt", 'utf8');
var markov = rita.RiMarkov(3);
markov.loadText(text);

var result = markov.generateSentences(1);
// console.log(result);


// post a tweet
var twitter = new twitterAPI({
    consumerKey: yourConsumerKey,
    consumerSecret: yourConsumerSecret});

twitter.statuses(
    "update",
    {"status": result},
    yourAccessToken,
    yourTokenSecret,
    function(error, data, response) {
        if (error) {
            console.log("something went wrong: ", error);
        }
    }
);
