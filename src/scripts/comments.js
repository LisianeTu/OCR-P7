import { visibleRestaurants } from './restaurantsList.js';

// when modal is shown, customize restaurant name
$('#add-comment-modal').on('show.bs.modal', (event) => {
	const button = $(event.relatedTarget); // Button that triggered the modal
	const restaurantName = button.data('restaurant'); // Extract info from data-* attributes
	$('#restaurant-name').text(restaurantName);
})

// on form submit, find the restaurant in the array of visible restaurant, post comment and close the modal
document.getElementById('post-comment').addEventListener('submit', (e) => {
	e.preventDefault();
	const modalRestaurantName = document.getElementById('restaurant-name').innerText;
	const restaurantElement = visibleRestaurants.find(el => el.name === modalRestaurantName);	
	restaurantElement.addComment();
	$('#add-comment-modal').modal('toggle');
});

// when modal is hidden, reset form
$('#add-comment-modal').on('hidden.bs.modal', () => {
	const postCommentForm = document.getElementById('post-comment');
	postCommentForm.reset();
})