import sql from "../../db";

export const register = async ({ body, set }: any) => {
  try {
    const { email, name, password } = body;

    if (!email || !password) {
      set.status = 404;
      return "please input email and password";
    }

    const hashPassword = await Bun.password.hash(password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    const foundEmail = await sql`
    SELECT email FROM "User"
    WHERE email = ${email}
    `;

    if (foundEmail.length > 0) {
      set.status = 401;
      return `${email} is already exist.`;
    }

    await sql`
    INSERT INTO "User"(email, name, password)
    VALUES (${email}, ${name}, ${hashPassword})
    `;
    set.status = 200
    return `Create Account successfully!!`;
  } catch (err) {
    console.log(err);
  }
};

export const login = async ({ body, set, jwt }: any) => {
  try {
    const { email, password } = body; // รับ email password จากหน้าบ้าน

    if (!email || !password) {
      // เช็คว่าได้ใส่ email หรือ password ไหม ถ้าไม่ได้ใส่มาให้ return ออกไปเลย
      set.status = 400;
      return `please input your email and password`;
    }

    const user = await sql` 
    SELECT id, email, password, role FROM "User"
    WHERE email = ${email}
    `; // หา user ใน DB มันจะ return เป็น array

    if (user.length === 0) {
      // ถ้าเช็คแล้ว array มีความยาวเท่า 0 return ออกไปเลย
      set.status = 404;
      return `User not found`;
    }

    const isMatch = await Bun.password.verify(password, user[0].password); // เช็คว่า password ที่กรอกเข้ามากับ password ที่เข้ารหัสแล้ว ตรงกันไหม

    if (!isMatch) {
      // ถ้า isMatch เป็น false ให้ return ออกไปเลย
      set.status = 401;
      return `password not match`;
    }

    const payLoad = {
      // สร้าง payload มา
      id: user[0].id,
      email: user[0].email,
      role: user[0].role, // role ต้องมาจาก db อันนี้ mockup ไว้
    };

    const token = await jwt.sign(payLoad); // สร้าง token

    set.status = 200;
    return { payload: payLoad, token: token }; // return payload กับ token ออกไปให้ frontend ใช้ เพื่อเอาไว้เช็ค middleware ได้ จะได้รู้ว่าใครมีสิทธิ์ เป็น user หรือ admin
  } catch (err) {
    console.error(err);
    set.status = 500; // Internal Server Error
    return "Error logging in.";
  }
};
