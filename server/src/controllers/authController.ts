import sql from "../../db";
import { strictBody } from "../utils/validate";
export const register = async ({ body, set }: any) => {
  try {
    const allowed = ["email", "first_name", "last_name", "password"];
    const required = ["email", "first_name", "last_name", "password"];

    const v = strictBody(body, allowed, required);
    if (!v.ok) {
      set.status = 400;
      return v.error;
    }

    const { email, first_name, last_name, password } = body;

    const foundEmail = await sql`
      SELECT student_id FROM "User"
      WHERE email = ${email}
      LIMIT 1
    `;
    if (foundEmail.length > 0) {
      set.status = 409;
      return `${email} is already exist.`;
    }

    const hashPassword = await Bun.password.hash(password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    await sql`
      INSERT INTO "User"(email, first_name, last_name, password)
      VALUES (${email}, ${first_name}, ${last_name}, ${hashPassword})
    `;

    set.status = 201;
    return `Create Account successfully!!`;
  } catch (err) {
    console.log(err);
    set.status = 500;
    return "Error registering.";
  }
};

export const login = async ({ body, set, jwt }: any) => {
  try {
    const allowed = ["email", "password"];
    const required = ["email", "password"];

    const v = strictBody(body, allowed, required);
    if (!v.ok) {
      set.status = 400;
      return v.error;
    }

    const { email, password } = body;

    const user = await sql`
      SELECT student_id, email, password, role, status
      FROM "User"
      WHERE email = ${email}
      LIMIT 1
    `;

    if (user.length === 0) {
      set.status = 404;
      return `User not found`;
    }

    if (user[0].status !== "ACTIVE") {
      set.status = 403;
      return `Account is ${user[0].status}`;
    }

    const isMatch = await Bun.password.verify(password, user[0].password);
    if (!isMatch) {
      set.status = 401;
      return `password not match`;
    }
    
    const payLoad = {
      student_id: user[0].student_id,
      email: user[0].email,
      role: user[0].role,
    };

    const token = await jwt.sign(payLoad);

    set.status = 200;
    return { payload: payLoad, token };
  } catch (err) {
    console.error(err);
    set.status = 500;
    return "Error logging in.";
  }
};

export const requireUser = async ({ jwt, set }: any) => {
  try {
    if (!jwt) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const user = await sql`
      SELECT student_id, first_name, last_name, email, role
      FROM "User"
      WHERE student_id = ${jwt.student_id}
      LIMIT 1
    `;

    if (user.length === 0) {
      set.status = 404;
      return { message: "User not found" };
    }

    set.status = 200;
    return user[0];
  } catch (err) {
    console.log(err);
    set.status = 500;
    return { message: "Something went wrong" };
  }
};

export const requireAdmin = async ({ user, set }: any) => {
  if (!user) {
    set.status = 401;
    return { message: "Unauthorized" };
  }

  if (user.role !== "ADMIN") {
    set.status = 403;
    return { message: "Forbidden" };
  }
};
