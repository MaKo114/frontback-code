import sql from "../../db";

export class FavoriteService {
  async addFavorite(userId: number, postId: number) {
    return await sql.begin(async (tx: any) => {
      // Check if duplicate favorite exists
      const existing = await tx`
        SELECT favorite_id FROM "favorite"
        WHERE user_id = ${userId} AND post_id = ${postId}
        LIMIT 1
      `;
      if (existing.length > 0) throw new Error("Post already in favorites");

      // Create favorite
      const favorite = await tx`
        INSERT INTO "favorite" (user_id, post_id, created_at)
        VALUES (${userId}, ${postId}, NOW())
        RETURNING *
      `;
      return favorite[0];
    });
  }

  async removeFavorite(userId: number, postId: number) {
    const deleted = await sql`
      DELETE FROM "favorite"
      WHERE user_id = ${userId} AND post_id = ${postId}
      RETURNING *
    `;
    return deleted[0] || null;
  }

  async getUserFavorites(userId: number) {
    return await sql`
      SELECT f.favorite_id, f.created_at, p.*, u.first_name, u.last_name
      FROM "favorite" f
      JOIN "Post" p ON f.post_id = p.post_id
      JOIN "User" u ON p.student_id = u.student_id
      WHERE f.user_id = ${userId}
      ORDER BY f.created_at DESC
    `;
  }

  async checkIsFavorite(userId: number, postId: number) {
    const found = await sql`
      SELECT favorite_id FROM "favorite"
      WHERE user_id = ${userId} AND post_id = ${postId}
      LIMIT 1
    `;
    return found.length > 0;
  }
}

export const favoriteService = new FavoriteService();