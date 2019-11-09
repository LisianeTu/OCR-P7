import { getPosition, searchPlace } from './location.js';
import { getRestList } from './restaurantsList.js';
import { addRestaurant } from './addRestaurant.js';

import '@fortawesome/fontawesome-free/js/all';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/styles.css';
import swal from 'sweetalert';

// map init
let gMap;

window.initMap = () => {
	// default map centered on Paris
	const paris = new google.maps.LatLng({ lat: 48.8534100, lng: 2.3488000 });
	const options = {
		zoom: 16,
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
	google.maps.event.addListener(gMap, 'idle', () => {
		getRestList(gMap);
	})
			
	// add a restaurant
	addRestaurant(gMap);
}

// geoloc button action
const getLocationBtn = document.getElementById('get-location-btn');
getLocationBtn.addEventListener('click', () => {
	getPosition(gMap);
});
