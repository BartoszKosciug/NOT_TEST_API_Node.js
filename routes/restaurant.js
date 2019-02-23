const express = require('express');
const distance = require('geo-distance');
const restaurantsRouter = express.Router();
const google_key = process.env.GOOGLE_KEY;
const Usersettings = require('../models/usersettings.model');

const googleMapsClient = require('@google/maps').createClient({
    key: google_key
});


restaurantsRouter.route('/').get((req, res) => {
    res.send('Hello its restaurant router.');
});

restaurantsRouter.route('/get').post((req, res) => {
    //res.send('hello books');
    var user_lat = req.body.lat;
    var user_lon = req.body.lon;

    googleMapsClient.placesNearby({
        language: 'en',
        location: [user_lat, user_lon],
        radius: 1500,
        minprice: 0,
        maxprice: 4,
        opennow: false,
        type: 'restaurant'
    }, function (err, response) {
        if (!err) {

            /*var apiJsonResponse = response.json.results;
            for(var place in apiJsonResponse) {
                for(var item in apiJsonResponse[place]){
                    console.log(apiJsonResponse[place][item])
                }
            }*/
            //console.log(response.json.results);
            res.send(response.json.results);
            //res.send(jsonProcess(response.json.results, user_lat, user_lon));
        }
        else {
            res.status(500).json({ error: err });
        }
    });
});

restaurantsRouter.route('/neighbour').post((req, res) => {
    //res.send('hello books');
    var user_lat = req.body.lat;
    var user_lon = req.body.lon;
    var user_id = req.body.uid;
    var user_price = req.body.price; //settigns 
    var user_radius = req.body.radius; //settings
    var user_open = req.body.open;  //settings
    var user_rating = req.body.rating; //settings
    
    //PRICE set up--------------------------------
    if(user_price=="Inexpensive"){
        var max_price = 1;
    }else if(user_price=="Moderate"){
        var max_price = 2;
    }else if(user_price=="Expensive"){
        var max_price = 3; 
    }else{
        var max_price = 4; 
    }

    //RADIUS set up ------------------------------
    if(user_radius=="150 m"){
        var radius = 150; 
    }else if(user_radius=="300 m"){
        var radius = 300;
    }else if(user_radius=="500 m"){
        var radius = 500;
    }else if(user_radius=="1 km"){
        var radius = 1000;
    }else{
        var radius = 1500; 
    }
    
    Usersettings.findOne({ userid: { $eq: user_id } }).exec().then(doc => {
        if (doc) {

            googleMapsClient.placesNearby({
                language: 'en',
                location: [user_lat, user_lon],
                radius: radius,
                minprice: doc['min_price'],
                maxprice: max_price,
                opennow: user_open,
                type: 'restaurant'
            }, function (err, response) {
                if (!err) {

                    /*var apiJsonResponse = response.json.results;
                    for(var place in apiJsonResponse) {
                        for(var item in apiJsonResponse[place]){
                            console.log(apiJsonResponse[place][item])
                        }
                    }*/
                    //console.log(response.json.results);
                    res.send(jsonProcess(response.json.results, user_lat, user_lon));
                }
                else {
                    res.status(500).json({ error: err });
                }
            });

        }
        else {
            res.status(404).json({ message: "No valid entry found for provided User Id" });
        }
    })
});

var fs = require('fs');
var request = require('request');


var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

function getDetails(place_id){

    googleMapsClient.place({
        placeid: place_id,
        language: 'en',
    },function (err, response) {
        if (!err) {

            return response;
        }
        else {
            return json({ error: err });
        }
    });
}

restaurantsRouter.route('/reviews').post((req,res) =>{
    var place_id = req.body.place_id; 
    
    googleMapsClient.place({
        placeid: place_id,
        language: 'en',
    },function (err, response) {
        if (!err) {

            res.send(jsonProcessDetails(response));
        }
        else {
            res.status(500).json({ error: err });
        }
    });
});

