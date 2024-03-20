const { body, validationResult, query } = require("express-validator");

exports.validator = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(500).json({
            success: false,
            message: errors.array()[0]?.msg || "Please fill the fields Properly",
            errors: errors.array()
        })
    }

    next();
}

exports.validateFetchAllPosts = [
    query("tag")
        .optional()
        .notEmpty()
        .withMessage("Tag can not be empty")
        .isString()
        .withMessage("Tag must be a string"),
    query("sort_by")
        .optional()
        .notEmpty()
        .withMessage("sort_by can not be empty")
        .isString()
        .withMessage("sort_by must be a string"),
    query("keyword")
        .optional()
        .notEmpty()
        .withMessage("keyword can not be empty")
        .isString()
        .withMessage("keyword must be a string"),
    query("skip")
        .optional()
        .notEmpty()
        .withMessage("Skip can not be empty")
        .isInt()
        .withMessage("Skip must be a Integer"),
    query("limit")
        .optional()
        .notEmpty()
        .withMessage("Limit can not be empty")
        .isInt()
        .withMessage("Limit must be a Integer"),
]

exports.validateUploadPost = [
    body("title")
        .notEmpty()
        .withMessage("Title is required")
        .isString()
        .withMessage("title must be a string"),
    body("description")
        .optional()
        .notEmpty()
        .withMessage("description can not be empty")
        .isString()
        .withMessage("description must be a string"),
]