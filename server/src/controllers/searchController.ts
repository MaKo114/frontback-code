import sql from "../../db";

export const search = async ({ body, set }: any) => {
  try {
    const { title } = body;

    if (!title || typeof title !== "string") {
      set.status = 400;
      return { error: "title is required" };
    }

    const rows = await sql`
      SELECT *
      FROM "Post"
      WHERE title ILIKE ${"%" + title + "%"}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    set.status = 200;
    return { result: rows };
  } catch (err) {
    console.error(err);
    set.status = 500;
    return { error: "search failed" };
  }
};