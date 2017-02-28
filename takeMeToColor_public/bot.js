var Twit = require('twit')
var request = require("request")
var download = require('download-file')
var fs = require('fs');

var T = new Twit({
    consumer_key: "",
    consumer_secret: "",
    access_token: "",
    access_token_secret: "",
    timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
})

var parkLists = [];
var park = {};
var finalName;
var address;
var mapUrl;
var place = "park"; // you can change to other category (https://developers.google.com/places/supported_types)


randomLocation(49.23041, 24.3115, -66.57, -124.46); //us(https://en.wikipedia.org/wiki/List_of_extreme_points_of_the_United_States#Northernmost_points)
// randomLocation(51.05232, 42.20231, 8.13, 4.47); //france(https://en.wikipedia.org/wiki/Geography_of_France)


// pick a random location
function randomLocation(latMax, latMin, lonMax, lonMin) {
    var preLat = (Math.random() * (latMax - latMin + 1)) + latMin;
    var preLon = (Math.random() * (lonMax - lonMin + 1)) + lonMin;
    var lat = preLat.toFixed(6);
    var lon = preLon.toFixed(6);

    console.log(lat, lon);
    loadPlace(lat, lon);
}


// get the list of the place and pick one place using google place API
function loadPlace(lat, lon) {
    var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + lat + "," + lon + "&radius=50000&type=" + place + "&key=AIzaSyD8U02WSh06GW2fQjPzfqNvk9KikdvO1es";

    request({
        url: url,
        json: true
    }, function(error, response, data) {

        if (!error && response.statusCode === 200) {
            // console.log(data) // Print the json response

            for (i = 0; i < data.results.length; i++) {
                var parkName = data.results[i].name;
                parkName.replace(/[^a-z0-9]/, '');
                var parkRating = data.results[i].rating
                var parkId = data.results[i].place_id;
                if (parkRating >= 4) {
                    park[parkName] = parkId;
                    parkLists.push(parkName);
                    finalName = parkLists[Math.floor(Math.random() * parkLists.length)]
                    var id = park[finalName];
                }
            }
            if (parkLists.length > 0 && id !== undefined) {
                console.log("picked place : " + finalName);
                console.log("place_id: " + id);
                loadInfo(id);
            } else {
              randomLocation(49.23041, 24.3115, -66.57, -124.46); //us(https://en.wikipedia.org/wiki/List_of_extreme_points_of_the_United_States#Northernmost_points)
            }
        }
    })
}


// get a specific information on the picked place
function loadInfo(id) {
    var url = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + id + "&key=AIzaSyD8U02WSh06GW2fQjPzfqNvk9KikdvO1es";

    request({
        url: url,
        json: true
    }, function(error, response, data) {

        if (!error && response.statusCode === 200) {}

        var finalLat = data.result.geometry.location.lat;
        var finalLon = data.result.geometry.location.lng;
        address = data.result.vicinity.split(', ')[1];

        console.log(address);
        console.log("final latitude: " + finalLat);
        console.log("final longitude: " + finalLon);

        loadStreetView(finalLat, finalLon);
    })
}



function loadStreetView(lat, lon) {

    // get stree view from API
    var streetUrl = "https://maps.googleapis.com/maps/api/streetview?"
    var streetSize = "&size=640x640"
    var streetAngle = "&pitch=0&fov=120"
    var streetKey = "&key=AIzaSyDRZGcFFOeABAaB3WO6XPxGxM-_cg9xRao"
    var streetImg = streetUrl + streetSize + streetAngle + "&location=" + lat + "," + lon + streetKey;
    // console.log(streetImg);


    // get google map url
    mapUrl = "google.com/maps/@" + lat + "," + lon + ",250m/data=!3m1!1e3";
    console.log(mapUrl);


    // save image file into jpg
    var url = streetImg;
    var options = {
        directory: "./images/",
        filename: "map.jpg"
    }

    download(url, options, function(err) {
        if (err) throw err
        console.log("image saved!")
        setTimeout(pickColor, 500);

        // check if the image is empty
        function pickColor() {
            const path = require('path')
            const getColors = require('get-image-colors')

            getColors("images/map.jpg", function(err, colors) {
                var pixelColor1 = colors[0].css();
                // console.log(pixelColor1);

                if (pixelColor1.indexOf('227') !== -1) {
                    console.log("no image");
                    randomLocation(49.23041, 24.3115, -66.57, -124.46); //us(https://en.wikipedia.org/wiki/List_of_extreme_points_of_the_United_States#Northernmost_points)
                } else {
                    tweetIt();
                }
            })
        }
    })
}

// post tweet
function tweetIt() {

    var filename = 'images/map.jpg';
    var params = {
        encoding: 'base64'
    }
    var b64 = fs.readFileSync(filename, params);

    T.post('media/upload', {
            media_data: b64
        },
        function(error, data, response) {
            var id = data.media_id_string;
            var tweet = {
                status: finalName + " at " + address + " " + mapUrl,
                media_ids: [id]
            }

            T.post('statuses/update', tweet,
                function(error, data, response) {
                    if (error) {
                      console.log(tweet);
                        console.log('error while uploading');
                    } else {
                        console.log("tweet uploded");
                    }
                }
            );
        }
    );
}
