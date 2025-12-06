import { Elysia } from "elysia";
import { useRoutes } from "./routes/userRoute";
import { cors } from "@elysiajs/cors";
import jwt from "@elysiajs/jwt";
import { authCheck } from "./middleware/auth";

const app = new Elysia();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(
  jwt({
    name: "jwt",
    secret: process.env.SECRET!,
    exp: "7d",
  })
);

app.derive(authCheck);
app.use(useRoutes);

app.listen(8000);
console.log("Elysia is running at http://localhost:8000");
