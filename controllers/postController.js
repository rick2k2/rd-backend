const Post = require("../models/postModel");
const asyncHandler = require("express-async-handler");

// Create Post
exports.createPost = asyncHandler(async (req, res) => {
  const { title, content, image } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  const post = await Post.create({ title, content, image });
  res.status(201).json({ success: true, post });
});

// Get All Posts
exports.getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// Delete Post
exports.deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Post.findByIdAndDelete(id);
  res.json({ success: true, message: "Post deleted" });
});

// Update Post
exports.updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, image } = req.body;

  const post = await Post.findById(id);
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  post.title = title || post.title;
  post.content = content || post.content;
  post.image = image || post.image;

  const updatedPost = await post.save();
  res.json({ success: true, post: updatedPost });
});
