import Elysia from "elysia";
import {
  createUser,
  deleteUserById,
  getUsers,
  updataUserById,
} from "../controllers/userController";
import { login, register, requireAdmin, requireUser } from "../controllers/authController";
import { authCheck, adminCheck } from "../middleware/auth";
import { createPost, getMyPosts,editPost,deletePost,changePostStatus } from "../controllers/PostController";
import { getCategories, createCategory } from "../controllers/categoryController";
import {createOrGetChatRoom,getMyChatRooms,getMessagesByRoom,sendMessage,} from "../controllers/chatController";
export const useRoutes = new Elysia();

useRoutes.post("/chat/room", createOrGetChatRoom, { beforeHandle: authCheck });
useRoutes.get("/chat/rooms", getMyChatRooms, { beforeHandle: authCheck });
useRoutes.get("/chat/rooms/:chat_id/messages", getMessagesByRoom, { beforeHandle: authCheck });
useRoutes.post("/chat/rooms/:chat_id/messages", sendMessage, { beforeHandle: authCheck });

useRoutes.post("/register", register);
useRoutes.post("/login", login);
useRoutes.post("/require-user", requireUser, { beforeHandle: authCheck });
useRoutes.post("/require-admin", requireAdmin, { beforeHandle: [authCheck, adminCheck] });

useRoutes.post("/testpost", createPost, { beforeHandle: authCheck });
useRoutes.get("/getpost", getMyPosts, { beforeHandle: authCheck });
useRoutes.put("/post/:post_id", editPost, { beforeHandle: authCheck });
useRoutes.delete("/post/:post_id", deletePost, { beforeHandle: authCheck });
useRoutes.patch("/post/:post_id", changePostStatus, { beforeHandle: authCheck });

useRoutes.get("/categories", getCategories);
useRoutes.post("/categories", createCategory, { beforeHandle: [authCheck, adminCheck] });

useRoutes.get("/users", getUsers, { beforeHandle: [authCheck, adminCheck] });
useRoutes.post("/create", createUser, { beforeHandle: [authCheck, adminCheck] });
useRoutes.put("/update/:id", updataUserById, { beforeHandle: [authCheck, adminCheck] });
useRoutes.delete("/delete/:id", deleteUserById, { beforeHandle: [authCheck, adminCheck] });