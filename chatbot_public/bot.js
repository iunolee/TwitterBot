var twitterAPI = require('node-twitter-api');
var RiTa = require('rita').RiTa;
var request = require('request');

var consumerKey = "";
var consumerSecret = "";
var accessToken = "";
var tokenSecret = "";
var myScreenName = "";
var newslist = [];
var num;

// Get a article from NYT
request.get({
    url: "https://api.nytimes.com/svc/mostpopular/v2/mostviewed/U.S./1.json",
    qs: {
        'api-key': ""
    },
}, function(err, response, body) {
    body = JSON.parse(body);
    num = body.results.length;
    for (i=0; i < num; i++) {
    var news = body.results[i].abstract;
    newslist.push(news);
  }
})


var twitter = new twitterAPI({
    consumerKey: consumerKey,
    consumerSecret: consumerSecret
});

twitter.getStream("user", {}, accessToken, tokenSecret, onData);

// Get a data dan Send a direct message
function onData(error, streamEvent) {
    if (streamEvent.hasOwnProperty('direct_message')) {
        var dmText = streamEvent['direct_message']['text'];
        var senderName = streamEvent['direct_message']['sender']['screen_name'];
        // streaming API sends us our own direct messages! skip if we're
        // the sender.
        if (senderName == myScreenName) {
            return;
        }
        var outgoingText;
        var pickedNews = newslist[Math.floor(Math.random() * num)]

        var word = getRandomWord(dmText);
        if (word) {
            outgoingText = "What do you mean by " + word + "?";
            console.log("sent")

        } else {
            outgoingText = "Hey! Do you know that " + pickedNews + "?";
            console.log("sent")

        }
        // send a response!
        twitter.direct_messages(
            'new', {
                "screen_name": senderName,
                "text": outgoingText
            },
            accessToken,
            tokenSecret,
            function(err, data, resp) {
                console.log(err);
            }
        );
    }
}


function getRandomWord(text) {
    var tagged = RiTa.getPosTagsInline(text);
    var taggedWords = tagged.split(" ");
    var words = [];
    for (var i = 0; i < taggedWords.length; i++) {
        var parts = taggedWords[i].split("/");
        if (parts[1] == 'nn' || parts[1] == 'nns' || parts[1] == 'vbd' || parts[1] == 'vb' || parts[1] == 'vbg' || parts[1] == 'vbn' || parts[1] == 'vbp' || parts[1] == 'vbz' || parts[1] == 'jj' || parts[1] == 'jjr' || parts[1] == 'jjs' || parts[1] == 'rb' || parts[1] == 'rbr' || parts[1] == 'rbs') {
            words.push(parts[0]);
        }
    }
    if (words.length > 0) {
        return words[Math.floor(Math.random() * words.length)];
    } else {
        return "";
    }
}
