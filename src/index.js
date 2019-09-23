import { getPosition, searchPlace, onPlaceChanged } from './location.js';

let gMap;

window.initMap = () => {
	// default map centered on Paris
	const paris = { lat: 48.8534100, lng: 2.3488000 };
	gMap = new google.maps.Map(document.getElementById('map'), { zoom: 10, center: paris });

	//geolocation
	getPosition(gMap);
	// autocomplete address input
	searchPlace();
}

// geoloc button action
const getLocationBtn = document.getElementById('get-location-btn');
getLocationBtn.addEventListener('click', () => {
	getPosition(gMap);
});

// search place button action
const searchPlaceBtn = document.getElementById('search-location-btn');
searchPlaceBtn.addEventListener('click', () => {
	onPlaceChanged(gMap);
});
