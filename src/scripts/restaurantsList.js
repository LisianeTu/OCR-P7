import { Restaurant } from './restaurant.js';
import { minRateInput, maxRateInput } from './filters.js';
import './comments.js';
export { getRestList, visibleRestaurants };

let visibleRestaurants = [];

function isIndexInArray(array, value) {
	if (array.some(arrayElmt => arrayElmt.elementIndex === value)) {
		return true;
	}
}

// display list of restaurants depending on map
function getRestList(data, map) {
	const restaurantsList = data;
	// when the map event is triggered, for each element of the json, check if it is within the map boundaries 
	// and if the array doesn't alreay contains the element - if ok, create the object and add it to the array
	google.maps.event.addListener(map, 'idle', function () {
		const mapBoundaries = map.getBounds();
		restaurantsList.forEach((element, index) => {
			if (mapBoundaries.contains({ lat: element.lat, lng: element.long }) && (!isIndexInArray(visibleRestaurants, index))) {
				// create a Restaurant object from class
				const restaurant = new Restaurant(index, element.restaurantName, element.address, element.lat, element.long, element.ratings);
				visibleRestaurants.push(restaurant);

				// display the map marker
				restaurant.displayMarker(map);

				restaurant.displayRestaurantInList();

				// hide the restaurant if a filter is active
				if (restaurant.averageRating < parseInt(minRateInput.value) || restaurant.averageRating > parseInt(maxRateInput.value)) {
					restaurant.hide();
				} 

				const restaurantCard = document.getElementById(`card-${restaurant.index}`);
				const restaurantCollapsible = $(`#collapse-${restaurant.index}`);

				// restaurant card mouse events to link list and markers
				restaurantCard.addEventListener('mouseover', () => {
					restaurant.mouseOverRestaurant();
				})
				restaurantCard.addEventListener('mouseout', () => {
					restaurant.mouseOutRestaurant();
				})

				// display active marker when the restaurant card is shown
				restaurantCollapsible.on('show.bs.collapse', () => {
					restaurant.activateRestaurant();
				})
				// reverse when restaurant card is hidden
				restaurantCollapsible.on('hide.bs.collapse', () => {
					restaurant.deactivateRestaurant();
				})
			}
		})

		// when map event is triggered, check the objects array for places that are not visible anymore
		// remove them from the list, map and array
		for (let i = visibleRestaurants.length - 1; i >= 0; i -= 1) {
			if (!mapBoundaries.contains({ lat: visibleRestaurants[i].lat, lng: visibleRestaurants[i].lng })) {
				visibleRestaurants[i].clearRestaurant(map);
				visibleRestaurants.splice(i, 1);
			}
		}
	});
}