$("#exampleModal").modal('show');

$("#newPosition").form('hide');

var mymap = L.map('mapid').setView([48.86, 2.35], 1);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

function initialize() {
  var input = document.getElementById('search');
  new google.maps.places.Autocomplete(input);
}

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
        // anchorPoint: new google.maps.Point($(this).data('lat'), $(this).data('lon'))
      });
    }
  )
}
$(".list-group-item").each(
  function() {
    console.log($(this).data('position'));
  });

// $(".list-group-item").each(
//   function() {
//    $(this).draggable({
//      revert: true,
//      snap:true,
//      zIndex:true
//    });
//   }
// );

$(function() {
    $( ".list-group" ).sortable({
      stop: function( event, ui ) {
        var order=[]
        $(".list-group-item").each(
          function() {
            // console.log($(this).data('position'));
            order.push($(this).data('position'));
          });
        console.log(order);
        $.ajax({
          type: "POST",
          url: "/newOrder",
          data: { newOrder: "a" },
          success: function(data){
            console.log("ok");
          }
        });

        // $.get("/newOrder?order=order");
      }
    });
    $( ".list-group" ).disableSelection();


});



// $(".list-group-item").each(
//   function() {
//     L.marker([$(this).data('lat'), $(this).data('lon')]).addTo(mymap)
//       // .bindPopup($('.col-5').text())
//       .openPopup();
//   }
// )






// API key google places : AIzaSyCyz0GiCFfr_sRqEvNb7f66w58HHDdJ0TU
