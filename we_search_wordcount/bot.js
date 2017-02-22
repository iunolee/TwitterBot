var twitterAPI = require('node-twitter-api');
var RiTa = require('rita').RiTa;

var consumerKey = "NhwD43E2ngusHKj89BMHSiOV5";
var consumerSecret = "9olMD5Xyux6eto3P4WYEs6kE1YbU3MbMk6qkg5Ik0aM4RPbEpb";
var accessToken = "834188886322642944-YulS5GSr0GvswA5bvcAA5SGMMzZKjYK";
var tokenSecret = "KjuwO1cO3reD3FZAp25mYUflBDcjo17xY01WLUwiHRFlZ";

var finalWords = [];

var twitter = new twitterAPI({
    consumerKey: consumerKey,
    consumerSecret: consumerSecret
});


twitter.search({
        "q": "we",
        "result_type": "mixed",
        "count": 100
    },
    accessToken,
    tokenSecret,

    function(error, data, response) {

        if (error) {
            console.log("something went wrong: " + util.inspect(error));
        }

        var statuses = data['statuses'];
        var counts = {};
        var result = [];
        var keys = [];

        for (var i = 0; i < statuses.length; i++) {
            var thisText = statuses[i]['text'].toLowerCase();
            thisText = thisText.split('@')[0];
            thisText = thisText.split('rt')[0];
            thisText = thisText.split('http')[0];
            if (thisText.endsWith(".")) {
                thisText = thisText.slice(0, -1);
            }
            if (thisText !== "") {
                result.push(thisText);
            }
            var allwords = result.join("\n");
            var tokens = allwords.split(/\W+/);
            for (var j = 0; j < tokens.length; j++) {
                var word = tokens[i];
                if (counts[word] === undefined) {
                    counts[word] = 1;
                    keys.push(word);
                } else {
                    counts[word]++;
                }
            }
        }

        keys.sort(compare);

        function compare(a, b) {
            var countA = counts[a];
            var countB = counts[b];
            return countB - countA;
        }

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
        }

        var tagged = RiTa.getPosTagsInline(keys)
        var taggedWords = tagged.split(" ");
        console.log(taggedWords);
        for (var i = 0; i < taggedWords.length; i++) {
            var parts = taggedWords[i].split("/");
            if (parts[1] == 'vbd' || parts[1] == 'vb' || parts[1] == 'vbn' || parts[1] == 'vbp' || parts[1] == 'vbz') {
                if (parts[0] !== 'was' && parts[0] !== 'is' && parts[0] !== 'are' && parts[0] !== 'be' && parts[0] !== 'were' && parts[0] !== 'been' && parts[0] !== 'get' && parts[0] !== 'got' && parts[0] !== 'don') {
                    var args = {
                        person: RiTa.FIRST_PERSON
                    };
                    RiTa.conjugate(parts[0], args);
                    finalWords.push(parts[0]);
                }
            }
        }
        console.log(finalWords);

        twitter.statuses(
            "update", {
                "status": 'We ' + finalWords[0] + ', ' + finalWords[1] + ' and ' + finalWords[2]
            },
            accessToken,
            tokenSecret,
            function(error, data, response) {
                if (error) {
                    console.log("something went wrong: ", error);
                }
            }
        );
    }
);
