var express = require('express');
var request = require('request');
var router = express.Router();

/////// DATABASE SETUP ///////

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

var colors = ["#009FFF","#328ED1","#647DA3","#976C75","#C95B47","#FC4A1A"];


/////// USEFUL FUNCTIONS ///////

//Function to capitalize the first letter
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


/////// ROUTES ///////

// Route to display home page
router.get('/', function(req, res, next) {
  cityModel.find(
    function (err, cities) {
      res.render('index', { cityList:cities, error:""});
    }
  )
});

//Route to add a city to data base and display it
router.post('/add-city',function(req,res){
  //Data displayed comes from Open Weather App API
  request("https://api.openweathermap.org/data/2.5/weather?q="+req.body.cityName+"&units=metric&lang=FR&appid=5ba5167fd93a880d32d89be9c37fe113", function(error, response, body) {
    cityInfo = JSON.parse(body);
    if (cityInfo.main) {
      //If the city is recognised by the weather API
      cityModel.find(
        {idAPI:cityInfo.id},
        function(err,sameCities){
          if (sameCities.length>0){
            // If the city is already in the database, update info
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
          //If it is not in the database, create new city in database
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
      // If the city hasn't been recognised by the weather API, a modal will up telling the user the city isn't recognised
      cityModel.find(
        function (err, cities) {
          res.render('index', { cityList:cities, error:true});
        }
      )
    }
  });
})

// Route to delete a city from database
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

// Route to get the new order chosen by user
router.post("/newOrder",function(req,res){
  console.log(req.body["newOrder[]"]);
  console.log(cityModel.getIndexes());
})


module.exports = router;

/////// MINIMAL TEST ///////
// 1. Check that you have the weather information of three cities : Lyon, Paris Belgrade
// 2. Check that you have the relevant markers on the google maps
// 3. Zoom and move through the google map
// 4. Type a city in search bar : Montpellier
// 5. Use Google autocomplete to finish the spelling of cityInfo
// 6. Check that a new line with weather info of the relevant city is added
// 7. Delete the new cityInfo
// 8. Drag and drop one city with another
// 9. Add a city which is already present in the dataset : check that information is up to date
