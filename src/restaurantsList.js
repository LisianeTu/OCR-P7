import { Restaurant } from './restaurant.js';
export { getRestList };

let visibleRestaurants = [];

/* function createRestaurants(array, map) {
	array.forEach(element => {
		// create a Restaurant object from class
		const restaurant = new Restaurant(element.restaurantName, element.address, element.lat, element.long, element.ratings);
		// display the map marker
		restaurant.displayMarker(map);

		restaurant.displayRestaurantInList();

		const restaurantCard = document.getElementById(`card-${restaurant.restaurantName}`);
		const restaurantCollapsible = $(`#collapse-${restaurant.restaurantName}`);

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
	})
} */

function getRestList(data, map) {
	const restaurantsList = data;

	// when the map event is triggered, for each element of the json, check if it is within the map boundaries
	//if so, add it to an array, else, remove it from the array
	google.maps.event.addListener(map, 'idle', function () {
		const mapBoundaries = map.getBounds();
		visibleRestaurants = restaurantsList.filter(restaurant => {
			if (mapBoundaries.contains({ lat: restaurant.lat, lng: restaurant.long })) return restaurant;
		})
		visibleRestaurants.forEach(element => {
			// create a Restaurant object from class
			const restaurant = new Restaurant(element.restaurantName, element.address, element.lat, element.long, element.ratings);
			// display the map marker
			restaurant.displayMarker(map);
			//restaurant.displayRestaurantInList();
		})
		console.log(visibleRestaurants);
	});
}
