export { getPosition, searchPlace };

let userPositionMarker, autocompleteInput;

function setMapOnPosition(map, position) {
	if (userPositionMarker) userPositionMarker.setMap(null);
	// change map center and zoom
	map.panTo(position);
	map.setZoom(15);	
	// add a user position marker
	userPositionMarker = new google.maps.Marker({
		position: position,
		map: map,
		icon: './images/user-position.png'
	});
}

function getAddress(posCoordinates) {
	// reverse geocoding and display address in input field
	const geocoder = new google.maps.Geocoder;
	let inputLocation = document.getElementById('location-input');
	geocoder.geocode({'location': posCoordinates}, (results, status) => {
		if (status === 'OK') {
			if (results[0]) { 
				const address = results[0].formatted_address;
				inputLocation.value = address;
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
			setMapOnPosition(map, coordinates);
			// get address from location
			getAddress(coordinates);
		})
		.catch((err) => {
			console.log(err);
			alert('Nous ne pouvons pas vous géolocaliser');
		})
}

function onPlaceChanged(map) {
	return function() {
		let place = autocompleteInput.getPlace(); // renders an object with details on place
		
		if (place.geometry) {
			setMapOnPosition(map, place.geometry.location);
		} else {
			alert('Cette adresse n\'existe pas');
			document.getElementById('location-input').value='';
		}
	}
}

function searchPlace(map) {
	const input = document.getElementById('location-input');
	const options = {
		componentRestrictions: {country: 'fr'}
	};
	autocompleteInput = new google.maps.places.Autocomplete(input, options);
	autocompleteInput.addListener('place_changed', onPlaceChanged(map));
}
	