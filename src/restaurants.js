export { getRestList };

class Restaurant {
	constructor(index, name, address, lat, lng, ratings) {
		this.index = index,
		this.name = name,
		this.address = address,
		this.lat = lat,
		this.lng = lng,
		this.ratings = ratings,
		this.marker = ''
	}

	displayMarker(map) {
		const position = new google.maps.LatLng(this.lat, this.lng);
		const newMarker = new google.maps.Marker({
			position: position,
			optimized:false,
			map: map,
			icon: `./images/restaurant-icon.png?i=${this.index}`
		});

		this.marker = newMarker;

		newMarker.addListener('mouseover', () => {
			document.getElementById(`card-${this.index}`).style.backgroundColor = '#f2f2f2';
			newMarker.setZIndex(1000);
			newMarker.setIcon(`./images/restaurant-icon-over.png?i=${this.index}`);
		})

		newMarker.addListener('mouseout', () => {
			document.getElementById(`card-${this.index}`).style.backgroundColor = '';
			newMarker.setZIndex();
			newMarker.setIcon(`./images/restaurant-icon.png?i=${this.index}`);
		})

		newMarker.addListener('click', () => {
		})
	}

	calculateAvgRating() {
		const ratings = this.ratings;
		let averageRating= 0;
		ratings.forEach(element => {
			averageRating += element.stars;
		})
		return averageRating /= ratings.length; 
	}

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

	getStreetViewImage() {
		return `https://maps.googleapis.com/maps/api/streetview?location=${this.lat},${this.lng}&size=800x400&key=AIzaSyC86o_zLHvoyot6-6dWtkwxXYX7V6blO-U`;
	}

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

	displayRestaurantInList() {
		this.createRestaurantCard();
		const avgRating = this.calculateAvgRating();
		const avgRatingContainer = document.getElementById(`avg-rating-${this.index}`);
		this.convertRatingToStars(avgRating, avgRatingContainer);

		this.getCommentList();
	}

	clearRestaurant(map) {
		const marker = this.marker;
		marker.setMap(null);
		const restaurantCard = document.getElementById(`card-${this.index}`);
		if (restaurantCard) restaurantCard.remove();
	}
} 

function getRestList(map) {
	const jsonUrl = './data/list.json';
	const xhr = new XMLHttpRequest();

	xhr.open('GET', jsonUrl);
	xhr.responseType = 'json';
	xhr.send(null);

	xhr.addEventListener('readystatechange', () => {
		if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) { 
			const restaurantsList = xhr.response;

			restaurantsList.forEach((element, i) => {
				const restaurant = new Restaurant(i, element.restaurantName, element.address, element.lat, element.long, element.ratings);
				
				google.maps.event.addListener(map, 'idle', function() {
					restaurant.clearRestaurant(map);
					const mapBoundaries = map.getBounds();
					if (mapBoundaries.contains({lat: element.lat, lng: element.long})) {  
						restaurant.displayMarker(map);
						restaurant.displayRestaurantInList();

						const restaurantMarker = restaurant.marker.icon;
						const thisMarker = document.querySelector(`img[src='${restaurantMarker}']`);
						if (thisMarker) {
							thisMarker.setAttribute('data-toggle', 'collapse');
						}
					}

					
				});
			});
		}
	});

	
}
