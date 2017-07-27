var express = require('express');
var ejs = require('ejs');
var randomNumber = require('random-js')();
var request = require('request');
var fs = require('file-system');
var https = require('https');
var http = require('http');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('home');
});


function getResult(state,city,name,operating,address, img, rating, phone,url, latitude, longtitude,references) {
  var container="";
    var url2 = "'" + url + "'";
    var references2 = "'" + references + "'";
    var formattedName = "'" + name + "'";

  if (phone == null) {
    phone = "N/A";
  }

  if (rating == null) {
    rating = "N/A";
    if(operating=="Open Now") {
        container += '<figure class="snip1336" ><div id="ribbon" style="background:-webkit-linear-gradient(top,#33cc33,#33cc33)">' +
            '<span id="content" style="">Open</span></div><img src="' + img + '"/>' +
            '<figcaption><div class="profile"><span id="rating">' + rating + '</span></div><h2>' +
            name + '<span>' + city + ', ' + state + '</span></h2><p>' + address + ' <br/><br/>Opening hours: ' + operating +
            '<br/><br/>' + phone + '</p> <a class="follow"><span onclick="getDirection(' + latitude + ',' + longtitude + ')">' +
            'Map</span></a><a class="info"><span onclick="getPlaceDetails(' + formattedName + ',' + url2 + ',' + references2 + ')">More Info</span></a></figcaption></figure>';
    } else {
        container += '<figure class="snip1336" ><div id="ribbon" style="background:-webkit-linear-gradient(top,#ff0000,#ff0000)">' +
            '<span id="content" style="">Close</span></div><img src="' + img + '"/>' +
            '<figcaption><div class="profile"><span id="rating">' + rating + '</span></div><h2>' +
            name + '<span>' + city + ', ' + state + '</span></h2><p>' + address + ' <br/><br/>Opening hours: ' + operating +
            '<br/><br/>' + phone + '</p> <a class="follow"><span onclick="getDirection(' + latitude + ',' + longtitude + ')">' +
            'Map</span></a><a class="info"><span onclick="getPlaceDetails(' + formattedName + ',' + url2 + ',' + references2 + ')">More Info</span></a></figcaption></figure>';

    }
    } else {
      rating = rating.toPrecision(2);
      if(operating=="Open Now") {
          container += '<figure class="snip1336" ><div id="ribbon" style="background:-webkit-linear-gradient(top,#33cc33,#33cc33)">' +
              '<span id="content" style="">Open</span></div><img src="' + img + '"/>' +
              '<figcaption><div class="profile"><span id="rating">' + rating + '<span id="sub-rating">/5</span></span></div><h2>' +
              name + '<span>' + city + ', ' + state + '</span></h2><p>' + address + ' <br/><br/>Opening hours: ' + operating +
              '<br/><br/>' + phone + '</p> <a class="follow"><span onclick="getDirection(' + latitude + ',' + longtitude + ')">' +
              'Map</span></a><a class="info" ><span onclick="getPlaceDetails(' + formattedName + ',' + url2 + ',' + references2 + ')">More Info</span></a></figcaption></figure>';
      } else {
          container += '<figure class="snip1336" ><div id="ribbon" style="background:-webkit-linear-gradient(top,#ff0000,#ff0000)">' +
              '<span id="content" style="">Close</span></div><img src="' + img + '"/>' +
              '<figcaption><div class="profile"><span id="rating">' + rating + '<span id="sub-rating">/5</span></span></div><h2>' +
              name + '<span>' + city + ', ' + state + '</span></h2><p>' + address + ' <br/><br/>Opening hours: ' + operating +
              '<br/><br/>' + phone + '</p> <a class="follow"><span onclick="getDirection(' + latitude + ',' + longtitude + ')">' +
              'Map</span></a><a class="info" ><span onclick="getPlaceDetails(' + formattedName + ',' + url2 + ',' + references2 + ')">More Info</span></a></figcaption></figure>';

      }
  }

  return container;
}


