import 'nouislider';
import 'nouislider/distribute/nouislider.css';
import '../css/noUislider.css';
import { visibleRestaurants } from './restaurantsList';
export { minRateInput, maxRateInput };

const filterForm = document.getElementById('filter-form');
const minRateInput = document.getElementById('min-filter-value');
const maxRateInput = document.getElementById('max-filter-value');
const currentFilter = document.getElementById('current-filter');
const dropDown = document.getElementById('dropdown-filter');

// display the active filter
function displayFilter() {
	const appliedFilterMin = minRateInput.value;
	const appliedFilterMax = maxRateInput.value;
	
	if (!(appliedFilterMin === '0' && appliedFilterMax === '5')) {
		document.getElementById('current-filter-min').innerHTML = appliedFilterMin;	
		document.getElementById('current-filter-max').innerHTML = appliedFilterMax;
	
		currentFilter.classList.remove('d-none');
	} else {
		currentFilter.classList.add('d-none');
	}
}

// reset all filters
function clearFilter() {
	currentFilter.classList.add('d-none');
	filterForm.reset();
	
	maxRateInput.setAttribute('min', 0);
	minRateInput.setAttribute('max', 5);
	slider.noUiSlider.reset();

	visibleRestaurants.forEach(element => {
		element.show();
	})
}

// noUISlider component creation
const slider = document.getElementById('slider');
noUiSlider.create(slider, {
	start: [0, 5],
	connect: true,
	range: {
		'min': 0,
		'max': 5
	},
	step: 1
});

// links between input and slider
minRateInput.addEventListener('input', () => {
	maxRateInput.setAttribute('min', minRateInput.value);
	slider.noUiSlider.set([minRateInput.value, null]);
})

maxRateInput.addEventListener('input', () => {
	minRateInput.setAttribute('max', maxRateInput.value);
	slider.noUiSlider.set([null, maxRateInput.value]);
})

slider.noUiSlider.on('update', (values, handle) => {
	if (handle === 0) {
		minRateInput.value = parseInt(values[0]);
	} else {
		maxRateInput.value = parseInt(values[1]);
	}
})

// filter restaurants list on form submit
filterForm.addEventListener('submit', (e) => {
	e.preventDefault();
	
	// hide dropdown on submit
	$('#dropdown-filter-btn').dropdown('hide');

	displayFilter();
		
	visibleRestaurants.forEach(element => {
		if (element.averageRating < parseInt(minRateInput.value) || element.averageRating > parseInt(maxRateInput.value)) {
			element.hide();
		} else {
			element.show();
		}
	})
})

// reset form
filterForm.addEventListener('reset', () => {
	maxRateInput.setAttribute('min', 0);
	minRateInput.setAttribute('max', 5);
	slider.noUiSlider.reset();
})

// clear filters
const clearBtn = document.getElementById('clear-filter');
clearBtn.addEventListener('click', () => {
	clearFilter();
});