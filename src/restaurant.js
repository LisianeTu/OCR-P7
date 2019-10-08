export { Restaurant };

class Restaurant {
	constructor(index, name, address, lat, lng, ratings) {
		this.index = index,
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
			icon: `./images/restaurant-icon.png?i=${this.index}`,
			opacity: 0.8,
			isClicked: false
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

	// convert rating to stars: get the % on 5 of the rating, math round to have .5 results, % determine the width of stars to show and add stars HTML
	convertRatingToStars(rate, container) {
		const starPercentage = (rate / 5) * 100;
		const starPercentageRounded = `${(Math.round(starPercentage / 10) * 10)}%`;
		container.insertAdjacentHTML('afterbegin',
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
			</div>`
		);
	}

	// call to streetview api
	getStreetViewImage() {
		return `https://maps.googleapis.com/maps/api/streetview?location=${this.lat},${this.lng}&size=800x400&key=AIzaSyC86o_zLHvoyot6-6dWtkwxXYX7V6blO-U`;
	}

	// get the list of comments from the array ratings and call the function to convert and display ratings as stars
	getCommentList() {
		const ratings = this.ratings;
		const container = document.getElementById(`comment-list-${this.index}`);
		ratings.forEach((element, index) => {
			container.insertAdjacentHTML('beforeend',
				`<li class="list-group-item">
					<div id="rest-${this.index}-com-${index}" class="ratings"></div>
					<div class="font-italic">${element.comment}</div>
				</li>`
			);
			const rateContainer = document.getElementById(`rest-${this.index}-com-${index}`);
			this.convertRatingToStars(element.stars, rateContainer);
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
					</div>
				</div>
			</div>`
		);
	}

	// addition of the restaurant in the list with card creation, rating calculation and conversion to stars, and comments list - no duplicate
	displayRestaurantInList() {
		const existingCard = document.getElementById(`card-${this.index}`);
		if (!document.getElementById('accordionList').contains(existingCard)) {
			this.createRestaurantCard();
			const avgRating = this.calculateAvgRating();
			const avgRatingContainer = document.getElementById(`avg-rating-${this.index}`);
			this.convertRatingToStars(avgRating, avgRatingContainer);
			this.getCommentList();
		}
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

	// clear the list of restaurants when map bounds change
	clearRestaurant() {
		const restaurantCard = document.getElementById(`card-${this.index}`);
		if (restaurantCard) {
			restaurantCard.remove();
			this.deactivateRestaurant();
		}
	}
}