function getResultDetails(placename,phone,address,time,image, suburb, rating, review){
    var details="";

    details+=  '<i class="close icon"></i>'+
        '<div class="header">Restaurant Details</div><div class="image content"><div class="ui medium image">'+
        '<img src="'+image+'"> </div> <div class="description">'+
        '<div class="ui header">'+placename+'</div><p>Suburb: '+ suburb +'</p>'+
        '<p>Phone:'+phone+'</p><p>Venue: '+address+'</p><p>Rating: '+rating+'</p>' +
        '<p>Reviews: '+review+'</p><p>Operating Hours:<br/>'+time+'</p>'+
        '</div> </div> <div class="actions"> <div class="ui black deny button">'+
        'Close </div></div>';

    return details;
}

router.get('/weatherDetails', function(appReq,appRes) {
    var lat= appReq.query.lat;
    var lng= appReq.query.lng;


        http.get('http://api.openweathermap.org/data/2.5/weather?lat='+lat+'&lon='+lng+'&APPID=d6823f836aa55491dae56cce038c8a5a', function(res) {
            var body = [];
            res.on('data', function(chunk) {
                body.push(chunk);
            });

            res.on('end', function(){
                var bodyString = body.join('');
                var weatherDetail = JSON.parse(bodyString);
                var resultWeather="";
                var main = weatherDetail.weather[0].main;
                var degree = weatherDetail.main.temp;
                var formattedDegree = (degree- 32) * 5 / 9 ;

                resultWeather += "Weather: ";
                resultWeather += main;

                formattedDegree = formattedDegree.toPrecision(2);
                resultWeather += "<br/>Temperature: ";
                resultWeather += formattedDegree + " *C";
                appRes.send(resultWeather);
            });
        });
})


router.get('/searchDetails', function(appReq,appRes) {
    var placeID = appReq.query.place_id;
    var placeName = appReq.query.place_name;
    var referID = appReq.query.references;

    (function () {

        "use strict";
        var resultDetails="";
        var formattedPhone = "";
        var formattedAddress = "";
        var formattedTime = "";
        var imageUrl = "";

        var assert = require("assert");

        var PlaceDetailsRequest = require("../node_modules/googleplaces/lib/PlaceDetailsRequest.js");
        var setupConfig = require("../config.js");

        var placeDetailsRequest = new PlaceDetailsRequest(setupConfig.apiKey, setupConfig.outputFormat);
        var parameters = {
            placeid: placeID
        };

        placeDetailsRequest(parameters, function (error, response) {
            if (error) throw error;

            assert.equal(response.status, "OK", "Place details request response status is OK");


            formattedAddress = response.result.formatted_address;
            formattedPhone = response.result.formatted_phone_number;
            if(typeof response.result.opening_hours!=='undefined') {
                formattedTime += response.result.opening_hours.weekday_text[0] + '<br/>';
                formattedTime += response.result.opening_hours.weekday_text[1] + '<br/>';
                formattedTime += response.result.opening_hours.weekday_text[2] + '<br/>';
                formattedTime += response.result.opening_hours.weekday_text[3] + '<br/>';
                formattedTime += response.result.opening_hours.weekday_text[4] + '<br/>';
                formattedTime += response.result.opening_hours.weekday_text[5] + '<br/>';
                formattedTime += response.result.opening_hours.weekday_text[6] + '<br/>';
            }
            var suburb = "";



                suburb += response.result.address_components[3].long_name + ", ";
            if(typeof response.result.address_components[5] !== 'undefined') {
                suburb += response.result.address_components[5].long_name ;
                if(typeof response.result.address_components[6] !== 'undefined') {
                    suburb += " (" + response.result.address_components[6].short_name + ")";
                }
            } else {
                suburb += "Not Available";
            }
            var rating = response.result.rating;
            var review = response.result.reviews.length;
            if(rating==null) {
                rating="N/A";
            }

            (function() {
            var ImageGet  = require("../node_modules/googleplaces/lib/ImageFetch.js");
            var config = require("../config.js");

            var imageFetch = new ImageGet(config.apiKey);

            var parameters = {
                photoreference: referID,
                sensor: false
            };

            imageFetch(parameters, function (error, response) {
                if (error) throw error;
                imageUrl = response;
                if(formattedTime==null) {
                    formattedTime = "Not Available";
                }
                resultDetails = getResultDetails(placeName,formattedPhone,formattedAddress,formattedTime,imageUrl,suburb,rating,review);
                appRes.send(resultDetails);
            });

            })();

        });

    })();

});


