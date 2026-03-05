import Elysia from "elysia";
import {
  createUser,
  deleteUserById,
  getUserById,
  getUsers,
  updataUserById,
} from "../controllers/userController";
import { login, register, requireAdmin, requireUser } from "../controllers/authController";
import { authCheck, adminCheck } from "../middleware/auth";
import { createPost, getMyPosts, editPost, deletePost,changePostStatus, getPostByCategory, getAllPost, createImage, deleteImage } from "../controllers/PostController";
import { getCategories, createCategory, deleteCategory, updateCategory } from "../controllers/categoryController";
import {
  blockUser,
  unblockUser,
  adminDeletePost,
  getAllUsers as getAllUsersAdmin,
  getUserDetails,
  getAllListings,
  getAllReports,
  getReportDetails,
  resolveReport,
} from "../controllers/adminController";
import {search} from "../controllers/searchController";
import { createReport } from "../controllers/reportController";
import { getNotifications, markAllAsRead, markAsRead } from "../controllers/notificationController";
import {createOrGetChatRoom,getMyChatRooms,getMessagesByRoom,sendMessage,} from "../controllers/chatController";
import { addFavorite, checkIsFavorite, getMyFavorites, removeFavorite,getPostFavoriteCount } from "../controllers/favoriteController";
import {
  createExchangeRequest,
  getMyReceivedRequests,
  getMySentRequests,
  updateExchangeStatus,
  ownerConfirmExchange,
  requesterConfirmExchange,
} from "../controllers/exchangeController";
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} from "../controllers/commentController";
export const useRoutes = new Elysia();


// chat
useRoutes.post("/chat/room", createOrGetChatRoom, { beforeHandle: authCheck });
useRoutes.get("/chat/rooms", getMyChatRooms, { beforeHandle: authCheck });
useRoutes.get("/chat/rooms/:chat_id/messages", getMessagesByRoom, { beforeHandle: authCheck });
useRoutes.post("/chat/rooms/:chat_id/messages", sendMessage, { beforeHandle: authCheck });

// auth
useRoutes.post("/register", register);
useRoutes.post("/login", login);
useRoutes.post("/require-user", requireUser, { beforeHandle: authCheck });
useRoutes.post("/require-admin", requireAdmin, { beforeHandle: [authCheck, adminCheck] });

// post
useRoutes.post("/create-post", createPost, { beforeHandle: authCheck });
useRoutes.get("/getpost", getMyPosts, { beforeHandle: authCheck });
useRoutes.get("/get-all-post", getAllPost)

// search & upload
useRoutes.post("/search", search);
useRoutes.post("/upload-image", createImage)
useRoutes.delete("/deleted-image", deleteImage)

// post
useRoutes.get("/post-by-category/:category_id", getPostByCategory)
useRoutes.put("/post/:post_id", editPost, { beforeHandle: authCheck });
useRoutes.delete("/post/:post_id", deletePost, { beforeHandle: authCheck });
useRoutes.patch("/post/:post_id", changePostStatus, { beforeHandle: authCheck });

// category
useRoutes.get("/categories", getCategories);
useRoutes.post("/categories", createCategory, { beforeHandle: [authCheck, adminCheck] });
useRoutes.put("/categories/:category_id", updateCategory, { beforeHandle: [authCheck, adminCheck] });
useRoutes.delete("/categories/:category_id", deleteCategory, { beforeHandle: [authCheck, adminCheck] });

// user
useRoutes.get("/users", getUsers, { beforeHandle: [authCheck, adminCheck] });
useRoutes.get("/user/:student_id", getUserById, { beforeHandle: authCheck });
useRoutes.post("/create", createUser, { beforeHandle: [authCheck, adminCheck] });
useRoutes.put("/update/:id", updataUserById, { beforeHandle: [authCheck, adminCheck] });
useRoutes.delete("/delete/:id", deleteUserById, { beforeHandle: [authCheck, adminCheck] });

// user create report
useRoutes.post("/reports", createReport, { beforeHandle: authCheck });

// notification
useRoutes.get("/notifications", getNotifications, { beforeHandle: authCheck });
useRoutes.put("/notifications/:notification_id/read", markAsRead, { beforeHandle: authCheck });
useRoutes.put("/notifications/read-all", markAllAsRead, { beforeHandle: authCheck });

// Admin routes
useRoutes.get("/admin/users", getAllUsersAdmin, { beforeHandle: [authCheck, adminCheck] });
useRoutes.get("/admin/users/:student_id", getUserDetails, { beforeHandle: [authCheck, adminCheck] });

// admin block
useRoutes.put("/admin/block-user/:student_id", blockUser, { beforeHandle: [authCheck, adminCheck] });
useRoutes.put("/admin/unblock-user/:student_id", unblockUser, { beforeHandle: [authCheck, adminCheck] });

useRoutes.get("/admin/listings", getAllListings, { beforeHandle: [authCheck, adminCheck] });
useRoutes.delete("/admin/delete-post/:post_id", adminDeletePost, { beforeHandle: [authCheck, adminCheck] });

// admin and report
useRoutes.get("/admin/reports", getAllReports, { beforeHandle: [authCheck, adminCheck] });
useRoutes.get("/admin/reports/:report_id", getReportDetails, { beforeHandle: [authCheck, adminCheck] });
useRoutes.delete("/admin/reports/:report_id", resolveReport, { beforeHandle: [authCheck, adminCheck] });

// favorite
useRoutes.post("/favorites", addFavorite, { beforeHandle: authCheck });
useRoutes.delete("/favorites/:post_id", removeFavorite, { beforeHandle: authCheck });
useRoutes.get("/favorites", getMyFavorites, { beforeHandle: authCheck });
useRoutes.get("/favorites/check/:post_id", checkIsFavorite, { beforeHandle: authCheck });
useRoutes.get("/posts/:post_id/favorites/count", getPostFavoriteCount);

// exchange
useRoutes.post("/exchanges/request", createExchangeRequest, { beforeHandle: authCheck });
useRoutes.put("/exchanges/:exchange_id/status", updateExchangeStatus, { beforeHandle: authCheck });
useRoutes.get("/exchanges/sent", getMySentRequests, { beforeHandle: authCheck });
useRoutes.get("/exchanges/received", getMyReceivedRequests, { beforeHandle: authCheck });
useRoutes.post("/exchanges/:exchange_id/owner-confirm", ownerConfirmExchange, { beforeHandle: authCheck });
useRoutes.post("/exchanges/:exchange_id/requester-confirm", requesterConfirmExchange, { beforeHandle: authCheck });

// comments ของ post
useRoutes.get("/posts/:post_id/comments", getCommentsByPost);
useRoutes.post("/posts/:post_id/comments", createComment, { beforeHandle: authCheck });

// แก้/ลบ comment รายตัว
useRoutes.put("/comments/:comment_id", updateComment, { beforeHandle: authCheck });
useRoutes.delete("/comments/:comment_id", deleteComment, { beforeHandle: authCheck });
