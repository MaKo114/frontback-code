import Elysia from "elysia";
import {
  createUser,
  deleteUserById,
  getUsers,
  updataUserById,
} from "../controllers/userController";
import { login, register } from "../controllers/authController";
import { adminCheck } from "../middleware/auth";
import { createPost,getMyPosts } from "../controllers/PostController";

export const useRoutes = new Elysia();

useRoutes.get("/users", getUsers, { beforeHandle: adminCheck });
useRoutes.post("/create", createUser, { beforeHandle: adminCheck });
useRoutes.put("/update/:id", updataUserById, { beforeHandle: adminCheck });
useRoutes.delete("/delete/:id", deleteUserById, { beforeHandle: adminCheck });
useRoutes.post("/register", register);
useRoutes.post("/login", login);
useRoutes.post("/testpost", createPost);
useRoutes.get("/getpost", getMyPosts);
// useRoutes.post("/auth", authCheck);


// ใช้ group สำหรับ middleware ที่ใช้เหมือนกัน
//   .group("/admin", app =>
//     app
//       .onBeforeHandle(adminCheck) // ✅ ใช้กับทุก route ใน group
//       .get("/users", getUsers)
//       .post("/create", createUser)
//       .put("/update/:id", updataUserById)
//       .delete("/delete/:id", deleteUserById)
//   )
//   .post("/register", register)
//   .post("/login", login);