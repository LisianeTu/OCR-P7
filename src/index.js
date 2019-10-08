import { getPosition, searchPlace } from './location.js';
import { getRestList } from './restaurantsList.js';


let gMap;

window.initMap = () => {
	// default map centered on Paris
	const paris = { lat: 48.8534100, lng: 2.3488000 };
	const options = {
		zoom: 10,
		center: paris,
		streetViewControl: false,
		mapTypeControl: false,
		fullscreenControl: false
	}
	gMap = new google.maps.Map(document.getElementById('map'), options);
	
	//geolocation
	getPosition(gMap);
	
	// autocomplete address input
	searchPlace(gMap);

	// get the list of restaurants
	getRestList(gMap);
}

// geoloc button action
const getLocationBtn = document.getElementById('get-location-btn');
getLocationBtn.addEventListener('click', () => {
	getPosition(gMap);
});