router.get('/search', function(appReq,appRes) {
    var resultData = "";
    var name =  "";
    var city= "";
    var state= "";
    var country= "";
    var operating = "";
    var lat_Series = "";
    var lng_Series = "";
    var formattedAddress = "";
    var url= "";
    var image= "";
    var phone = "";
    var rating = "";
    var totalimage = new Array();
    totalimage.push("images/restaurant1.jpg");
    totalimage.push("images/restaurant2.jpg");
    totalimage.push("images/restaurant3.jpg");
    totalimage.push("images/restaurant4.jpg");
    totalimage.push("images/restaurant5.jpg");
    totalimage.push("images/restaurant6.jpg");
    totalimage.push("images/restaurant7.jpg");
    totalimage.push("images/restaurant8.jpg");
    totalimage.push("images/restaurant9.jpg");


    var lat = appReq.query.lat;
    var lng = appReq.query.lng;

    (function () {
        "use strict";
        var assert = require("assert");

        var NearBy = require("../node_modules/googleplaces/lib/NearBySearch");
        var setupConfig = require("../config.js");

        var nearBySearch = new NearBy(setupConfig.apiKey, setupConfig.outputFormat);

        var parameters = {
            location: [lat, lng],
            keyword: "restaurant",

        };


        nearBySearch(parameters, function (error, response) {
            if (error) throw error;
            assert.notEqual(response.results.length, 0, "Place search must not return 0 results");
            for (var i = 0; i < response.results.length ; i++) {

                name = response.results[i].name;
                lat_Series = response.results[i].geometry.location.lat;
                lng_Series = response.results[i].geometry.location.lng;
                formattedAddress = response.results[i].vicinity;
                var fullAddress = new Array();
                fullAddress =  formattedAddress.split(",");
                city = fullAddress[fullAddress.length-1];
                city = city.replace(/,/g, "");
                if(typeof response.results[i].opening_hours!== 'undefined') {
                    if(response.results[i].opening_hours.open_now) {
                        operating  = "Open Now";
                    } else {
                        operating = "Closed";
                    }
                } else {
                    operating =  "Not Available";
                }

                var photoReference="";
                if(typeof response.results[i].photos!=='undefined') {
                    photoReference = response.results[i].photos[0].photo_reference;
                }

                if(photoReference!==null) {
                    image = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=" + photoReference + "&sensor=false&key=AIzaSyDFttEnKV9sSFoI8SrZXZK00W-gNwtCcMQ";

                }


                var value = randomNumber.integer(0,8);
                image = totalimage[value];
                rating = response.results[i].rating;
                url = response.results[i].place_id;
                name = name.split("'").join('');

                resultData +=getResult(state,city,name,operating, formattedAddress, image, rating, phone,url, lat_Series, lng_Series,photoReference);

            }

            appRes.send(resultData);
        });

    })();

});

