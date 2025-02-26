import jwt from 'jsonwebtoken';
import { Article, Comment } from '../models/article.model.js';
import { User } from '../models/user.model.js';
import { upload_on_cloudinary } from '../utils/cloudinary.js';

const secretKey = process.env.SECRET_KEY;

// const addArticle = async (req, res) => {
//     try {
//         const { title, content, thumbnail } = req.body;
//         console.log("addArticle called");

//         if(!title || !content || !thumbnail){
//             return res.status(400).json({ error: "Title, content, and thumbnail are required." });
//         }

//         // Set name same as title
//         const name = title;

//         // Validate Authorization Header
//         const authHeader = req.headers.authorization;
//         if (!authHeader) {
//             console.error("Authorization header is missing.");
//             return res.status(401).json({ error: "No token provided." });
//         }

//         const token = authHeader.split(' ')[1];
//         if (!token) {   
//             console.error("Bearer token is missing.");
//             return res.status(401).json({ error: "Invalid token format." });
//         }

//         // Decode and Verify Token
//         let decoded;
//         try {
//             decoded = jwt.verify(token, secretKey);
//         } catch (err) {
//             console.error("Error decoding token:", err.message);
//             return res.status(401).json({ error: "Invalid or expired token." });
//         }

//         // Find the authenticated user
//         const userId = decoded.userId;
//         const user = await User.findById(userId);
//         if (!user) {
//             console.error(`User with ID ${userId} not found.`);
//             return res.status(404).json({ error: "User not found." });
//         }

//         // Check if an article with the same name already exists
//         const existingArticle = await Article.findOne({ name });
//         if (existingArticle) {
//             return res.status(400).json({ error: "Article with this title already exists." });
//         }

//         // Create and save the new article
//         const newArticle = new Article({
//             name, 
//             title,
//             content,
//             thumbnail,
//             author: userId,
//             comments: [],
//         });

//         await newArticle.save();

//         // Increment the user's article count
//         user.articlesPublished += 1;
//         await user.save();

//         res.status(201).json({ message: "Article created successfully", article: newArticle });
//     } catch (error) {
//         console.error("Error adding article:", error);
//         if (error.code === 11000) {
//             return res.status(400).json({ error: "Article with this title already exists" });
//         }
//         res.status(500).json({ error: "Internal server error" });
//     }
// };


