import { getAddress } from './location.js';
import { createAndDisplay, restaurantsList } from './restaurantsList.js';
export { addRestaurant };

let thisMap, marker, clickCoordinates, prevent = false;
const addRestaurantForm = document.getElementById('post-restaurant');


// function when click event if fired on map - set a time-out to differentiate simple clicks from double clicks
function onMapClick(event, map, googleEvent) {
	setTimeout(() => {
		if (!prevent) {
			// get click coordinates
			clickCoordinates = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());

			// create a temporary marker on the map
			marker = new google.maps.Marker({
				position: clickCoordinates,
				map: map
			});

			thisMap = map;

			// display the modal containing form
			$('#add-restaurant-modal').modal('toggle');

			// add address matching click position in the form address field
			getAddress(clickCoordinates, document.getElementById('input-address'));

			// remove click event listener on map
			google.maps.event.removeListener(googleEvent);
		}
		prevent = false;
	}, 200);
}


// callback function when click event on the button is fired
function onBtnClick(map) {
	// display an alert to explain the process - id alert is dismissed do nothing
	swal('Veuillez cliquer sur la carte pour définir l\'emplacement de l\'établissement', {
		buttons: ['Annuler', 'OK']
	})
		.then(yes => {
			if (yes) {
				// start listening to click events on the map
				const mapClick = google.maps.event.addListener(map, 'click', (e) => {
					onMapClick(e, map, mapClick);
				});
				google.maps.event.addListener(map, 'dblclick', () => {
					prevent = true;
				})

				// remove the event listener to avoid events duplication
				document.getElementById('add-rest').removeEventListener("click", onBtnClick);
			}
		});
}


function addRestaurant(map) {
	document.getElementById('add-rest').addEventListener('click', () => {
		onBtnClick(map);
	});
}


function postRestaurant(thisMap) {
	const restaurantName = document.getElementById('input-name').value;
	const restaurantAddress = document.getElementById('input-address').value;
	const stars = document.getElementById('add-rest-rate-select').value;
	const comment = document.getElementById('add-rest-comment-text').value;

	// add the restaurant in the data array received from json
	let newRestaurant = {
		'restaurantName': restaurantName,
		'address': restaurantAddress,
		'lat': clickCoordinates.lat(),
		'long': clickCoordinates.lng(),
		'ratings': [
			{
				'stars': parseInt(stars),
				'comment': comment
			}
		]
	}
	if (stars === '' && comment === '') {
		newRestaurant.ratings = [];
	}
	restaurantsList.push(newRestaurant);
	
	// display the map marker: first remove the temporary marker
	marker.setMap(null);
	// create an object, push it into visibleRestaurants array
	createAndDisplay(thisMap, restaurantsList.indexOf(newRestaurant), newRestaurant.restaurantName, newRestaurant.address, newRestaurant.lat, newRestaurant.long, newRestaurant.ratings);

	// hide the modal
	$('#add-restaurant-modal').modal('toggle');
}


// on form submit, create a new Restaurant, push it into the array and display it on the map
addRestaurantForm.addEventListener('submit', (e) => {
	e.preventDefault();
	postRestaurant(thisMap);
})


// make the star input mandatory if a comment is added
document.getElementById('add-rest-comment-text').addEventListener('change', () => {
	if (document.getElementById('add-rest-rate-select').value === '' && document.getElementById('add-rest-comment-text').value !== '') {
		document.getElementById('add-rest-rate-select').setAttribute('required', 'required');
	} else {
		document.getElementById('add-rest-rate-select').removeAttribute('required');
	}
})

// when modal is hidden, reset form
$('#add-restaurant-modal').on('hidden.bs.modal', (e) => {
	addRestaurantForm.reset();
	// remove the temporary marker
	marker.setMap(null);
})