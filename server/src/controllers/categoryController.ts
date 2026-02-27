
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

// DELETE /categories/:category_id (admin only)
export const deleteCategory = async ({ params, user, set }: any) => {
  try {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    if (user.role !== "ADMIN") {
      set.status = 403;
      return { error: "Forbidden: Admin only" };
    }

    const category_id = Number(params.category_id);
    if (!category_id || Number.isNaN(category_id)) {
      set.status = 400;
      return { error: "Invalid category_id" };
    }

    // Check if category exists
    const found = await sql`
      SELECT category_id, category_name
      FROM "Category"
      WHERE category_id = ${category_id}
      LIMIT 1
    `;

    if (found.length === 0) {
      set.status = 404;
      return { error: "Category not found" };
    }

    // Check if category is being used by any posts
    const postsUsingCategory = await sql`
      SELECT post_id FROM "post_category"
      WHERE category_id = ${category_id}
      LIMIT 1
    `;

    if (postsUsingCategory.length > 0) {
      set.status = 409;
      return { error: "Cannot delete category that is being used by posts" };
    }

    // Delete category
    const deleted = await sql`
      DELETE FROM "Category"
      WHERE category_id = ${category_id}
      RETURNING category_id, category_name
    `;

    set.status = 200;
    return { message: "Category deleted successfully", category: deleted[0] };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

// PUT /categories/:category_id (admin only) - update category
export const updateCategory = async ({ params, body, user, set }: any) => {
  try {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    if (user.role !== "ADMIN") {
      set.status = 403;
      return { error: "Forbidden: Admin only" };
    }

    const category_id = Number(params.category_id);
    if (!category_id || Number.isNaN(category_id)) {
      set.status = 400;
      return { error: "Invalid category_id" };
    }

    const allowed = ["category_name"];
    const required = ["category_name"];
    const v = strictBody(body, allowed, required);
    if (!v.ok) {
      set.status = 400;
      return { error: v.error };
    }

    const { category_name } = body;

    // Check if category exists
    const found = await sql`
      SELECT category_id FROM "Category"
      WHERE category_id = ${category_id}
      LIMIT 1
    `;

    if (found.length === 0) {
      set.status = 404;
      return { error: "Category not found" };
    }

    // Update category
    const updated = await sql`
      UPDATE "Category"
      SET category_name = ${category_name}, updated_at = NOW()
      WHERE category_id = ${category_id}
      RETURNING category_id, category_name, created_at, updated_at
    `;

    set.status = 200;
    return { message: "Category updated successfully", data: updated[0] };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};