import { visibleRestaurants } from './restaurantsList.js';
import { minRateInput, maxRateInput } from './filters.js';

let elementId;

// when modal is shown, customize restaurant name
$('#add-comment-modal').on('show.bs.modal', (event) => {
	const button = $(event.relatedTarget); // Button that triggered the modal
	let btnId = event.relatedTarget.id;
	elementId = btnId.substr(12, btnId.length);
	const restaurantName = button.data('restaurant'); // Extract info from data-* attributes
	$('#restaurant-name').text(restaurantName);
})

// on form submit, find the restaurant in the array of visible restaurant, post comment and close the modal
document.getElementById('post-comment').addEventListener('submit', (e) => {
	e.preventDefault();
	const restaurantElement = visibleRestaurants.find(el => el.id === elementId);	
	restaurantElement.addComment();

	if (restaurantElement.averageRating < parseInt(minRateInput.value) || restaurantElement.averageRating > parseInt(maxRateInput.value)) {
		restaurantElement.hide();
	} 

	$('#add-comment-modal').modal('toggle');
});

// when modal is hidden, reset form
$('#add-comment-modal').on('hidden.bs.modal', () => {
	const postCommentForm = document.getElementById('post-comment');
	postCommentForm.reset();
})