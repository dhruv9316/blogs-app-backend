const express = require("express")
const router = express.Router()

const { uploadPost, fetchAllPosts } = require("../controllers/PostController")
const { validator, validateFetchAllPosts, validateUploadPost } = require("../middlewares/validator")


router.post("/upload-post", validateUploadPost, validator, uploadPost)
router.get("/fetch-all-posts", validateFetchAllPosts, validator, fetchAllPosts)

module.exports = router