const addArticle = async (req, res) => {
    try {
        const { title, content, tag } = req.body;
        console.log(tag)
        const filebuffer = req.file ? req.file.buffer : null
        console.log(filebuffer)
        console.log("addArticle called");

        if (!title || !content || !tag) {
            return res.status(400).json({ error: "Title, content, and tag are required." });
        }

        if (!filebuffer) {
            return res.status(400).json({ error: "error receiveing thumbnail" })
        }

        // Set name same as title
        const name = title;

        const upload_image_url = await upload_on_cloudinary(filebuffer)

        if (!upload_image_url) {
            return res.status(400).json({ error: "error while uploading" })
        }

        // Validate Authorization Header
        const authHeader = req.headers.authorization;
        console.log(authHeader);
        if (!authHeader) {
            console.error("Authorization header is missing.");
            return res.status(401).json({ error: "No token provided." });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            console.error("Bearer token is missing.");
            return res.status(401).json({ error: "Invalid token format." });
        }

        // Decode and Verify Token
        let decoded;
        try {
            decoded = jwt.verify(token, secretKey);
        } catch (err) {
            console.error("Error decoding token:", err.message);
            return res.status(401).json({ error: "Invalid or expired token." });
        }

        // Find the authenticated user
        const userId = decoded.userId;
        const user = await User.findById(userId);
        console.log("this is user", user)
        if (!user) {
            console.error(`User with ID ${userId} not found.`);
            return res.status(404).json({ error: "User not found." });
        }

        // Check if an article with the same name already exists
        const existingArticle = await Article.findOne({ name });
        if (existingArticle) {
            return res.status(400).json({ error: "Article with this title already exists." });
        }

        // Include `username` if required
        const username = user.username; // Ensure `username` exists in the User model

        // Create and save the new article
        const newArticle = new Article({
            name,
            title,
            content,
            tag,
            thumbnail: upload_image_url,
            author: userId,
            authorName: user.username,
            username, // Add this if required in the Article schema
            comments: [],
        });

        await newArticle.save();

        // Increment the user's article count
        user.articlesPublished += 1;
        await user.save();

        res.status(201).json({ message: "Article created successfully", article: newArticle });
    } catch (error) {
        console.error("Error adding article:", error);
        if (error.code === 11000) {
            return res.status(400).json({ error: "Article with this title already exists" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
};

const getarticles = async (req, res) => {
    try {
        const { articleName } = req.body;
        console.log(articleName)
        const articleInfo = await Article.findOne({ name: articleName }).populate('comments', 'username text createdAt');
        if (!articleInfo) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.status(200).json(articleInfo);
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const addcomments = async (req, res) => {
    try {
        const { name, comment } = req.body;
        const userid = req.headers.userid;
        console.log(userid)

        // Validate input
        if (!name || !comment || !comment.trim()) {
            return res.status(400).send({ success: false, message: "Article name and comment are required." });
        }

        // Validate user existence
        const user = await User.findById(userid);
        if (!user) {
            return res.status(404).send({ success: false, message: "User not found." });
        }

        // Validate article existence
        const fetchedArticle = await Article.findOne({ name });
        if (!fetchedArticle) {
            return res.status(404).send({ success: false, message: "Article not found." });
        }

        // Create and save the new comment
        const newComment = new Comment({
            username: user.username,
            text: comment,
            article: fetchedArticle._id,
            user: userid,
        });

        await newComment.save();

        // Add comment reference to article and save
        fetchedArticle.comments.push(newComment);
        await fetchedArticle.save();

        // Fetch updated article with populated comments
        const updatedArticle = await Article.findOne({ name }).populate('comments', 'username text createdAt').populate('author', 'username');

        res.status(200).send({ success: true, article: updatedArticle });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).send({ success: false, message: "An error occurred while adding the comment." });
    }
};

const getAllArticles = async (req, res) => {
    try {
        const articles = await Article.find();
        if (articles.length === 0) {
            return res.status(404).json({ message: 'No articles found' });
        }
        res.status(200).json(articles);
    } catch (error) {
        console.error('Error fetching all articles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getarticlebyid = async (req, res) => {
    try {
        const { id } = req.body;
        console.log(id)
        const articleInfo = await Article.findById(id)
        if (!articleInfo) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.status(200).json(articleInfo);
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const editArticle = async (req, res) => {
    try {
        const { id, title, content } = req.body;
        const filebuffer = req.file ? req.file.buffer : null;

        if (!id) {
            return res.status(400).send({ error: "Article ID is required." });
        }

        if (!title || !content) {
            return res.status(400).send({ error: "Title and content are required." });
        }

        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "No token provided." });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: "Invalid token format." });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, secretKey);
        } catch (err) {
            return res.status(401).json({ error: "Invalid or expired token." });
        }

        const userId = decoded.userId;

        // Check if the article exists and belongs to the authenticated user
        const existingArticle = await Article.findById(id);
        if (!existingArticle) {
            return res.status(404).send({ error: "Article not found." });
        }

        if (existingArticle.author.toString() !== userId) {
            return res.status(403).send({ error: "You do not have permission to edit this article." });
        }

        let upload_image_url;
        if (filebuffer) {
            upload_image_url = await upload_on_cloudinary(filebuffer);
            if (!upload_image_url) {
                return res.status(400).json({ error: "Error while uploading thumbnail." });
            }
        }

        // Prepare update data
        const updateData = {
            title: title.trim(),
            content: content.trim(),
        };

        if (upload_image_url) {
            updateData.thumbnail = upload_image_url; // Add thumbnail only if provided
        }

        // Perform the update
        const updatedArticle = await Article.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true } // Return the updated document and validate fields
        );

        if (!updatedArticle) {
            return res.status(500).send({ error: "Failed to update the article." });
        }

        return res.status(200).send({
            success: "Article updated successfully.",
            article: updatedArticle,
        });
    } catch (err) {
        console.error("Error updating article:", err.message);
        return res.status(500).send({ error: "An internal server error occurred." });
    }
};

const deleteArticle = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: "Article ID is required." });
        }

        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "No token provided." });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: "Invalid token format." });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, secretKey);
        } catch (err) {
            return res.status(401).json({ error: "Invalid or expired token." });
        }

        const userId = decoded.userId;

        // Check if the article exists and belongs to the authenticated user
        const existingArticle = await Article.findById(id);
        if (!existingArticle) {
            return res.status(404).json({ error: "Article not found." });
        }

        if (existingArticle.author.toString() !== userId) {
            return res.status(403).json({ error: "You do not have permission to delete this article." });
        }

        await Article.findByIdAndDelete(id);

        return res.status(200).json({ message: "Article deleted successfully." });
    } catch (err) {
        console.error("Error deleting article:", err.message);
        return res.status(500).json({ error: "An internal server error occurred." });
    }
};