restaurantsRouter.route('/contact').post((req,res)=>{
    var place_id = req.body.place_id; 

    googleMapsClient.place({
        placeid: place_id, 
        language: 'en',
    }, function(err, response){
        if(!err){
            res.send(jsonProcessContact(response));
        }
        else{
            res.status(500).json({error: err});
        }
    })
})



restaurantsRouter.route('/photo').post((req, res) => {
    var photo_ref = req.body.photo_ref;
    const url = "https://maps.googleapis.com/maps/api/place/photo?"
    const maxwidth = "maxwidth=400&"
    const maxhight = "maxheight=400&"

    var uri = url + maxwidth + "photoreference=" + photo_ref + "&key=" + google_key
    console.log(uri)

    download(uri, 'google.png', function () {
    console.log('done');
    res.send("Done")
    /*
        googleMapsClient.placesPhoto({
            photoreference: photo_ref,
            maxwidth: 2568
        }, function (err, response) {
            
            if (!err) {
                
            
                
                //res.set('Content-Type','image/jpeg');
                res.send(response.text());
                
            }
            else {
                res.send().json({ error: err });
            }
        })
        */
    });
});

function jsonProcessContact(apiJsonResponse){

    
    var website = (apiJsonResponse.json.result.website);
    console.log(website);
    var phone_number = apiJsonResponse.json.result.formatted_phone_number; 
    console.log(phone_number);
    var formattedApiJsonRes = {'website':website,"phone":phone_number};
    return formattedApiJsonRes;
}

function jsonProcessDetails(apiJsonResponse){
    var formatedApiJsonRes = [];
    var response =  (apiJsonResponse.json.result.reviews)
    //console.log(response) 
    for (i=0; i < response.length; i++){
        
        var author = response[i].author_name;
        console.log(author)
        var relative_time_description = response[i].relative_time_description;
        var text = response[i].text;
        formatedApiJsonRes.push({'author':author, 'relative_time_description':relative_time_description,'text':text});
    }
    return formatedApiJsonRes;
}


function jsonProcess(apiJsonResponse, user_lat, user_lon) {
    var formatedApiJsonRes = [];
    const url = "https://maps.googleapis.com/maps/api/place/photo?"
    const maxwidth = "maxwidth=400&"
    const maxhight = "maxheight=400&"

    var User = {
        lat: user_lat,
        lon: user_lon
    }
    for (var place in apiJsonResponse) {
        var name = apiJsonResponse[place]['name'];

        var _lat = apiJsonResponse[place]['geometry']['location']['lat'];
        var _lon = apiJsonResponse[place]['geometry']['location']['lng'];
        var Place = {
            lat: _lat,
            lon: _lon
        }

        var dist = distance.between(User, Place).human_readable();
        if (apiJsonResponse[place]['opening_hours'] == undefined) {
            var open = "Closed";
        } else {
            if(apiJsonResponse[place]['opening_hours']['open_now']==false){
                var open = "Closed";
            }else{
                var open = "Open";
            }
        }
        
        var rating = apiJsonResponse[place]['rating'];
        var address = apiJsonResponse[place]['vicinity'];
        var place_id = apiJsonResponse[place]['place_id'];
        console.log(place_id)
     
        console.log(getDetails(place_id))
        var photo_ref = apiJsonResponse[place]['photos'][0]['photo_reference'];
        var uri = url + maxwidth + "photoreference=" + photo_ref + "&key=" + google_key

        formatedApiJsonRes.push({ 'place_id': place_id, 'name': name, 'distance': { 'length': dist['distance'], 'unit': dist['unit'] }, 'open': open, 'rating': rating, 'address': address ,'uri': uri});
    }
    return formatedApiJsonRes;
}

restaurantsRouter.route('/single').get((req, res) => {
    res.send('hello its single restaurant');
});

module.exports = restaurantsRouter;


