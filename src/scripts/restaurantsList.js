import { Restaurant } from './restaurant.js';
import { minRateInput, maxRateInput } from './filters.js';
import './comments.js';
export { getRestList, visibleRestaurants, restaurantsList, createAndDisplay };

const visibleRestaurants = [];
let service, JSONrestaurantsList = [], restaurantsList = [];

// call the json containing the list of restaurant
fetch('./data/list.json')
.then(response => response.json()) // transform the data into json
.then(data => {
	JSONrestaurantsList = data.map(restaurant => {
		return {
			'name' : restaurant.restaurantName,
			'address' : restaurant.address.replace(/ [0-9]+/g, ''),
			'lat' : restaurant.lat,
			'long' : restaurant.long,
			'ratings' : []
		}
	});		
})
.catch(err => {
	console.log(err)
})

// display list of restaurants depending on map
function getRestList(map) {
	const mapBoundaries = map.getBounds();
	
	const searchRequest = {
		bounds: mapBoundaries,
		type: ['restaurant']
	};
	
	service = new google.maps.places.PlacesService(map);
	service.nearbySearch(searchRequest, (results, status) => {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			const placesList = results.map(place => {
				let newPlace = {};
				return newPlace = {
					'place_id' : place.place_id,
					'name' : place.name,
					'address' : place.vicinity,
					'lat' : place.geometry.location.lat(),
					'long' : place.geometry.location.lng(),
					'averageRating' : place.rating,
					'ratings' : []
				}
			});


			restaurantsList = placesList.concat(JSONrestaurantsList);
			
			restaurantsList.forEach((element, index) => {
				if (mapBoundaries.contains({ lat: element.lat, lng: element.long }) && (!isValueInArray(visibleRestaurants, element.name, element.address))) {
					createAndDisplay(map, index, element.name, element.address, element.lat, element.long, element.ratings);
				}
			})
		}
	});

	// check the objects array for places that are not visible anymore
	// remove them from the list, map and array
	for (let i = visibleRestaurants.length - 1; i >= 0; i -= 1) {
		if (!mapBoundaries.contains({ lat: visibleRestaurants[i].lat, lng: visibleRestaurants[i].lng })) {
			visibleRestaurants[i].clearRestaurant(map);
			visibleRestaurants.splice(i, 1);
		}
	}
}	

function isValueInArray(array, ...values) {
	// create a new array with only values instead of full objects
	const newArray = array.map(element => {
		return Object.values(element);
	})
	// check if every value in arguments is included in the flatened array
	if (values.every(value => newArray.flat().includes(value))) {
		return true;
	}
}

// create a Restaurant object from class
function createAndDisplay(map, index, name, address, lat, long, ratings) {
	const restaurant = new Restaurant(index, name, address, lat, long, ratings);

	visibleRestaurants.push(restaurant);
	restaurant.displayRestaurant(map);

	// hide the restaurant if a filter is active
	if (restaurant.averageRating < parseInt(minRateInput.value) || restaurant.averageRating > parseInt(maxRateInput.value)) {
		restaurant.hide();
	}
}