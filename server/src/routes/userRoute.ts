import Elysia from "elysia";
import { createUser, deleteUserById, getUsers, updataUserById } from "../controllers/userController";



export const useRoutes = new Elysia()


useRoutes.get("/users", getUsers);
useRoutes.post('/create',createUser)
useRoutes.put('/update/:id',updataUserById)
useRoutes.delete('/delete/:id',deleteUserById)
