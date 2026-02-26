import Elysia from "elysia";
import {
  createUser,
  deleteUserById,
  getUsers,
  updataUserById,
} from "../controllers/userController";
import { login, register, requireAdmin, requireUser } from "../controllers/authController";
import { authCheck, adminCheck } from "../middleware/auth";
import { createPost, getMyPosts, editPost, deletePost } from "../controllers/PostController";
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

export const useRoutes = new Elysia();

useRoutes.post("/register", register);
useRoutes.post("/login", login);
useRoutes.post("/require-user", requireUser, { beforeHandle: authCheck });
useRoutes.post("/require-admin", requireAdmin, { beforeHandle: [authCheck, adminCheck] });

useRoutes.post("/testpost", createPost, { beforeHandle: authCheck });
useRoutes.get("/getpost", getMyPosts, { beforeHandle: authCheck });
useRoutes.put("/post/:post_id", editPost, { beforeHandle: authCheck });
useRoutes.delete("/post/:post_id", deletePost, { beforeHandle: authCheck });

useRoutes.get("/categories", getCategories);
useRoutes.post("/categories", createCategory, { beforeHandle: [authCheck, adminCheck] });
useRoutes.put("/categories/:category_id", updateCategory, { beforeHandle: [authCheck, adminCheck] });
useRoutes.delete("/categories/:category_id", deleteCategory, { beforeHandle: [authCheck, adminCheck] });

useRoutes.get("/users", getUsers, { beforeHandle: [authCheck, adminCheck] });
useRoutes.post("/create", createUser, { beforeHandle: [authCheck, adminCheck] });
useRoutes.put("/update/:id", updataUserById, { beforeHandle: [authCheck, adminCheck] });
useRoutes.delete("/delete/:id", deleteUserById, { beforeHandle: [authCheck, adminCheck] });

// Admin routes
useRoutes.get("/admin/users", getAllUsersAdmin, { beforeHandle: [authCheck, adminCheck] });
useRoutes.get("/admin/users/:student_id", getUserDetails, { beforeHandle: [authCheck, adminCheck] });
useRoutes.put("/admin/block-user/:student_id", blockUser, { beforeHandle: [authCheck, adminCheck] });
useRoutes.put("/admin/unblock-user/:student_id", unblockUser, { beforeHandle: [authCheck, adminCheck] });

useRoutes.get("/admin/listings", getAllListings, { beforeHandle: [authCheck, adminCheck] });
useRoutes.delete("/admin/delete-post/:post_id", adminDeletePost, { beforeHandle: [authCheck, adminCheck] });

useRoutes.get("/admin/reports", getAllReports, { beforeHandle: [authCheck, adminCheck] });
useRoutes.get("/admin/reports/:report_id", getReportDetails, { beforeHandle: [authCheck, adminCheck] });
useRoutes.delete("/admin/reports/:report_id", resolveReport, { beforeHandle: [authCheck, adminCheck] });