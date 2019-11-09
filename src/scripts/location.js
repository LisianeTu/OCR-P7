export { getAddress, getPosition, searchPlace };

let userPositionMarker, autocompleteInput;

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
			let coordinates = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			setMapOnPosition(map, coordinates);
			// get address from location
			let inputLocation = document.getElementById('location-input');
			getAddress(coordinates, inputLocation);
		})
		.catch((err) => {
			swal('Nous ne pouvons pas vous géolocaliser');
			console.log(err);
		})
}

function setMapOnPosition(map, position) {
	if (userPositionMarker) userPositionMarker.setMap(null);
	// change map center and zoom
	map.panTo(position);
	map.setZoom(17);	
	// add a user position marker
	userPositionMarker = new google.maps.Marker({
		position: position,
		map: map,
		icon: './images/user-position.png'
	});
}

function getAddress(posCoordinates, input) {
	// reverse geocoding and display address in input field
	const geocoder = new google.maps.Geocoder;
	geocoder.geocode({'location': posCoordinates}, (results, status) => {
		if (status === 'OK') {
			if (results[0]) { 
				const address = results[0].formatted_address;
				input.value = address;
			} else {
				input.value = 'Nous ne pouvons pas retrouver votre adresse.';
			}
		} else {
			input.value = 'Nous ne pouvons pas retrouver votre adresse.';
		}
	});
}

function searchPlace(map) {
	const input = document.getElementById('location-input');
	const options = {
		componentRestrictions: {country: 'fr'}
	};
	autocompleteInput = new google.maps.places.Autocomplete(input, options);
	autocompleteInput.addListener('place_changed', onPlaceChanged(map));
}

function onPlaceChanged(map) {
	return function() {
		let place = autocompleteInput.getPlace(); // renders an object with details on place
		
		if (place.geometry) {
			setMapOnPosition(map, place.geometry.location);
		} else {
			swal('Cette adresse n\'existe pas');
			document.getElementById('location-input').value='';
		}
	}
}


	