router.get('/searchBar', function(appReq,appRes) {
    var resultData = "";
    var name =  "";
    var city= "";
    var state= "";
    var country= "";
    var operating = "";
    var lat_Series = "";
    var lng_Series = "";
    var formattedAddress = "";
    var url= "";
    var image= "";
    var phone = "";
    var rating = "";
    var totalimage = new Array();
    totalimage.push("images/bar1.jpg");
    totalimage.push("images/bar2.jpg");
    totalimage.push("images/bar3.jpg");
    totalimage.push("images/bar4.jpg");
    totalimage.push("images/bar5.jpg");
    totalimage.push("images/bar6.jpg");
    totalimage.push("images/bar7.jpg");
    totalimage.push("images/bar8.jpg");
    totalimage.push("images/bar9.jpg");


    var lat = appReq.query.lat;
    var lng = appReq.query.lng;

    (function () {
        "use strict";
        var assert = require("assert");

        var NearBy = require("../node_modules/googleplaces/lib/NearBySearch");
        var setupConfig = require("../config.js");

        var nearBySearch = new NearBy(setupConfig.apiKey, setupConfig.outputFormat);

        var parameters = {
            location: [lat, lng],
            keyword: "bar",

        };


        nearBySearch(parameters, function (error, response) {
            if (error) throw error;
            assert.notEqual(response.results.length, 0, "Place search must not return 0 results");
            for (var i = 0; i < response.results.length ; i++) {

                name = response.results[i].name;
                lat_Series = response.results[i].geometry.location.lat;
                lng_Series = response.results[i].geometry.location.lng;
                formattedAddress = response.results[i].vicinity;
                var fullAddress = new Array();
                fullAddress =  formattedAddress.split(",");
                city = fullAddress[fullAddress.length-1];
                city = city.replace(/,/g, "");
                if(typeof response.results[i].opening_hours!== 'undefined') {
                    if(response.results[i].opening_hours.open_now) {
                        operating  = "Open Now";
                    } else {
                        operating = "Closed";
                    }
                } else {
                    operating =  "Not Available";
                }

                var photoReference="";
                if(typeof response.results[i].photos!=='undefined') {
                    photoReference = response.results[i].photos[0].photo_reference;
                }

                if(photoReference!==null) {
                    image = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=" + photoReference + "&sensor=false&key=AIzaSyDFttEnKV9sSFoI8SrZXZK00W-gNwtCcMQ";

                }


                var value = randomNumber.integer(0,8);
                image = totalimage[value];
                rating = response.results[i].rating;
                url = response.results[i].place_id;
                resultData +=getResult(state,city,name,operating, formattedAddress, image, rating, phone,url, lat_Series, lng_Series,photoReference);

            }

            appRes.send(resultData);
        });

    })();

});


router.get('/searchCafe', function(appReq,appRes) {
    var resultData = "";
    var name =  "";
    var city= "";
    var state= "";
    var country= "";
    var operating = "";
    var lat_Series = "";
    var lng_Series = "";
    var formattedAddress = "";
    var url= "";
    var image= "";
    var phone = "";
    var rating = "";
    var totalimage = new Array();
    totalimage.push("images/cafe1.jpg");
    totalimage.push("images/cafe2.jpg");
    totalimage.push("images/cafe3.jpg");
    totalimage.push("images/cafe4.jpg");
    totalimage.push("images/cafe5.jpg");
    totalimage.push("images/cafe6.jpg");
    totalimage.push("images/cafe7.jpg");
    totalimage.push("images/cafe8.jpg");
    totalimage.push("images/cafe9.jpg");


    var lat = appReq.query.lat;
    var lng = appReq.query.lng;

    (function () {
        "use strict";
        var assert = require("assert");

        var NearBy = require("../node_modules/googleplaces/lib/NearBySearch");
        var setupConfig = require("../config.js");

        var nearBySearch = new NearBy(setupConfig.apiKey, setupConfig.outputFormat);

        var parameters = {
            location: [lat, lng],
            keyword: "coffee",

        };


        nearBySearch(parameters, function (error, response) {
            if (error) throw error;
            assert.notEqual(response.results.length, 0, "Place search must not return 0 results");
            for (var i = 0; i < response.results.length ; i++) {

                name = response.results[i].name;
                lat_Series = response.results[i].geometry.location.lat;
                lng_Series = response.results[i].geometry.location.lng;
                formattedAddress = response.results[i].vicinity;
                var fullAddress = new Array();
                fullAddress =  formattedAddress.split(",");
                city = fullAddress[fullAddress.length-1];
                city = city.replace(/,/g, "");
                if(typeof response.results[i].opening_hours!== 'undefined') {
                    if(response.results[i].opening_hours.open_now) {
                        operating  = "Open Now";
                    } else {
                        operating = "Closed";
                    }
                } else {
                    operating =  "Not Available";
                }

                var photoReference="";
                if(typeof response.results[i].photos!=='undefined') {
                    photoReference = response.results[i].photos[0].photo_reference;
                }

                if(photoReference!==null) {
                    image = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=" + photoReference + "&sensor=false&key=AIzaSyDFttEnKV9sSFoI8SrZXZK00W-gNwtCcMQ";

                }


                var value = randomNumber.integer(0,8);
                image = totalimage[value];
                rating = response.results[i].rating;
                url = response.results[i].place_id;
                resultData +=getResult(state,city,name,operating, formattedAddress, image, rating, phone,url, lat_Series, lng_Series,photoReference);

            }

            appRes.send(resultData);
        });

    })();

});


