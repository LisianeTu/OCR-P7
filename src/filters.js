import { visibleRestaurants } from './restaurantsList.js';
export { filterRestaurantList };

const currentFilter = document.getElementById('current-filter');
let filterValue = 0;

function displayFilter() {
	// get the HTML of the label of the selected input and insert it in the specific element
	const appliedFilter = document.querySelector(`input[value='${filterValue}']`).id;
	const filterLabel = document.querySelector(`label[for='${appliedFilter}']`).innerHTML;
	
	document.getElementById('current-filter-label').innerHTML = filterLabel;	
	
	currentFilter.classList.remove('d-none');
}

function clearFilter() {
	filterValue = 0;
	currentFilter.classList.add('d-none');
	document.getElementById('filter-form').reset();
	
	visibleRestaurants.forEach(element => {
		element.show();
	})
}

// get the value of filter radio button
//if the average rating of visible restaurants are strictly inferior, hide them from the map and list, else, show them
function filterRestaurantList() {
	const radios = document.getElementsByName('filter-by-ratings');
	for (let i=0; i<radios.length; i++) {
		radios[i].addEventListener('change', function() {
			$("#dropdown-filter-btn").dropdown("toggle");

			filterValue = parseFloat(this.value);
			displayFilter();

			visibleRestaurants.forEach(element => {
				if (element.averageRating < filterValue) {
					element.hide();
				} else {
					element.show();
				}
			})
		});
	}

	const clearBtn = document.getElementById('clear-filter');
	clearBtn.addEventListener('click', () => {
		clearFilter();
	});
}
