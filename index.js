const express = require("express");
const app = express();

const database = require("./config/database");
const {connectToCloudinary } = require("./config/cloudinary");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const dotenv = require("dotenv");
dotenv.config();

const postRoutes = require("./routes/postRoute");
const PORT = process.env.PORT || 4000;

database.connect();

//middlewares
app.use(express.json());

app.use(
	cors({
		origin: "*",
		credentials: true,
	})
);

app.use(
	fileUpload({
		useTempFiles:true,
		tempFileDir:"/tmp",
	})
)
connectToCloudinary()

//mounting... routes
app.use("/api/v1", postRoutes);
 
app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Your server is up and running...'
	});
});
 
app.listen(PORT, () => {
	console.log(`Your server is running at ${PORT}`)
})
 
module.exports = app