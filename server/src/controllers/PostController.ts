import sql from "../../db";

export const createPost = async ({ body, user, set }: any) => {
  try {
    if (!user || !user.id) {
      set.status = 401;
      return { error: "Please login first" };
    }
    const {category_id, title, description } = body;
    // if (!category_id || !title) {
    //   set.status = 400;
    //   return { error: "กรุณาใส่ student_id, category_id และ title ให้ครบ" };
    // }

    const result = await sql`
      INSERT INTO "Posttest" (student_id, category_id, title, description, status, created_at,updated_at)
      VALUES (
        ${user.id}, 
        ${category_id}, 
        ${title}, 
        ${description || null}, 
        'OPEN',
        NOW(),
        NOW()
      )
      RETURNING *;
    `;

    return {
      message: "Test Post created successfully!",
      data: result[0]
    };

  } catch (err: any) {
    console.error("Test createPost error:", err);
    set.status = 500;
    // ส่ง error message กลับไปดูว่าติดเรื่อง Foreign Key หรือเปล่า
    return { error: err.message }; 
  }
};

export const getMyPosts = async ({ user, set }: any) => {
  try {
    // 1. เช็คว่า Middleware ส่ง user มาให้ไหม
    if (!user || !user.id) {
      set.status = 401;
      return { error: "กรุณา Login ก่อน" };
    }

    // 2. Query ดึงเฉพาะโพสต์ที่ student_id ตรงกับ user ที่ Login
    const posts = await sql`
    SELECT 
      post_id,
      title,
      -- ใช้ TO_CHAR เพื่อล็อก format เป็น String และระบุ Timezone
      TO_CHAR(
        created_at AT TIME ZONE 'UTC' AT TIME ZONE 'asia/bangkok', 
        'DD/MM/YYYY HH24:MI:SS'
      ) AS created_at_th
    FROM "Posttest"
    WHERE student_id = ${user.id}
    ORDER BY created_at DESC;
  `;

    return { data: posts };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};
