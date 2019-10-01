export { getRestList };

class Restaurant {
	constructor(index, name, address, lat, lng, ratings) {
		this.index = index,
		this.name = name,
		this.address = address,
		this.lat = lat,
		this.lng = lng,
		this.ratings = ratings
	}

	displayOnMap(map) {
		const newMarker = new google.maps.Marker({
			position: {lat: this.lat, lng: this.lng},
			map: map
		});
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

	displayRestaurantList() {
		const newCard = document.createElement('div');
		newCard.classList.add('card', 'border-top-0', 'border-left-0', 'border-right-0', 'border-bottom', 'rounded-0');
		document.getElementById('accordionList').appendChild(newCard);
		newCard.insertAdjacentHTML('afterbegin',
		`<div class="card-header btn btn-link border-0 bg-transparent text-reset text-decoration-none" id="header-${this.index}" data-toggle="collapse" data-target="#collapse-${this.index}">
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
			</div>`
		);
		const avgRating = this.calculateAvgRating();
		const avgRatingContainer = document.getElementById(`avg-rating-${this.index}`);
		this.convertRatingToStars(avgRating, avgRatingContainer);

		this.getCommentList();
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
			const restList = xhr.response;

			restList.forEach((element, i) => {
				const rest = new Restaurant(i, element.restaurantName, element.address, element.lat, element.long, element.ratings);
				rest.displayOnMap(map);
				rest.displayRestaurantList();
			});
		}
	});
}
