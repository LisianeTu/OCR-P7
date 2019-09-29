export { getRestList };

class Restaurant {
	constructor(name, address, lat, lng, ratings) {
		this.name = name,
		this.address = address,
		this.lat = lat,
		this.lng = lng,
		this.ratings = ratings
	}

	displayRestaurant() {
		const newLi = document.createElement('li');
		const info = document.createElement('div');
		const name = document.createTextNode(this.name + this.address);
		//const address = document.createTextNode(this.address);
		info.appendChild(name);
		newLi.appendChild(info);
		document.getElementById('list').appendChild(newLi);
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

			restList.forEach(element => {
				const rest = new Restaurant(element.restaurantName, element.address, element.lat, element.long, element.ratings);
				console.log(rest);
				rest.displayRestaurant();
			});
		}
	});
}
