import { getPosition, searchPlace } from './location.js';
import { getRestList } from './restaurants.js';

let gMap;

window.initMap = () => {
	// default map centered on Paris
	const paris = { lat: 48.8534100, lng: 2.3488000 };
	gMap = new google.maps.Map(document.getElementById('map'), { zoom: 10, center: paris });
	
	//geolocation
	getPosition(gMap);
	
	// autocomplete address input
	searchPlace(gMap);
}

// geoloc button action
const getLocationBtn = document.getElementById('get-location-btn');
getLocationBtn.addEventListener('click', () => {
	getPosition(gMap);
});

getRestList();