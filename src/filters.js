export { filterRestaurantList };

function filterRestaurantList() {
	let filterValue;
	const radios = document.getElementsByName('filter-by-ratings');
	for (let i=0; i<radios.length; i++) {
		radios[i].addEventListener('change', function() {
			filterValue = this.value;
			console.log(filterValue);
		});
	}
}

