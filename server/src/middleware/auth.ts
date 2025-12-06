import sql from "../../db";

export const authCheck = async ({ headers, jwt, set }: any) => {
  try {
    const headerToken = headers.authorization;

    if (!headerToken || !headerToken.startsWith("Bearer ")) {
      // เช็คว่า user ได้ส่ง token มาไหม หรือ ส่งมาแต่ไม่ได้เริ่มด้วย Bearer ให้ return ออกไป
      set.status = 401;
      return { user: null, error: "No or Invalid Token" };
    }

    const token = headers.authorization.split(" ")[1]; //
    const decode = await jwt.verify(token);

    if (!decode) {
      set.status = 401;
      return { user: null, error: "Invalid Token" };
    }

    const user = await sql`
    select email from "User"
    where email = ${decode.email}
    `;

    if (user.length === 0) {
      set.status = 403;
      return { user: null, error: "This account cannot access" };
    }

    return { user: decode };
  } catch (err) {
    console.error("authCheck error:", err);
    set.status = 500;
    return { user: null, error: "Authentication failed" };
  }
};


export const adminCheck = async ({user, set}:any) => {
    if (!user) {
        set.status = 401
        return `Unauthorized`
    }
    if (user.role !== "ADMIN") {
        set.status = 403
        return `Forbidden`
    }
}



// const check = ({ user, set }: any) => {
//   if (!user) {
//     set.status = 401;
//     return "Unauthorized";
//   }
//   if (user.role !== "ADMIN") {
//     set.status = 403;
//     return "Forbidden";
//   }
// };