var yelp = require("node-yelp");


module.exports = (robot) => {

	var client = yelp.createClient({
	  	oauth: {
		    "consumer_key": "xQSKK9H7wWD2kGBojduMeQ",
		    "consumer_secret": "UsmGIEpuz7DR5q3-vV4TJDFUonM",
		    "token": "i9_qThJY8s_5XDu9pcS4fjfTVmHy8zFn",
		    "token_secret": "Gwzyzj38gbvCF6m0lwA_6VQU0KY"
		 }
	})

	robot.respond(/yelp me baby/i, (res) => {
		var randomSearch = 'food';
		// var data = JSON.stringify({
		// 	id: 'drgs123',
		// 	field: 'xQSKK9H7wWD2kGBojduMeQ'
		// })

		client.search({
		  terms: "Café de la presse",
		  location: "BELGIUM"
		}).then(function (data) {
		
		  console.log(data.businesses[0].url)
		});		

		// robot.http('https://api.yelp.com/v2/search?term=food&location=San+Francisco')
		// .header('Content-Type', 'application/json')
		// .post(data)(function (err, res, body) {
		// 	console.log(body)
		// })
		


	});
};