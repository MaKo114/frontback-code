import { Elysia } from "elysia";
import { useRoutes } from "./routes/userRoute";
import { cors } from "@elysiajs/cors";

const app = new Elysia();

app.use(useRoutes)

app.use(
    cors({
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    })
  )


app.listen(8000);
console.log("Elysia is running at http://localhost:8000");
