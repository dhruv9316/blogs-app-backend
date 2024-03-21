const express = require("express")
const router = express.Router()

const { uploadPost, fetchAllPosts, fetchPostById } = require("../controllers/PostController")
const { validator, validateFetchAllPosts, validateUploadPost } = require("../middlewares/validator")


router.post("/upload-post", validateUploadPost, validator, uploadPost)
router.get("/fetch-all-posts", validateFetchAllPosts, validator, fetchAllPosts)
router.get("/fetch-post-by-id", fetchPostById)

module.exports = router