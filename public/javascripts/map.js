
var lat;
var lng;
var map;
var currentlat;
var currentlng;



function initMap() {

    map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 8,
        center: {lat: -34.397, lng: 150.644}
    });


    var input = (document.getElementById('search-prompt'));

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds',map);

    autocomplete.addListener('place_changed', function(){

        var address = '';
        var place = autocomplete.getPlace();

            if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }

    });
    var geocoder = new google.maps.Geocoder();

    document.getElementById('search').addEventListener('click', function() {
        geocodeAddress(geocoder);
    });

}



function currentlocation() {

    var geocoder = new google.maps.Geocoder();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {

            currentlat = position.coords.latitude;
            currentlng = position.coords.longitude;


            var latlng = {lat: currentlat, lng: currentlng};

            geocoder.geocode({'location': latlng}, function (results, status) {

                if (status === 'OK') {
                    if (results[1]) {
                        var location = results[1].formatted_address;
                        document.getElementById('current_location').innerHTML = "Your are now in " + location;

                    }

                }

            });
        });
    } else {
        document.getElementById('negativeMessage').style.display= "block";
    }


    window.onclick = function (event) {
        if (event.target == document.getElementById('map-modal')) {
            document.getElementById('map-modal').style.marginLeft = "-2000px";
        }
    }

    $('#closebutton').click(function() {
        document.getElementById('map-modal').style.marginLeft= "-2000px";
    });

    $('.ui.inline.dropdown').dropdown({
        onChange: function (choice) {

            var temp = document.createElement('div');
            temp.innerHTML = choice;
            var temp_string = temp.textContent;
            if(temp_string.trim()=="cafe") {
                getCafe();
            } else if(temp_string.trim()=="bar") {
                getBar();
            } else if(temp_string.trim()=="restaurant") {
                getRestaurantFull();
            } else {

            }
        }

    });

    $('.message .close').on('click', function() {
        $(this).closest('.message').fadeOut();
    });


    window.scrollTo(0,0);
    setInterval(closemessage,3000);

}

function test(event) {
    if(event.keyCode==13 ) {
        if(document.getElementById('search-prompt').value != null) {
            var geocoder = new google.maps.Geocoder();
            geocodeAddress(geocoder);
            window.scrollTo(400, 0);
        }
        else {
            document.getElementById('negativeMessage').style.display= "block";
        }
    }
}

function getRestaurantFull() {

    if(lat!=null && lng!=null) {

    document.getElementById('alertmessage').style.display="block";
    $("#result_container").empty();

    $.get("/searchRestaurant",{lat:lat,lng:lng},function (data) {

        $("#result_container").html(data);
        document.getElementById('alertmessage').style.display="none";
    });
    }
    else {
        document.getElementById('negativeMessage').style.display= "block";
    }
}

function getCafe() {
    if(lat!=null && lng!=null) {
    document.getElementById('alertmessage').style.display="block";
    $("#result_container").empty();
    $.get("/searchCafe",{lat:lat,lng:lng},function (data) {

        $("#result_container").html(data);
        document.getElementById('alertmessage').style.display="none";
    });}
    else {
        document.getElementById('negativeMessage').style.display= "block";
    }

}

function getBar() {

    if(lat!=null && lng!=null) {
    document.getElementById('alertmessage').style.display="block";

    $("#result_container").empty();
    $.get("/searchBar",{lat:lat,lng:lng},function (data) {

        $("#result_container").html(data);
        document.getElementById('alertmessage').style.display="none";
    });} else {
        document.getElementById('negativeMessage').style.display= "block";
    }

}



function geocodeCurrentAddress() {
    document.getElementById('alertmessage').style.display="block";
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {

            lat = position.coords.latitude;
            lng = position.coords.longitude;

            $("#result_container").empty();

            $.get("/search",{lat:lat,lng:lng},function (data) {

                $("#result_container").html(data);
                document.getElementById('alertmessage').style.display="none";
            });

        });
    } else {
        document.getElementById('negativeMessage').style.display= "block";
    }
}



function geocodeAddress(geocoder) {
    document.getElementById('alertmessage').style.display="block";
    var address = document.getElementById('search-prompt').value;
    geocoder.geocode({'address': address}, function (results, status) {
        if (status === 'OK') {
            lat = results[0].geometry.location.lat();
            lng = results[0].geometry.location.lng();

            $("#result_container").empty();

            $.get("/search",{lat:lat,lng:lng},function (data) {

                $("#result_container").html(data);
                document.getElementById('alertmessage').style.display="none";
            });

            $("#weather").empty();
            $.get("/weatherDetails", {lat:lat, lng:lng}, function(data){
                $("#weather").html(data);
            })


        } else if (address == null) {
            alert('Please type in the location');
        } else {

            document.getElementById('alertmessage').style.display="none";
            document.getElementById('negativeMessage').style.display= "block";
        }
    });

}

function closemessage() {

}


function getPlaceDetails(placename,placeid, referid) {

    document.getElementById('alertmessage3').style.display="block";

    $('.ui.modal').empty();


    $.get("/searchDetails",{place_name:placename,place_id:placeid,references:referid},function (data) {

        $(".ui.modal").html(data);
        $('.ui.modal').modal('show');

        document.getElementById('alertmessage3').style.display="none";
    });

}

function getDirection(lat,lng) {

    document.getElementById('alertmessage2').style.display="block";

    var pointA = new google.maps.LatLng(currentlat, currentlng),
        pointB = new google.maps.LatLng(lat,lng),
        myOptions = {
            zoom: 13,
            center: pointA
        };

        map = new google.maps.Map(document.getElementById('map-canvas'), myOptions);
        // Instantiate a directions service.
        var directionsService = new google.maps.DirectionsService,
        directionsDisplay = new google.maps.DirectionsRenderer({
            map: map
        });



    // get route from A to B
    calculateAndDisplayRoute(directionsService, directionsDisplay, pointA, pointB);



}


function calculateAndDisplayRoute(directionsService, directionsDisplay, pointA, pointB) {

    directionsService.route({
        origin: pointA,
        destination: pointB,
        travelMode: google.maps.TravelMode.DRIVING
    }, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            computeTotalDistance(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });

}

function computeTotalDistance(result) {
    var total = 0;
    var myroute = result.routes[0];
    var routeDirection = document.getElementById('total_Direction');

    routeDirection.innerHTML= "";
    for (var i = 0; i < myroute.legs.length; i++) {
        total += myroute.legs[i].distance.value;
        var routeSegment = i + 1;
        routeDirection.innerHTML += '<b>Route Segment: ' + routeSegment +
            '</b><br>';
        routeDirection.innerHTML += myroute.legs[i].start_address + ' to ';
        routeDirection.innerHTML += myroute.legs[i].end_address + '<br>';
        routeDirection.innerHTML += myroute.legs[i].distance.text + '<br><br>';

    }

    total = total / 1000;

    document.getElementById('total_Distance').innerHTML= "Distance: " +total + "km";

    setTimeout(function() {
        document.getElementById('alertmessage2').style.display="none";
        $('#map-modal').css("margin-left","0px");
    },500);

}
