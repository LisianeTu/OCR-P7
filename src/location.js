export { getPosition, searchPlace, onPlaceChanged };

let userPositionMarker, autocompleteInput;
const markerImage = './images/user-position.png';

function getAddress(posCoordinates) {
	// reverse geocoding and display address in input field
	const geocoder = new google.maps.Geocoder;
	const inputLocation = document.getElementById('location-input');
	geocoder.geocode({'location': posCoordinates}, (results, status) => {
		if (status === 'OK') {
			if (results[0]) {
				inputLocation.value = results[0].formatted_address;
			} else {
				inputLocation.value = 'Nous ne pouvons pas retrouver votre adresse.';
			}
		} else {
			inputLocation.value = 'Nous ne pouvons pas retrouver votre adresse.';
		}
	});
}

// promise get geolocation
const getPosPromise = () => {
	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject);
	});
}

// get geolocation then apply on map 
function getPosition(map) {
	getPosPromise()
		.then((position) => {
			let coordinates = {lat: position.coords.latitude, lng: position.coords.longitude};

			if (userPositionMarker) userPositionMarker.setMap(null);

			// change map center and zoom
			map.panTo(coordinates);
			map.setZoom(15);
			
			// add a user position marker
			userPositionMarker = new google.maps.Marker({
				position: coordinates,
				map: map,
				icon: markerImage
			});
			
			// get address from location
			getAddress(coordinates);
		})
		.catch(() => {
			alert('Nous ne pouvons pas vous géolocaliser');
		})
}

// set the location on the new place
function onPlaceChanged(map) {
	let place = autocompleteInput.getPlace(); // renders an object with details on place
  if (place.geometry) {
		//remove the geoloc marker
		if (userPositionMarker) userPositionMarker.setMap(null);

    map.panTo(place.geometry.location);
		map.setZoom(15);
		
		// add new marker
		userPositionMarker = new google.maps.Marker({
			position: place.geometry.location,
			map: map,
			icon: markerImage
		});
  } else {
		alert('Cette adresse n\'existe pas');
		document.getElementById('location-input').value='';
  }
}

// autocomplete address search
function searchPlace() {
	autocompleteInput = new google.maps.places.Autocomplete(document.getElementById('location-input'));
}
