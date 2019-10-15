//import { visibleRestaurants } from './restaurantsList.js';
export { Restaurant };

class Restaurant {
	constructor(elementIndex, name, address, lat, lng, ratings) {
		this.index = name.replace(/[\s|'|]+/g, '').toLowerCase(),
			this.name = name,
			this.address = address,
			this.lat = lat,
			this.lng = lng,
			this.ratings = ratings,
			this.averageRating = 0,
			this.marker = '',
			this.elementIndex = elementIndex
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
			icon: `./images/restaurant-icon.png?i=${this.index}`,
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
			$(`#collapse-${this.index}`).collapse('toggle');
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
		const avgRating = this.calculateAvgRating();
		const avgRatingContainer = document.getElementById(`avg-rating-${this.index}`);
		this.convertRatingToStars(avgRating, avgRatingContainer);
	}

	// call to streetview api
	getStreetViewImage() {
		return `https://maps.googleapis.com/maps/api/streetview?location=${this.lat},${this.lng}&size=800x400&key=AIzaSyBY_-_fuIgtxCYUn84JlHi8cPO_QOHzYVQ`;
	}

	displayComment(container, comment, stars, index) {
		container.insertAdjacentHTML('afterbegin',
			`<li class="list-group-item">
				<div id="rest-${this.index}-com-${index}" class="ratings"></div>
				<div class="font-italic">${comment}</div>
			</li>`
		);
		const rateContainer = document.getElementById(`rest-${this.index}-com-${index}`);
		this.convertRatingToStars(stars, rateContainer);
	}

	// get the list of comments from the array ratings and call the function to convert and display ratings as stars
	getCommentList() {
		const ratings = this.ratings;
		const container = document.getElementById(`comment-list-${this.index}`);
		ratings.forEach((element, index) => {
			this.displayComment(container, element.comment, element.stars, index);
		})
	}

	// creation of the restaurant card with cards accordion bootstrap element
	createRestaurantCard() {
		document.getElementById('accordionList').insertAdjacentHTML('beforeend',
			`<div id="card-${this.index}" class="card border-top-0 border-left-0 border-right-0 border-bottom rounded-0">
			<div class="card-header btn btn-link border-0 bg-transparent text-reset text-decoration-none" class="collapse" id="header-${this.index}" data-toggle="collapse" data-target="#collapse-${this.index}">
					<div class="row justify-content-between">
						<div class="font-weight-bold">${this.name}</div>
						<div id="avg-rating-${this.index}" class="ratings text-right">
						</div>
					</div>
					<div class="row">
						<span>${this.address}</span>
					</div>
				</div>
				<div id="collapse-${this.index}" class="collapse" aria-labelledby="header-${this.index}" data-parent="#accordionList">
					<div class="card-body">
						<div class="img-street-view">
							<img class="w-100" src="${this.getStreetViewImage()}"
						</div>
						<ul id="comment-list-${this.index}" class="list-group-flush p-0">
						</ul>
						<button id="add-comment-${this.index}" class="btn" data-toggle="modal" data-target="#add-comment-modal-${this.index}" data-restaurant="${this.name}">
							<i class="fas fa-plus-circle"></i> Ajouter un avis
						</button>
					</div>
				</div>
			</div>`
		);
		document.getElementById(`add-comment-${this.index}`).addEventListener('click', () => {
			this.createCommentModal();
			this.addComment();
		});
	}

	// addition of the restaurant in the list with card creation, rating calculation and conversion to stars, and comments list - no duplicate
	displayRestaurantInList() {
		this.createRestaurantCard();
		this.displayAvgRating();
		this.getCommentList();
	}

	// actions on mouse over restaurant marker or list
	mouseOverRestaurant() {
		if (document.getElementById(`card-${this.index}`)) document.getElementById(`card-${this.index}`).style.backgroundColor = '#f2f2f2';
		this.marker.setZIndex(1000);
		this.marker.setOpacity(1);
	}

	// actions on mouse out restaurant marker or list
	mouseOutRestaurant() {
		if (!this.marker.isClicked) {
			if (document.getElementById(`card-${this.index}`)) document.getElementById(`card-${this.index}`).style.backgroundColor = '';
			this.marker.setZIndex();
			this.marker.setOpacity(0.8);
		}
	}

	// set parameters when restaurant is selected
	activateRestaurant() {
		this.marker.isClicked = true;
		this.marker.setIcon(`./images/restaurant-icon-over.png?i=${this.index}`);
		this.marker.setZIndex(100);
		this.marker.setOpacity(1);
	}

	// set parameters when restaurant is deselected
	deactivateRestaurant() {
		this.marker.isClicked = false;
		this.marker.setIcon(`./images/restaurant-icon.png?i=${this.index}`);
		this.marker.setZIndex();
		this.marker.setOpacity(0.8);
		if (document.getElementById(`card-${this.index}`)) document.getElementById(`card-${this.index}`).style.backgroundColor = '';
	}

	// clear the list of restaurants
	clearRestaurant(map) {
		const restaurantCard = document.getElementById(`card-${this.index}`);
		if (restaurantCard) {
			restaurantCard.remove();
			this.deactivateRestaurant();
		}
		this.marker.setMap(null);
	}

	hide() {
		const restaurantCard = document.getElementById(`card-${this.index}`);
		restaurantCard.classList.add('d-none');
		this.marker.setVisible(false);
	}

	show() {
		const restaurantCard = document.getElementById(`card-${this.index}`);
		restaurantCard.classList.remove('d-none');
		this.marker.setVisible(true);
	}

	createCommentModal() {
		const modalContainer = document.getElementById('modal-container');
		modalContainer.insertAdjacentHTML('afterbegin',
			`<div class="modal fade" id="add-comment-modal-${this.index}" tabindex="-1" role="dialog" aria-labelledby="add-comment-modal"
			aria-hidden="true">
			<div class="modal-dialog" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="modal-label">Ajouter un commentaire pour ${this.name}</h5>
						<button type="button" class="close" data-dismiss="modal" aria-label="Fermer">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div class="modal-body">
						<form id="post-comment-${this.index}" autocomplete="off">
							<div class="form-group">
								<label for="rate-select" class="col-form-label">Note :</label>
								<select id="rate-select" class="form-control" required>
									<option value="">Choisissez une note</option>
									<option value="1">1</option>
									<option value="2">2</option>
									<option value="3">3</option>
									<option value="4">4</option>
									<option value="5">5</option>
								</select>
							</div>
							<div class="form-group">
								<label for="comment-text" class="col-form-label">Commentaire :</label>
								<textarea class="form-control" id="comment-text"></textarea>
							</div>
							<button type="submit" class="btn btn-primary">Envoyer</button>
							<button type="button" class="btn btn-secondary" data-dismiss="modal">Fermer</button>
						</form>
					</div>
				</div>
			</div>
		</div>`)
	}

	addComment() {
		const postCommentForm = document.getElementById(`post-comment-${this.index}`);

		postCommentForm.addEventListener('submit', (e) => {
			e.preventDefault();

			if (!postCommentForm.checkValidity()) {				
				e.stopPropagation();
			} else {
				$(`#add-comment-modal-${this.index}`).modal('toggle');
				const thisRate = parseInt(document.querySelector(`#post-comment-${this.index} #rate-select`).value);
				const thisComment = document.querySelector(`#post-comment-${this.index} #comment-text`).value;
				this.ratings.push({ stars: thisRate, comment: thisComment });
				console.log(this.ratings);

				const commentsContainer = document.getElementById(`comment-list-${this.index}`);

				this.displayComment(commentsContainer, thisComment, thisRate, this.ratings.length - 1);

				this.displayAvgRating();
			}
		})

		$(`#add-comment-modal-${this.index}`).on('hidden.bs.modal', () => {
			postCommentForm.reset();
			$(`#add-comment-modal-${this.index}`).remove();
		})
	}
}