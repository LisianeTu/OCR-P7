import restaurantIcon from '../images/restaurant-icon.png';
import restaurantIconOver from '../images/restaurant-icon-over.png';
import { service } from './restaurantsList.js';
export { Restaurant };

// transform a string to remove all accents, spaces and special characters 
function transformName(string) {
	let id = string.normalize("NFD");
	id = id.replace(/([^a-zA-Z 0-9]|\s|[\u0300-\u036f])+/g, '');
	id = id.toLowerCase();
	return id;
}

class Restaurant {
	constructor(googlePlaceId, indexInArray, name, address, lat, lng, averageRating, ratings, totalRatings) {
		this.googlePlaceId = googlePlaceId,
		this.indexInArray = indexInArray,
		this.id = `${transformName(name)}-${this.indexInArray}`,
		this.name = name,
		this.address = address,
		this.lat = lat,
		this.lng = lng,
		this.ratings = ratings,
		this.averageRating = averageRating,
		this.totalRatings = totalRatings,
		this.marker = ''
	}

	// display custom marker on the map
	displayMarker(map) {
		// position of the restaurant
		const position = new google.maps.LatLng(this.lat, this.lng);
		// custom marker: used a parameter isClicked to avoid conflict between events click and mouse-out
		const newMarker = new google.maps.Marker({
			position: position,
			optimized: false,
			map: map,
			icon: `${restaurantIcon}?i=${this.id}`,
			opacity: 0.8,
			isClicked: false,
			visible: true
		});
		
		this.marker = newMarker;

		// mouse events on markers
		newMarker.addListener('mouseover', () => {
			this.mouseOverRestaurant();
		})

		newMarker.addListener('mouseout', () => {
			this.mouseOutRestaurant();
		})

		// click event on marker : activate collapse bootstrap function on cards accordion
		newMarker.addListener('click', () => {
			newMarker.isClicked = true;
			$(`#collapse-${this.id}`).collapse('toggle');
		})
	}

	// convert rating to stars: get the % on 5 of the rating, to determine the width of stars to show and add stars HTML
	convertRatingToStars(rate, container) {
		const starPercentage = ((rate / 5) * 100);
		container.innerHTML =
			`<div class="stars-outer">
				<i class="far fa-star"></i>
				<i class="far fa-star"></i>
				<i class="far fa-star"></i>
				<i class="far fa-star"></i>
				<i class="far fa-star"></i>
				<div class="stars-inner" style="width: ${starPercentage}%">
					<i class="fas fa-star"></i>
					<i class="fas fa-star"></i>
					<i class="fas fa-star"></i>
					<i class="fas fa-star"></i>
					<i class="fas fa-star"></i>
				</div>
			</div>`;
	}

	displayAvgRating() {
		const avgRatingContainer = document.getElementById(`avg-rating-${this.id}`);
		if (this.ratings.length === 0 && !this.averageRating) {
			avgRatingContainer.innerHTML = '<div class="stars-outer">0 avis</div>';
		} else { 
			this.convertRatingToStars(this.averageRating, avgRatingContainer);
		}
	}

	// call to streetview api
	getStreetViewImage() {
		return `https://maps.googleapis.com/maps/api/streetview?location=${this.lat},${this.lng}&size=800x400&key=AIzaSyBY_-_fuIgtxCYUn84JlHi8cPO_QOHzYVQ`;
	}

	displayComment(container, comment, stars, index) {
		const commentLi = document.createElement('li');
		commentLi.classList.add('list-group-item');

		const ratingsDiv = document.createElement('div');
		ratingsDiv.classList.add('ratings');
		ratingsDiv.id = `rest-${this.id}-com-${index}`;
		commentLi.appendChild(ratingsDiv);

		const commentDiv = document.createElement('div');
		commentDiv.classList.add('font-italic');
		const commentText = document.createTextNode(`${comment}`);
		commentDiv.appendChild(commentText);
		commentLi.appendChild(commentDiv);
		
		container.appendChild(commentLi);
		
		const rateContainer = document.getElementById(`rest-${this.id}-com-${index}`);
		this.convertRatingToStars(stars, rateContainer);
	}

	// get the list of comments from the array ratings and call the function to convert and display ratings as stars
	getCommentList() {
		const ratings = this.ratings;
		const container = document.getElementById(`comment-list-${this.id}`);
		if (ratings.length > 0) {
			ratings.forEach((element, index) => {
				this.displayComment(container, element.comment, element.stars, index);
			})
		}
	}

	// creation of the restaurant card with cards accordion bootstrap element
	createRestaurantCard() {
		document.getElementById('accordionList').insertAdjacentHTML('beforeend',
			`<div id="card-${this.id}" class="card border-top-0 border-left-0 border-right-0 border-bottom rounded-0">
			<div class="card-header btn btn-link border-0 bg-transparent text-reset text-decoration-none" class="collapse" id="header-${this.id}" data-toggle="collapse" data-target="#collapse-${this.id}">
					<div class="row justify-content-between no-gutters">
						<div class="col-8 text-left font-weight-bold">${this.name}</div>
						<div id="avg-rating-${this.id}" class="col-4 ratings text-right">
						</div>
					</div>
					<div class="row">
						<span class="col text-left">${this.address}</span>
					</div>
				</div>
				<div id="collapse-${this.id}" class="collapse" aria-labelledby="header-${this.id}" data-parent="#accordionList">
					<div class="card-body">
						<div class="img-street-view">
							<img class="w-100" src="${this.getStreetViewImage()}">
						</div>
						<button id="add-comment-${this.id}" class="btn mt-2" data-toggle="modal" data-target="#add-comment-modal" data-restaurant="${this.name}">
							<i class="fas fa-plus-circle"></i> Ajouter un avis
						</button>
						<ul id="comment-list-${this.id}" class="list-group-flush p-0 mt-2">
						</ul>
					</div>
				</div>
			</div>`
		);
		// toggle collapse when clicking anywhere in the card-body, except when clicking on the add comment button
		document.getElementById(`collapse-${this.id}`).addEventListener('click', (e) => {
			const buttonAddComment = document.getElementById(`add-comment-${this.id}`);
			if (e.target !== buttonAddComment) {
				$('#collapse-'+this.id).collapse('toggle');
			}
		})
	}

