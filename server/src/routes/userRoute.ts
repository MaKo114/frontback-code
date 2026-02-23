// routes/userRoute.ts
import { Elysia } from "elysia";
import { createUser, deleteUserById, getUsers, updataUserById } from "../controllers/userController";
import { login, register } from "../controllers/authController";
import { adminCheck } from "../middleware/auth";

export const useRoutes = (app: Elysia) =>
  app
    .get("/users", getUsers, { beforeHandle: adminCheck })
    .post("/create", createUser, { beforeHandle: adminCheck })
    .put("/update/:id", updataUserById, { beforeHandle: adminCheck })
    .delete("/delete/:id", deleteUserById, { beforeHandle: adminCheck })
    .post("/register", register)
    .post("/login", login);

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