router.get('/searchRestaurant', function(appReq,appRes) {
    var resultData = "";
    var name =  "";
    var city= "";
    var state= "";
    var country= "";
    var operating = "";
    var lat_Series = "";
    var lng_Series = "";
    var formattedAddress = "";
    var url= "";
    var image= "";
    var phone = "";
    var rating = "";
    var totalimage = new Array();
    totalimage.push("images/restaurant1.jpg");
    totalimage.push("images/restaurant2.jpg");
    totalimage.push("images/restaurant3.jpg");
    totalimage.push("images/restaurant4.jpg");
    totalimage.push("images/restaurant5.jpg");
    totalimage.push("images/restaurant6.jpg");
    totalimage.push("images/restaurant7.jpg");
    totalimage.push("images/restaurant8.jpg");
    totalimage.push("images/restaurant9.jpg");


    var lat = appReq.query.lat;
    var lng = appReq.query.lng;

    (function () {
        "use strict";
        var assert = require("assert");

        var NearBy = require("../node_modules/googleplaces/lib/NearBySearch");
        var setupConfig = require("../config.js");

        var nearBySearch = new NearBy(setupConfig.apiKey, setupConfig.outputFormat);

        var parameters = {
            location: [lat, lng],
            keyword: "restaurant",

        };


        nearBySearch(parameters, function (error, response) {
            if (error) throw error;
            assert.notEqual(response.results.length, 0, "Place search must not return 0 results");
            for (var i = 0; i < response.results.length ; i++) {

                name = response.results[i].name;
                lat_Series = response.results[i].geometry.location.lat;
                lng_Series = response.results[i].geometry.location.lng;
                formattedAddress = response.results[i].vicinity;
                var fullAddress = new Array();
                fullAddress =  formattedAddress.split(",");
                city = fullAddress[fullAddress.length-1];
                city = city.replace(/,/g, "");
                if(typeof response.results[i].opening_hours!== 'undefined') {
                    if(response.results[i].opening_hours.open_now) {
                        operating  = "Open Now";
                    } else {
                        operating = "Closed";
                    }
                } else {
                    operating =  "Not Available";
                }

                var photoReference="";
                if(typeof response.results[i].photos!=='undefined') {
                    photoReference = response.results[i].photos[0].photo_reference;
                }

                if(photoReference!==null) {
                    image = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=" + photoReference + "&sensor=false&key=AIzaSyDFttEnKV9sSFoI8SrZXZK00W-gNwtCcMQ";

                }


                var value = randomNumber.integer(0,8);
                image = totalimage[value];
                rating = response.results[i].rating;
                url = response.results[i].place_id;



                resultData +=getResult(state,city,name,operating, formattedAddress, image, rating, phone,url, lat_Series, lng_Series,photoReference);

            }

            appRes.send(resultData);
        });

    })();

});


module.exports = router;
