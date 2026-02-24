import Elysia from "elysia";
import {
  createUser,
  deleteUserById,
  getUsers,
  updataUserById,
} from "../controllers/userController";
import { login, register } from "../controllers/authController";
import { authCheck, adminCheck } from "../middleware/auth";
import { createPost, getMyPosts,editPost,deletePost } from "../controllers/PostController";
import { getCategories, createCategory } from "../controllers/categoryController"; // ถ้าคุณเพิ่ม

export const useRoutes = new Elysia();

// ✅ Public
useRoutes.post("/register", register);
useRoutes.post("/login", login);

// ✅ Authenticated (ต้องมี token)
useRoutes.post("/testpost", createPost, { beforeHandle: authCheck });
useRoutes.get("/getpost", getMyPosts, { beforeHandle: authCheck });
useRoutes.put("/post/:post_id", editPost, { beforeHandle: authCheck });
useRoutes.delete("/post/:post_id", deletePost, { beforeHandle: authCheck });

// ✅ Categories
useRoutes.get("/categories", getCategories);
useRoutes.post("/categories", createCategory, { beforeHandle: [authCheck, adminCheck] });

// ✅ Admin routes (ต้อง auth ก่อน แล้วค่อยเช็ค admin)
useRoutes.get("/users", getUsers, { beforeHandle: [authCheck, adminCheck] });
useRoutes.post("/create", createUser, { beforeHandle: [authCheck, adminCheck] });
useRoutes.put("/update/:id", updataUserById, { beforeHandle: [authCheck, adminCheck] });
useRoutes.delete("/delete/:id", deleteUserById, { beforeHandle: [authCheck, adminCheck] });