import { Restaurant } from './restaurant.js';
export { getRestList };

// call to json file with XMLHttp
function getRestList(map) {
	const jsonUrl = './data/list.json';
	const xhr = new XMLHttpRequest();

	xhr.open('GET', jsonUrl);
	xhr.responseType = 'json';
	xhr.send(null);

	xhr.addEventListener('readystatechange', () => {
		if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
			const restaurantsList = xhr.response;

			// for each restaurant in the json
			restaurantsList.forEach((element, i) => {
				// create a Restaurant object from class
				const restaurant = new Restaurant(i, element.restaurantName, element.address, element.lat, element.long, element.ratings);

				// display the map marker
				restaurant.displayMarker(map);

				// map event: when the map is "inactive" after other events
				google.maps.event.addListener(map, 'idle', function () {
					const mapBoundaries = map.getBounds();

					// if the restaurant is included in the current map viewport
					if (mapBoundaries.contains({ lat: element.lat, lng: element.long })) {
						restaurant.displayRestaurantInList();

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
					} else {
						restaurant.clearRestaurant();
					}
				});
			});
		}
	});
}