	// addition of the restaurant in the list with card creation, rating calculation and conversion to stars, and comments list - no duplicate
	displayRestaurant(map) {
		this.displayMarker(map);
		this.createRestaurantCard();
		this.displayAvgRating();
		this.getCommentList();

		const restaurantCard = document.getElementById(`card-${this.id}`);
		const restaurantCollapsible = $(`#collapse-${this.id}`);

		// restaurant card mouse events to link list and markers
		restaurantCard.addEventListener('mouseover', () => {
			this.mouseOverRestaurant();
		})
		restaurantCard.addEventListener('mouseout', () => {
			this.mouseOutRestaurant();
		})

		// display active marker when the restaurant card is shown
		restaurantCollapsible.on('show.bs.collapse', () => {
			restaurantCard.scrollIntoView();
			this.activateRestaurant();
		})

		restaurantCollapsible.one('show.bs.collapse', () => {
			if (this.googlePlaceId && this.ratings.length === 0) {
				let request = {
					placeId: this.googlePlaceId,
					fields: ['reviews']
				};
				service.getDetails(request, (placeResult, status) => {
					if (status == google.maps.places.PlacesServiceStatus.OK) {
						if (placeResult.reviews) {
							const ratings = placeResult.reviews.map(review => {
								let newReview = {};
								return newReview = {
									'stars': review.rating,
									'comment': review.text
								}
							})
							this.ratings = ratings;
							this.getCommentList();
						} 
					} else {
						console.log('showDetails failed: ' + status);
					}
				})
			}
		})

		// reverse when restaurant card is hidden
		restaurantCollapsible.on('hide.bs.collapse', () => {
			this.deactivateRestaurant();
		})
	}

	// actions on mouse over restaurant marker or list
	mouseOverRestaurant() {
		if (document.getElementById(`card-${this.id}`)) document.getElementById(`card-${this.id}`).style.backgroundColor = '#f2f2f2';
		this.marker.setZIndex(1000);
		this.marker.setIcon(`${restaurantIconOver}?i=${this.id}`);
	}

	// actions on mouse out restaurant marker or list
	mouseOutRestaurant() {
		if (!this.marker.isClicked) {
			if (document.getElementById(`card-${this.id}`)) document.getElementById(`card-${this.id}`).style.backgroundColor = '';
			this.marker.setZIndex();
			this.marker.setIcon(`${restaurantIcon}?i=${this.id}`);
		}
	}

	// set parameters when restaurant is selected
	activateRestaurant() {
		this.marker.isClicked = true;
		this.marker.setIcon(`${restaurantIconOver}?i=${this.id}`);
		this.marker.setZIndex(100);
		this.marker.setOpacity(1);
	}

	// set parameters when restaurant is deselected
	deactivateRestaurant() {
		this.marker.isClicked = false;
		this.marker.setIcon(`${restaurantIcon}?i=${this.id}`);
		this.marker.setZIndex();
		this.marker.setOpacity(0.8);
		if (document.getElementById(`card-${this.id}`)) document.getElementById(`card-${this.id}`).style.backgroundColor = '';
	}

	// clear the list of restaurants
	clearRestaurant(map) {
		const restaurantCard = document.getElementById(`card-${this.id}`);
		if (restaurantCard) {
			restaurantCard.remove();
			this.deactivateRestaurant();
		}
		if(this.marker) this.marker.setMap(null);
	}

	// hide filtered restaurant
	hide() {
		const restaurantCard = document.getElementById(`card-${this.id}`);
		restaurantCard.classList.add('d-none');
		this.marker.setVisible(false);
	}

	// show filtered restaurant
	show() {
		const restaurantCard = document.getElementById(`card-${this.id}`);
		restaurantCard.classList.remove('d-none');
		this.marker.setVisible(true);
	}

	// post comment and update ratings
	addComment() {
		const thisRate = parseInt(document.querySelector(`#rate-select`).value);
		const thisComment = document.querySelector(`#comment-text`).value;
		this.ratings.push({ stars: thisRate, comment: thisComment });
		const commentsContainer = document.getElementById(`comment-list-${this.id}`);
		this.totalRatings += 1;
		this.displayComment(commentsContainer, thisComment, thisRate, this.ratings.length - 1);

		// update average rating - consolelog for testing
		console.log('rating before: '+this.averageRating);
		this.averageRating = ((this.averageRating*(this.totalRatings-1)) + thisRate )/(this.totalRatings);
		console.log('rating after: '+this.averageRating);
		const avgRatingContainer = document.getElementById(`avg-rating-${this.id}`);
		this.convertRatingToStars(this.averageRating, avgRatingContainer);
	}
}