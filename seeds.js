const faker = require('faker');
const Product = require('./models/product.model.js');
const cities = require('./cities');

let cat = ['makanan', 'baju', 'celana', 'asesoris'];

async function seedPosts() {
	await Product.deleteMany({});
	for(const i of new Array(20)) {
		const random1000 = Math.floor(Math.random() * 1000);
		const random5 = Math.floor(Math.random() * 6);
		const title = faker.lorem.word();
		const description = faker.lorem.text();
		const productData = {
			title,
			description,
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			geometry: {
				type: 'Point',
				coordinates: [cities[random1000].longitude, cities[random1000].latitude],
			},
			price: random1000,
			avgRating: random5,
			author: '5ed93933d29c9c75abe1d0f9',
			categori: cat[Math.floor(Math.random()*4)],
			images: [
				{
					url: 'https://res.cloudinary.com/devsprout/image/upload/v1561315599/surf-shop/surfboard.jpg'
				}
			]
		}

		let product = new Product(productData);
		// manambahkan data properties.description dibagian akhir setelah inisialisasi data product
		// ini untuk mendapatkan id product, digunakan untuk popup untuk lokasi map product.
		product.properties.description = `<strong><a href="/product/${product._id}">${title}</a></strong><p>${product.location}</p><p>${description.substring(0, 20)}...</p>`;
		product.save();
	}
	console.log('20 new posts created');
}

module.exports = seedPosts; 