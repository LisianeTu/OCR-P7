//import { visibleRestaurants } from './restaurantsList.js';
export { Restaurant };

class Restaurant {
	constructor(elementIndex, name, address, lat, lng, ratings) {
		this.elementIndex = elementIndex,
		this.id = name.replace(/[\s|'|]+/g, '').toLowerCase(),
		this.name = name,
		this.address = address,
		this.lat = lat,
		this.lng = lng,
		this.ratings = ratings,
		this.averageRating = 0,
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
			icon: `./images/restaurant-icon.png?i=${this.id}`,
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

	// convert rating to stars: get the % on 5 of the rating, math round to have .5 results, % determine the width of stars to show and add stars HTML
	convertRatingToStars(rate, container) {
		const starPercentage = (rate / 5) * 100;
		const starPercentageRounded = `${(Math.round(starPercentage / 10) * 10)}%`;
		container.innerHTML =
			`<div class="stars-outer">
				<i class="far fa-star"></i>
				<i class="far fa-star"></i>
				<i class="far fa-star"></i>
				<i class="far fa-star"></i>
				<i class="far fa-star"></i>
				<div class="stars-inner" style="width: ${starPercentageRounded}">
					<i class="fas fa-star"></i>
					<i class="fas fa-star"></i>
					<i class="fas fa-star"></i>
					<i class="fas fa-star"></i>
					<i class="fas fa-star"></i>
				</div>
			</div>`;
	}

	// calculate the average rating from the array ratings: devide the sum of stars by the number of comments
	calculateAvgRating() {
		const ratings = this.ratings;
		let averageRating = 0;
		ratings.forEach(element => {
			averageRating += element.stars;
		});
		averageRating /= ratings.length;
		this.averageRating = averageRating;
		return averageRating;
	}

	displayAvgRating() {
		const avgRatingContainer = document.getElementById(`avg-rating-${this.id}`);
		if (this.ratings.length > 0) {
			const avgRating = this.calculateAvgRating();
			this.convertRatingToStars(avgRating, avgRatingContainer);
		} else {
			this.averageRating = 0;
			avgRatingContainer.innerHTML = '<div class="stars-outer">0 avis</div>';
		}
	}

	// call to streetview api
	getStreetViewImage() {
		return `https://maps.googleapis.com/maps/api/streetview?location=${this.lat},${this.lng}&size=800x400&key=AIzaSyBY_-_fuIgtxCYUn84JlHi8cPO_QOHzYVQ`;
	}

	displayComment(container, comment, stars, index) {
		container.insertAdjacentHTML('afterbegin',
			`<li class="list-group-item">
				<div id="rest-${this.id}-com-${index}" class="ratings"></div>
				<div class="font-italic">${comment}</div>
			</li>`
		);
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
					<div class="row justify-content-between">
						<div class="font-weight-bold">${this.name}</div>
						<div id="avg-rating-${this.id}" class="ratings text-right">
						</div>
					</div>
					<div class="row">
						<span>${this.address}</span>
					</div>
				</div>
				<div id="collapse-${this.id}" class="collapse" aria-labelledby="header-${this.id}" data-parent="#accordionList">
					<div class="card-body">
						<div class="img-street-view">
							<img class="w-100" src="${this.getStreetViewImage()}"
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
			this.activateRestaurant();
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
		this.marker.setOpacity(1);
	}

	// actions on mouse out restaurant marker or list
	mouseOutRestaurant() {
		if (!this.marker.isClicked) {
			if (document.getElementById(`card-${this.id}`)) document.getElementById(`card-${this.id}`).style.backgroundColor = '';
			this.marker.setZIndex();
			this.marker.setOpacity(0.8);
		}
	}

	// set parameters when restaurant is selected
	activateRestaurant() {
		this.marker.isClicked = true;
		this.marker.setIcon(`./images/restaurant-icon-over.png?i=${this.id}`);
		this.marker.setZIndex(100);
		this.marker.setOpacity(1);
	}

	// set parameters when restaurant is deselected
	deactivateRestaurant() {
		this.marker.isClicked = false;
		this.marker.setIcon(`./images/restaurant-icon.png?i=${this.id}`);
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
		this.marker.setMap(null);
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

		this.displayComment(commentsContainer, thisComment, thisRate, this.ratings.length - 1);

		this.displayAvgRating();
	}
}