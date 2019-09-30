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

	calculateRating() {
		const ratings = this.ratings;
		let averageRating= 0;
		ratings.forEach((element) => {
			averageRating += element.stars;
		})
		averageRating /= ratings.length; 
		return averageRating = Math.round(averageRating * 2) / 2;
	}

	displayRestaurant() {
		const newCard = document.createElement('div');
		newCard.classList.add('card', 'border-top-0', 'border-left-0', 'border-right-0', 'border-bottom', 'rounded-0');
		document.getElementById('accordionList').appendChild(newCard);
		const rate = this.calculateRating();

		newCard.insertAdjacentHTML('afterbegin',
		`<div class="card-header btn btn-link border-0 bg-transparent text-reset text-decoration-none" id="header-${this.index}" data-toggle="collapse" data-target="#collapse-${this.index}">
				<div class="row justify-content-between">
					<span class="font-weight-bold">${this.name}</span>
					<span class="ratings text-right">${rate}</span>
				</div>
				<div class="row">
					<span>${this.address}</span>
				</div>
			</div>
			<div id="collapse-${this.index}" class="collapse" aria-labelledby="header-${this.index}" data-parent="#accordionList">
				<div class="card-body">
					<div class="img-street-view">
					</div>
					<ul class="list-group-flush p-0">
					</ul>
				</div>
			</div>`
		);
	}
} 

function getRestList() {
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
				rest.displayRestaurant();
			});
		}
	});
}
