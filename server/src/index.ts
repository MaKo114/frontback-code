import { Elysia } from "elysia";
import { useRoutes } from "./routes/userRoute";
import { cors } from "@elysiajs/cors";
import jwt from "@elysiajs/jwt";
import { authCheck } from "./middleware/auth";
import { favoriteService } from "./services/favoriteService";
import { reportService } from "./services/reportService";
import { exchangeService } from "./services/exchangeService";

export const app = new Elysia();

favoriteService.setServer(app);
reportService.setServer(app);


app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(
  jwt({
    name: "jwt",
    secret: process.env.SECRET!,
    exp: "7d",
  }),
);

app.derive(authCheck);

app.ws("/ws/chat/:chat_id", {
  // ดึง user จาก middleware/auth ได้เหมือน Route ปกติ
  async open(ws) {
    const { chat_id } = ws.data.params;
    // ให้ User คนนี้ "Subscribe" เข้าห้องแชทตาม chat_id
    ws.subscribe(`room-${chat_id}`);
    // console.log(`User connected to room: ${chat_id}`);
  },
  message(ws, message: any) {
    const { chat_id } = ws.data.params;
    // publish ให้คนอื่น + ส่งกลับหาคนส่งเองด้วย
    ws.publish(`room-${chat_id}`, JSON.stringify(message));
    ws.send(JSON.stringify(message));
  },
  close(ws) {
    const { chat_id } = ws.data.params;
    ws.unsubscribe(`room-${chat_id}`);
  },
});

app.ws("/ws/notifications/:student_id", {
  async open(ws) {
    const { student_id } = ws.data.params;
    ws.subscribe(`user-${student_id}`);
    console.log(`🔔 User ${student_id} is watching notifications`);
  },
  close(ws) {
    const { student_id } = ws.data.params;
    ws.unsubscribe(`user-${student_id}`);
  },
});

app.use(useRoutes);

app.listen(8000);
console.log("Elysia is running at http://localhost:8000");
