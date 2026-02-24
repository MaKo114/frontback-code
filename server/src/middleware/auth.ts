import sql from "../../db";

export const authCheck = async (ctx: any) => {
  try {
    const { headers, jwt, set } = ctx;
    const auth = headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      set.status = 401;
      return "No or Invalid Token";
    }

    const token = auth.split(" ")[1];
    const decode = await jwt.verify(token);

    if (!decode || !decode.email) {
      set.status = 401;
      return "Invalid Token";
    }

    const rows = await sql`
      SELECT student_id, email, role, status, first_name, last_name
      FROM "User"
      WHERE email = ${decode.email}
      LIMIT 1
    `;

    if (rows.length === 0) {
      set.status = 403;
      return "This account cannot access";
    }

    const dbUser = rows[0];

    if (dbUser.status !== "ACTIVE") {
      set.status = 403;
      return `Account is ${dbUser.status}`;
    }

    // ✅ สำคัญ: set ลง ctx
    ctx.user = {
      student_id: dbUser.student_id,
      email: dbUser.email,
      role: dbUser.role,
      first_name: dbUser.first_name,
      last_name: dbUser.last_name,
    };

    return; // ผ่าน
  } catch (err) {
    console.error("authCheck error:", err);
    ctx.set.status = 500;
    return "Authentication failed";
  }
};

export const adminCheck = async ({ user, set }: any) => {
  if (!user) {
    set.status = 401;
    return "Unauthorized";
  }
  if (user.role !== "ADMIN") {
    set.status = 403;
    return "Forbidden";
  }
};