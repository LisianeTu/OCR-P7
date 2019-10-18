import { getPosition, searchPlace } from './location.js';
import { getRestList } from './restaurantsList.js';

import '@fortawesome/fontawesome-free/js/all';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/styles.css';


// map init
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
}

// geoloc button action
const getLocationBtn = document.getElementById('get-location-btn');
getLocationBtn.addEventListener('click', () => {
	getPosition(gMap);
});



// call the json containing the list of restaurant
fetch('./data/list.json')
	.then(response => response.json()) // transform the data into json
	.then(data => getRestList(data, gMap)) // use the data to display restaurants
	.catch(err => { console.log(err)})

