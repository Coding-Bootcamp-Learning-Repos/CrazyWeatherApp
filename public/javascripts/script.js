//Script to show modal when a wrong city has been typed in the search bar
$("#wrongCityModal").modal('show');

//Script to hide a form used to send the position of the cities displayed on page
$("#newPosition").form('hide');

//Script to generate a google map with markers
var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('mapid'), {
    center: {
      lat: 48.86,
      lng: 2.35
    },
    zoom: 4
  });
  google.maps.event.addDomListener(window, 'load', initialize);

  $(".list-group-item").each(
    function() {
      var marker = new google.maps.Marker({
        map: map,
        draggable:true,
        position: {lat: $(this).data('lat'), lng: $(this).data('lon')}
      });
    }
  )
}

function initialize() {
  var input = document.getElementById('search');
  new google.maps.places.Autocomplete(input);
}


//Script to let the user drag and drop the cities on the home page
$(function() {
    $( ".list-group" ).sortable({
      stop: function( event, ui ) {
        var order=[]
        $(".list-group-item").each(
          function() {
            order.push($(this).data('position'));
          });
        console.log(order);
        $.ajax({
          type: "POST",
          url: "/newOrder",
          data: {"newOrder": order},
        });
      }
    });
    $( ".list-group" ).disableSelection();
});



//BONUS : Script to generate map with Openstreet Map
// var mymap = L.map('mapid').setView([48.86, 2.35], 1);
//
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(mymap);
//