const likeArticle = async (req, res) => {
    try {
        const { articleId } = req.params;
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: "No token provided." });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            console.error("Bearer token is missing.");
            return res.status(401).json({ error: "Invalid token format." });
        }

        const decoded = jwt.verify(token, secretKey);
        const user = await User.findById(decoded.userId);
        if (!user) {
            console.error(`User not found for token with userId: ${decoded.userId}.`);
            return res.status(404).json({ error: "User not found." });
        }

        const userId = user._id;

        let liked = false;

        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ error: "Article not found." });
        }

        const userIndex = article.likedBy.indexOf(userId);
        if (userIndex === -1) {
            // User has not liked the article yet
            article.likedBy.push(userId);
            liked = true;
            article.likes += 1;
        } else {
            // User has already liked the article, so unlike it
            article.likedBy.splice(userIndex, 1);
            article.likes -= 1;
            liked = false;
        }

        // Save only the fields that are being updated
        await article.save({ validateModifiedOnly: true });

        // Add the article to the user's likedArticles array
        const articleIndex = user.likedArticles.indexOf(article._id);
        if (articleIndex === -1) {
            // User has not liked the article yet
            user.likedArticles.push(article._id);
        } else {
            // User has already liked the article, so unlike it
            user.likedArticles.splice(articleIndex, 1);
        }
        await user.save();

        res.status(200).json({ message: "Article like status updated.", likes: article.likes, liked: liked, likedBy: article.likedBy });
    } catch (error) {
        console.error("Error updating like status:", error);
        res.status(500).json({ error: "An error occurred while updating like status." });
    }
};

const getarticlesbyuser = async (req, res) => {
    try {
        const { uid } = req.body;

        // Check if uid is provided
        if (!uid) {
            return res.status(400).send({ success: false, message: "User ID is required." });
        }

        // Check if uid is in valid format (modify regex as per your ID format)
        if (typeof uid !== "string" || !/^[a-fA-F0-9]{24}$/.test(uid)) {
            return res.status(400).send({ success: false, message: "Invalid User ID format." });
        }

        // Fetch articles
        const articles = await Article.find({ author: uid }).lean();

        // Check if articles exist
        if (!articles || articles.length === 0) {
            return res.status(404).send({ success: false, message: "No articles found for this user." });
        }

        // Respond with articles
        res.status(200).send({
            success: true,
            message: "Articles fetched successfully.",
            articleDetails: articles,
        });
    } catch (error) {
        console.error("Error fetching articles:", error);

        // Handle unexpected errors
        res.status(500).send({
            success: false,
            message: "An error occurred while fetching articles.",
        });
    }
};

const getArticleByTag = async (req, res) => {
    try {
      // Destructure and validate the tag from the request body
      const { tag } = req.body;
  
      // Check if the tag is provided
      if (!tag || typeof tag !== 'string') {
        return res.status(400).json({ success: false, message: "Invalid or missing tag parameter" });
      }
  
      // Fetch articles by tag
      const fetchedArticles = await Article.find({ tag: tag.trim() });
  
      // Check if any articles were found
      if (fetchedArticles.length === 0) {
        return res.status(200).json({ success: false, message: "No articles found for the given tag" });
      }
  
      // Respond with the fetched articles
      return res.status(200).json({ success: true, message: "Articles fetched successfully", articles: fetchedArticles });
  
    } catch (error) {
      console.error("Error fetching articles by tag:", error);
      return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  };

export {
    addArticle,
    getarticles,
    addcomments,
    getAllArticles,
    editArticle,
    getarticlebyid,
    deleteArticle,
    getarticlesbyuser,
    likeArticle,
    getArticleByTag
}