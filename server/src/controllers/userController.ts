import sql from "../../db";

// GET /users
export const getUsers = async () => {
  try {
    const users = await sql`
      SELECT student_id, first_name, last_name, email, role, status, created_at, updated_at
      FROM "User"
      ORDER BY student_id ASC
    `;

    return users.map((u) => ({
      student_id: u.student_id,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      role: u.role,
      status: u.status,
      created_at: u.created_at,
      updated_at: u.updated_at,
    }));
  } catch (err) {
    return err;
  }
};

// GET /users/:student_id
export const getUserById = async ({ params, set }: any) => {
  try {
    const student_id = Number(params.student_id);

    if (!student_id || Number.isNaN(student_id)) {
      set.status = 400;
      return { message: "Invalid student_id" };
    }

    const user = await sql`
      SELECT 
        student_id, 
        first_name, 
        last_name, 
        email, 
        role, 
        status, 
        phone_number,
        profile_img,
        cover_img,
        created_at, 
        updated_at
      FROM "User"
      WHERE student_id = ${student_id}
      LIMIT 1
    `;

    if (user.length === 0) {
      set.status = 404;
      return { message: "User not found" };
    }

    set.status = 200;
    return user[0]; // ส่ง Object user ออกไปตรงๆ
  } catch (err) {
    set.status = 500;
    return { message: "Internal Server Error", error: err };
  }
};

// POST /users  (สำหรับ admin สร้าง user หรือใช้ทดสอบ)
// body: { first_name, last_name, email, password, role?, status? }
export const createUser = async ({ body, set }: any) => {
  try {
    const { first_name, last_name, email, password, role, status } = body;

    if (!first_name || !last_name || !email || !password) {
      set.status = 400;
      return "please input first_name, last_name, email, password";
    }

    // เช็คอีเมลซ้ำ
    const found = await sql`
      SELECT student_id FROM "User"
      WHERE email = ${email}
      LIMIT 1
    `;
    if (found.length > 0) {
      set.status = 409;
      return "Email already exists";
    }

    const hashPassword = await Bun.password.hash(password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    const created = await sql`
      INSERT INTO "User"(first_name, last_name, email, password, role, status)
      VALUES (${first_name}, ${last_name}, ${email}, ${hashPassword},
              COALESCE(${role}::"Role", 'USER'::"Role"),
              COALESCE(${status}::"UserStatus", 'ACTIVE'::"UserStatus"))
      RETURNING student_id, first_name, last_name, email, role, status, created_at
    `;

    set.status = 201;
    return { message: "add user successfully", user: created[0] };
  } catch (err) {
    set.status = 500;
    return err;
  }
};

// PUT /users/:student_id
// body: { first_name?, last_name?, email?, role?, status? }
export const updataUserById = async ({ params, body, set }: any) => {
  try {
    const student_id = Number(params.student_id ?? params.id); // กันพลาดเผื่อ route เก่าใช้ id

    if (!student_id || Number.isNaN(student_id)) {
      set.status = 400;
      return "invalid student_id";
    }

    const { first_name, last_name, email, role, status } = body;

    const updated = await sql`
      UPDATE "User"
      SET
        first_name = COALESCE(${first_name}, first_name),
        last_name  = COALESCE(${last_name}, last_name),
        email      = COALESCE(${email}, email),
        role       = COALESCE(${role}::"Role", role),
        status     = COALESCE(${status}::"UserStatus", status),
        updated_at = now()
      WHERE student_id = ${student_id}
      RETURNING student_id, first_name, last_name, email, role, status, updated_at
    `;

    if (updated.length === 0) {
      set.status = 404;
      return "User not found";
    }

    set.status = 200;
    return { message: "Update success!!!", user: updated[0] };
  } catch (err) {
    // email unique อาจชน
    set.status = 500;
    return err;
  }
};

// DELETE /users/:student_id
export const deleteUserById = async ({ params, set }: any) => {
  try {
    const student_id = Number(params.student_id ?? params.id);

    if (!student_id || Number.isNaN(student_id)) {
      set.status = 400;
      return "invalid student_id";
    }

    const deleted = await sql`
      DELETE FROM "User"
      WHERE student_id = ${student_id}
      RETURNING student_id
    `;

    if (deleted.length === 0) {
      set.status = 404;
      return "User not found";
    }

    set.status = 200;
    return "Delete success!!!";
  } catch (err) {
    set.status = 500;
    return err;
  }
};

// ดึงข้อมูลตัวเอง (me)
// ดึงข้อมูลตัวเอง (me) - ใช้ Raw SQL
export const getMe = async ({ user, set }: any) => {
  try {
    // user.student_id ได้มาจาก Middleware (ถอดจาก Token)
    const student_id = user?.student_id;

    if (!student_id) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const currentUser = await sql`
      SELECT 
        student_id, 
        first_name, 
        last_name, 
        email, 
        phone_number, 
        profile_img, 
        profile_public_id, 
        cover_img,
        cover_public_id
      FROM "User"
      WHERE student_id = ${student_id}
      LIMIT 1
    `;

    if (currentUser.length === 0) {
      set.status = 404;
      return { message: "ไม่พบผู้ใช้งาน" };
    }

    set.status = 200;
    return currentUser[0];
  } catch (err) {
    set.status = 500;
    return { message: "Server Error", error: err };
  }
};

// อัปเดตโปรไฟล์ - ใช้ Raw SQL
export const updateProfile = async ({ body, user, set }: any) => {
  try {
    const student_id = user?.student_id;
    if (!student_id) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const {
      first_name,
      last_name,
      phone_number,
      profile_img,
      cover_img,
      profile_public_id,
      cover_public_id,
    } = body;

    const updated = await sql`
      UPDATE "User"
      SET
        first_name = COALESCE(${first_name}, first_name),
        last_name  = COALESCE(${last_name}, last_name),
        phone_number = COALESCE(${phone_number}, phone_number),
        profile_img  = COALESCE(${profile_img}, profile_img),
        cover_img    = COALESCE(${cover_img}, cover_img),
        profile_public_id = COALESCE(${profile_public_id}, profile_public_id),
        cover_public_id   = COALESCE(${cover_public_id}, cover_public_id),
        updated_at = now()
      WHERE student_id = ${student_id}
      RETURNING student_id, first_name, last_name, updated_at
    `;

    if (updated.length === 0) {
      set.status = 404;
      return { message: "ไม่พบผู้ใช้งานเพื่ออัปเดต" };
    }

    set.status = 200;
    return { message: "อัปเดตโปรไฟล์สำเร็จ", user: updated[0] };
  } catch (err) {
    console.error(err);
    set.status = 500;
    return { message: "ไม่สามารถอัปเดตได้", error: err };
  }
};
