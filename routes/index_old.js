var express = require('express');
var router = express.Router();
var request = require('request');
var bodyParser = require('body-parser');


// Pour la bd en mongodb
var mongoose = require('mongoose');
var options = { connectTimeoutMS: 5000, useNewUrlParser: true};
mongoose.connect('mongodb://fitzfoufou:lacapsule1@ds123513.mlab.com:23513/crazyweatherapp',
    options,
    function(err) {
     console.log(err);
    }
);

var citySchema = mongoose.Schema({
    cityName: String,
    tempMin:  Number,
    tempMax:  Number,
    weather:  String,
    picto:    String,
    color:    String,
    lon:      Number,
    lat:      Number,
    time:     String,
    idAPI:    Number
});
var cityModel = mongoose.model('cities', citySchema);

// var cityList =[];
var colors = ["#009FFF","#328ED1","#647DA3","#976C75","#C95B47","#FC4A1A"];

//Useful functions
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
//Function to convert a unixTime to a json which gives hour,minutes,seconds
var convertUnixToTime = function(unixTime){
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  var date = new Date(unixTime*1000);
  var hours = date.getHours();
  var minutes = "0" + date.getMinutes();
  // Will display time in 10:30 format
  var formattedTime = hours + ':' + minutes.substr(-2);
  return formattedTime;
}



/* GET home page. */
router.get('/', function(req, res, next) {
  cityModel.find(
    function (err, cities) {
      res.render('index', { cityList:cities, error:""});
    }
  )
});

router.get('/delete-city',function(req,res){
  cityModel.remove(
    {_id:req.query.id},
    function(error){
      cityModel.find(
        function (err, cities) {
          res.render('index', { cityList:cities, error:""});
        }
      )
    }
  )
})

router.post('/add-city',function(req,res){
  request("https://api.openweathermap.org/data/2.5/weather?q="+req.body.cityName+"&units=metric&lang=FR&appid=5ba5167fd93a880d32d89be9c37fe113", function(error, response, body) {
    cityInfo = JSON.parse(body);
    if (typeof cityInfo.main!== "undefined") {
      cityModel.find(
        {idAPI:cityInfo.id},
        function(err,sameCities){
          if (sameCities.length>0){
            cityModel.update(
              {idAPI:cityInfo.id},
              {
                cityName: req.body.cityName,
                tempMin:  Math.round(cityInfo.main.temp_min),
                tempMax:  Math.round(cityInfo.main.temp_max),
                weather:  cityInfo.weather[0].description.capitalize(),
                picto:    "http://openweathermap.org/img/w/"+cityInfo.weather[0].icon+".png",
                color:    colors[Math.trunc(5*(Math.min(cityInfo.main.temp,25)-10)/(25-10))],
                lon:      cityInfo.coord.lon,
                lat:      cityInfo.coord.lat,
                time:     convertUnixToTime(cityInfo.dt),
                idAPI:    cityInfo.id
              },
              function(error,raw){
                console.log("replacement successful");
                cityModel.find(
                  function (err, cities) {
                    res.render('index', { cityList:cities, error:""});

                  }
                )
              }
            );

        } else{
          var newCity = new cityModel ({
            cityName: req.body.cityName,
            tempMin:  Math.round(cityInfo.main.temp_min),
            tempMax:  Math.round(cityInfo.main.temp_max),
            weather:  cityInfo.weather[0].description.capitalize(),
            picto:    "http://openweathermap.org/img/w/"+cityInfo.weather[0].icon+".png",
            color:    colors[Math.trunc(5*(Math.min(cityInfo.main.temp,25)-10)/(25-10))],
            lon:      cityInfo.coord.lon,
            lat:      cityInfo.coord.lat,
            time:     convertUnixToTime(cityInfo.dt),
            idAPI:    cityInfo.id
          });
          newCity.save(
              function (error, city) {
                cityModel.find(
                  function (err, cities) {
                    res.render('index', { cityList:cities, error:""});
                  }
                )
              }
          );
        }
        }
      )

    } else {
      res.render('index',{cityList:cities, error:true});
    }

  });
})

router.post("/newOrder",function(res,req){
  console.log(req.body.newOrder);
  // console.log(res.body.newOrder);
  console.log("this is it");
  // res.jsonp({newOrder: 'your data'});
})


module.exports = router;
