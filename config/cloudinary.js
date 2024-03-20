const cloudinary = require("cloudinary").v2;

exports.connectToCloudinary = () => {
	try {
		cloudinary.config({
			// Upload MEDIA
			cloud_name: process.env.CLOUD_NAME,
			api_key: process.env.API_KEY,
			api_secret: process.env.API_SECRET,
		});

		console.log("- - Cloudinary Connected Successfully - -")
	} catch (error) {
		console.log(error);
	}
};