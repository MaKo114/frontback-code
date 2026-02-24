import sql from "../../db";
import { strictBody } from "../utils/validate"; // ปรับ path ให้ตรง

export const getCategories = async ({ set }: any) => {
  try {
    const rows = await sql`
      SELECT category_id, category_name, created_at, updated_at
      FROM "Category"
      ORDER BY category_id ASC
    `;
    return { data: rows };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

// POST /categories (admin)
export const createCategory = async ({ body, user, set }: any) => {
  try {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    if (user.role !== "ADMIN") {
      set.status = 403;
      return { error: "Forbidden" };
    }

    const allowed = ["category_name"];
    const required = ["category_name"];
    const v = strictBody(body, allowed, required);
    if (!v.ok) {
      set.status = 400;
      return { error: v.error };
    }

    const { category_name } = body;

    const created = await sql`
      INSERT INTO "Category"(category_name, created_at, updated_at)
      VALUES (${category_name}, NOW(), NOW())
      RETURNING category_id, category_name, created_at, updated_at
    `;

    set.status = 201;
    return { message: "Category created", data: created };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};