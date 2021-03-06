import { Restaurant } from './restaurant.js';
import { minRateInput, maxRateInput } from './filters.js';
import './addComments.js';
export { getRestList, service, restaurantsDB, visibleRestaurants, isValueInArray, paddedBounds };

let service, restaurantsDB;
const visibleRestaurants = [];

// call the json containing the list of restaurant
fetch('./static/data/list.json')
	// transform the data into json
	.then(response => response.json())
	// create objects and add them to the database array
	.then(data => {
		restaurantsDB = data.map((restaurant, index) => {
			const address = restaurant.address.replace(/ [0-9]+/g, '');
			const totalNbrRatings = restaurant.ratings.length;
			let averageRating = 0;
			restaurant.ratings.forEach(rating => {
				averageRating += rating.stars;
			});
			if (totalNbrRatings) averageRating /= totalNbrRatings;
			const restaurantObj = new Restaurant(0, index, restaurant.restaurantName, address, restaurant.lat, restaurant.long, averageRating, restaurant.ratings, totalNbrRatings);
			return restaurantObj;
		});
	})
	.catch(err => {
		console.log(err)
	})

function getRestList(map) {
	// everytime the map changes, call google places api & create objects to add them to the database array
	// replace 'from-JSON' objects if it exists in google results, don't create new objects if already existing in google results
	
	// add padding to the map boundaries to avoid half cut markers
	const paddedBoundaries = paddedBounds(map, 45, 0, 16, 16);
	const mapCenter = map.getCenter();
	
	const searchRequest = {
		location: mapCenter,
		radius: 500,
		type: ['restaurant'],
	};

	service = new google.maps.places.PlacesService(map);
	service.nearbySearch(searchRequest, (results, status) => {
		if (status == google.maps.places.PlacesServiceStatus.OK) {				
			results.forEach(place => {
				let averageRating = Math.round(place.rating*2)*0.5;
				// check in DB array if a restaurant exists from the JSON
				// if so, replace it by the google restaurant
				if (isValueInArray(restaurantsDB, place.name, place.vicinity) === 'yes' && (isValueInArray(restaurantsDB, place.place_id) !== 'yes')) {
					const index = restaurantsDB.findIndex(object => {
						if (object.name === place.name && object.address === place.vicinity) return object;
					});
					const restaurantObj = new Restaurant(place.place_id, index, place.name, place.vicinity, place.geometry.location.lat(), place.geometry.location.lng(), averageRating, [], place.user_ratings_total);
					restaurantsDB[index] = restaurantObj;
				} else if (isValueInArray(restaurantsDB, place.name, place.vicinity, place.place_id) !== 'yes') {
					const index = restaurantsDB.length;
					const restaurantObj = new Restaurant(place.place_id, index, place.name, place.vicinity, place.geometry.location.lat(), place.geometry.location.lng(), averageRating, [], place.user_ratings_total);
					restaurantsDB.push(restaurantObj);
				}
			})
		} 

		
		restaurantsDB.forEach(restaurant => {
			// check if any value is undefined and set if to 0
			Object.keys(restaurant).forEach(key => {
				if (!restaurant[key] && restaurant[key] !== 'maker') restaurant[key] = 0;
			});
			// if the map contains the position of the restaurant
			if ( paddedBoundaries.contains({ lat: restaurant.lat, lng: restaurant.lng }) && isValueInArray(visibleRestaurants, restaurant.name, restaurant.address) !== 'yes' && visibleRestaurants.length < 25) {
				visibleRestaurants.push(restaurant);
				restaurant.displayRestaurant(map);

				// hide the restaurant if a filter is active
				if (restaurant.averageRating < parseInt(minRateInput.value) || restaurant.averageRating > parseInt(maxRateInput.value)) {
					restaurant.hide();
				}
			} else if ( !paddedBoundaries.contains({ lat: restaurant.lat, lng: restaurant.lng }) && isValueInArray(visibleRestaurants, restaurant.name, restaurant.address) == 'yes' ) {
				visibleRestaurants.splice(visibleRestaurants.indexOf(restaurant), 1);
				restaurant.clearRestaurant(map);
			}
		})
	})
}


function isValueInArray(array, ...values) {
	let result = '';
	// check each object of the array
	for (let i = 0; i < array.length; i++) {
		// if one of them includes every values passed as argument, return true
		if (values.every(value => Object.values(array[i]).includes(value))) {
			result = 'yes';
			break;
		}
	}
	return result;
}

// recalculate the bounds of the map to add padding to it
function paddedBounds(map, northPad, southPad, eastPad, westPad) {
	const mapBoundaries = map.getBounds();
	
	const SW = mapBoundaries.getSouthWest();
	const NE = mapBoundaries.getNorthEast();

	const topRight = map.getProjection().fromLatLngToPoint(NE);
	const bottomLeft = map.getProjection().fromLatLngToPoint(SW);

	const scale = Math.pow(2, map.getZoom());

	const SWpoint = new google.maps.Point(westPad, ((bottomLeft.y - topRight.y) * scale) - southPad);
	const SWworld = new google.maps.Point(SWpoint.x / scale + bottomLeft.x, SWpoint.y / scale + topRight.y);
	const pt1 = map.getProjection().fromPointToLatLng(SWworld);

	const NEpoint = new google.maps.Point(((topRight.x - bottomLeft.x) * scale) - eastPad, northPad);
	const NEworld = new google.maps.Point(NEpoint.x / scale + bottomLeft.x, NEpoint.y / scale + topRight.y);
	const pt2 = map.getProjection().fromPointToLatLng(NEworld);

	return new google.maps.LatLngBounds(pt1, pt2);
}
