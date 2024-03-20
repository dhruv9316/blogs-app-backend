const Posts = require("../models/Posts")
const Tags = require("../models/Tags")
const { uploadImage } = require("../utils/imageUploader")

exports.uploadPost = async (req, res) => {
  try {
    const {
      title,
      description,
      tags
    } = req.body


    const image = req.files.image
    let imageResponse = null;
    if (image) {
      if (image.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: "Max 5 MB file size is allowed",
        });
      }
      
      imageResponse = await uploadImage(
        image, process.env.FOLDER_NAME, 1000, 1000
      )
      console.log('imageResponse => ', imageResponse);
    }

    const result = await Posts.create({
      title,
      description,
      image: imageResponse.secure_url
    })

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Error while creating post",
      })
    }

    if (tags) {
      const parsedTags = JSON.parse(tags)
      console.log("tags aafter parsing => ", parsedTags)

      for (const tag of parsedTags) {
        const tagResult = await Tags.create({
          name: tag,
          post_id: result._id
        })

        if (!tagResult) {  
          return res.status(400).json({
            success: false,
            message: `Error while creating tag - ${tag}`,
          })
        }
      }      
    }

    return res.json({
      success: true,
      message: "Post created Successfully",
      data: result
    })

  } catch (error) {
    console.log("error in uploadPost => ", error)

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server error",
    })
  }
}

exports.fetchAllPosts = async (req, res) => {
  try {
    const queryParams = req.query;
    console.log("queryParams => ", queryParams)

    const queryParamOptions = Object.keys(queryParams);
    const validOptions = ['sort_by', 'tag', 'keyword', 'skip', 'limit']

    for (option of queryParamOptions) {
      if (!validOptions.includes(option)) {
        return res.status(400).json({
          success: false,
          message: `Invalid option - '${option}'`,
        })
      }
    }

    let pipeline = [];

    if (queryParams.keyword || queryParams.tag) {

      let matchOptions = {};

      // keyword filtering
      if (queryParams.keyword) {
        matchOptions.$or = [
          { 
            title: { 
              $regex: queryParams.keyword, 
              $options: 'i' // i -> for applying non-case sensitivity
            } 
          }, 
          { 
            description: { 
              $regex: queryParams.keyword, 
              $options: 'i' 
            } 
          }, 
        ];
      }

      // tag filtering
      if (queryParams.tag) {
        const matchingPosts = await Tags.find(
          { 
            name: queryParams.tag 
          }
        );

        const matched_post_ids = matchingPosts.flatMap(tag => tag.post_id);

        matchOptions._id = {
          $in: matched_post_ids 
        }
      }

      pipeline.push({
        $match: matchOptions
      })
      
    }

    // sorting
    if (queryParams.sort_by) {
      const parts = queryParams.sort_by.split(':');
      const validSortFields = ['title', 'description']

      if (!validSortFields.includes(parts[0])) {
        return res.status(400).json({
          success: false,
          message: `Invalid field - '${parts[0]}' for sorting`,
        })
      }

      pipeline.push({ 
        $sort: {
          [parts[0]]: parts[1] === 'desc' ? -1 : 1
        },
      })

    }

    // pagination
    if (queryParams.skip && queryParams.limit) {
      const skip = parseInt(queryParams.skip) || 0;
      const limit = parseInt(queryParams.limit) || 10;

      pipeline.push({
        $skip: skip
      })
      pipeline.push({
        $limit: limit
      })
    }

    console.log("final pipeline => ", pipeline);
    if (pipeline.length === 0) {
      pipeline.push({
        $match: {}
      })
    }
    let result = await Posts.aggregate(pipeline);
    // console.log("result => ", result);

    if (queryParams.tag) {
      result = result.map(post => {
        return {
          ...post,
          tag: queryParams.tag
        }
      })
    }

    return res.status(200).json({
      success: true,
      data: result,
    })

  } catch (error) {
    console.log("error in fetchAllPosts => ", error)

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server error",
    })
  }
}

// un optimal
// exports.fetchAllPosts = async (req, res) => {
//   try {
//     const queryParams = req.query;
//     console.log("queryParams => ", queryParams)

//     let options = {};
//     let sortOptions = {};
//     let matched_post_ids = [] // that matched with the tag

//     // sorting
//     if (queryParams.sort_by) {
//       const parts = queryParams.sort_by.split(':');
//       sortOptions[parts[0]] = parts[1] === 'desc' ? -1 : 1; 
//     }

//     // pagination
//     if (queryParams.skip && queryParams.limit) {
//       const skip = parseInt(queryParams.skip) || 0;
//       const limit = parseInt(queryParams.limit) || 10;

//       options.skip = skip;
//       options.limit = limit;
//     }
    

//     // keyword filtering
//     if (queryParams.keyword) {
//       const keyword = new RegExp(queryParams.keyword, 'i'); // i -> for applying non-case sensitivity
//       options.$or = [
//         { 
//           title: keyword 
//         }, 
//         { 
//           description: keyword 
//         }
//       ];
//     }

//     // tag filtering
//     if (queryParams.tag) {
//       const matchingPosts = await Tags.find(
//         { 
//           name: queryParams.tag 
//         }
//       );

//       const postIds = matchingPosts.flatMap(tag => tag.post_id);
//       matched_post_ids = postIds

//       options._id = {
//         $in: matched_post_ids 
//       }
//     }

//     if (!queryParams.tag && !queryParams.sort_by && !queryParams.keyword && !queryParams.skip && !queryParams.limit && Object.keys(queryParams).length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid option",
//       })
//     }

//     let result;

//     if (queryParams.sort_by) {
//       result = await Posts.find(options)
//                           .sort(sortOptions)
//                           .collation({ locale: 'en', strength: 2 })
//                           .skip(queryParams.skip ?? 0).limit(queryParams.limit ?? 100);
//     } else {
//       result = await Posts.find(options).skip(queryParams.skip ?? 0).limit(queryParams.limit ?? 100);
//     }

//     if (queryParams.tag) {
//       result = result.map(post => {
//         return {
//           ...post._doc,
//           tag: queryParams.tag
//         }
//       })
//     }

//     return res.status(200).json({
//       success: true,
//       data: result,
//     })

//   } catch (error) {
//     console.log("error in fetchAllPosts => ", error)

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Internal Server error",
//     })
//   }
// }
