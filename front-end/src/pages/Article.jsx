import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import NotFound from './NotFound';
import { link } from '../components/Baselink';
import LikeButton from '../components/LikeButton';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const Article = ({ loggedInUserId }) => {
  const { name } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likedBy, setLikedBy] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const url = `${link}`;

  useEffect(() => {
    const fetchArticleData = async () => {
      try {
        const { data } = await axios.post(
          url + '/api/article/getarticle',
          { articleName: name }
        );
        console.log(data)
        if (data.name === name) {
          setArticle(data);
          setLiked(data.liked);
          setLikedBy(data.likedBy);
        } else {
          setArticle(null);
        }
      } catch (err) {
        console.error('Error fetching article data:', err.message);
        setError(err.message);
      }
    };

    fetchArticleData();
  }, [name]);

  const handleDelete = async () => {
    try {
      await axios.delete(url + '/api/article/deletearticle', { data: { id: article._id } });
      window.location.href = '/article-list';
    } catch (err) {
      console.error('Error deleting article:', err.message);
      setError('Failed to delete the article.');
    }
    setIsDeleteDialogOpen(false);
  };

  const handleAddComment = async () => {
    const headers = {
      'userid': localStorage.getItem("userId")
    }
    console.log(localStorage.getItem("userId"))
    const resp = await axios.post(url + `/api/article/addcomment`, {
      name: name,
      comment: newComment
    }, { headers: headers })
    console.log(resp.data.article.comments)
  };

  if (error) return <p className="text-red-500 text-center mt-4">{error}</p>;
  if (!article) return <NotFound />;

  const isAuthor = article.author === localStorage.getItem("userId");
  const userId = localStorage.getItem("userId");

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 bg-blue-50 min-h-screen animate-fade-in relative">
      <div className="flex flex-col justify-between items-center border-b border-blue-300 dark:border-purple-700 pb-4 mb-6">
        <div className="mt-10">
          <h1 className="text-purple-800 dark:text-purple-300 sm:text-4xl text-2xl font-extrabold text-center mb-6">
            {article.title}
          </h1>
          <div className="flex justify-center">
            <img
              className="max-w-full h-auto rounded-lg shadow-lg"
              src={article.thumbnail}
              alt="Article Thumbnail"
            />
          </div>
        </div>

        <div className="flex mt-5 items-center gap-4">
          <LikeButton
            articleId={article._id}
            initialLikes={article.likes || 0}
            initialLikedState={likedBy?.includes(userId)}
          />
          {isAuthor && (
            <div className="flex gap-4 mt-4 sm:mt-0">
              <button
                onClick={() => window.location.href = `/edit-article/${article._id}`}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Edit Article
              </button>
              <button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Delete Article
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="prose prose-sm sm:prose-lg mx-auto dark:prose-invert">
        {article.content &&
          article.content.split('\n').map((paragraph, index) => (
            <p
              className="text-base mb-4 leading-relaxed text-purple-800 dark:text-purple-200"
              key={index}
            >
              {paragraph}
            </p>
          ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg sm:text-xl font-semibold text-purple-800 dark:text-purple-300 mb-4">
          Comments
        </h2>
        {article.comments && article.comments.length > 0 ? (
          article.comments.map((comment, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              <p className="text-purple-700 dark:text-purple-300 font-semibold">
                {comment.username}
              </p>
              <p className="text-gray-800 dark:text-gray-200">{comment.text}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No comments available.</p>
        )}
      </div>

      <button
        className="fixed bottom-8 right-8 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={() => setIsCommentModalOpen(true)}
      >
        Add Comment
      </button>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteDialogOpen}
        onRequestClose={() => setIsDeleteDialogOpen(false)}
        contentLabel="Delete Confirmation Modal"
        className="bg-white rounded-lg p-6 max-w-md mx-auto mt-24 shadow-lg outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Delete Confirmation</h2>
        <p className="text-gray-600 mb-6">Do you want to delete this article?</p>
        <div className="flex justify-end gap-4">
          <button
            className="bg-gray-700 px-6 py-2 rounded hover:bg-gray-900 transition-colors"
            onClick={() => setIsDeleteDialogOpen(false)}
          >
            No
          </button>
          <button
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
            onClick={handleDelete}
          >
            Yes
          </button>
        </div>
      </Modal>

      {/* Comment Modal */}
      <Modal
        isOpen={isCommentModalOpen}
        onRequestClose={() => setIsCommentModalOpen(false)}
        contentLabel="Add Comment Modal"
        className="bg-white rounded-lg p-6 max-w-md mx-auto mt-24 shadow-lg outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <h2 className="text-lg font-semibold mb-4">Add a Comment</h2>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your comment here..."
          className="w-full border rounded p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={4}
        />
        <div className="flex justify-end gap-4">
          <button
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            onClick={() => setIsCommentModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleAddComment}
          >
            Submit
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Article;