import sql from "../../db";

export class PostService {
  async deletePost(postId: number, requesterId: number, isAdmin: boolean) {
    return await sql.begin(async (tx: any) => {
      // 1) Find post and check owner
      const found = await tx`
        SELECT post_id, student_id
        FROM "Post"
        WHERE post_id = ${postId}
        LIMIT 1
      `;

      if (found.length === 0) throw new Error("Post not found");

      const ownerId = found[0].student_id;
      if (!isAdmin && ownerId !== requesterId) {
        throw new Error("Forbidden: You are not the owner of this post");
      }

      // 2) Delete related data in correct order
      
      // Delete notifications related to the post
      // We need to find notification references. Since reference_id is String (UUID),
      // we need to be careful with types if postId is Int.
      // But we also have exchanges and reports that might have notifications.
      
      // Let's get related exchange IDs and report IDs
      const exchanges = await tx`SELECT exchange_id FROM "exchanges" WHERE post_id = ${postId}`;
      const reports = await tx`SELECT report_id FROM "post_reports" WHERE post_id = ${postId}`;
      
      const exchangeIds = exchanges.map((e: any) => e.exchange_id);
      const reportIds = reports.map((r: any) => r.report_id);

      // Delete notifications referencing exchanges and reports of this post
      if (exchangeIds.length > 0) {
        await tx`DELETE FROM "notifications" WHERE reference_id = ANY(${exchangeIds})`;
      }
      if (reportIds.length > 0) {
        await tx`DELETE FROM "notifications" WHERE reference_id = ANY(${reportIds})`;
      }
      
      // Also delete any notifications that might directly reference the post_id
      // (though our current notification system uses reference_id as UUID of exchange/report)
      await tx`DELETE FROM "notifications" WHERE reference_id = ${postId.toString()}`;

      // Delete reports
      await tx`DELETE FROM "post_reports" WHERE post_id = ${postId}`;

      // Delete exchanges
      await tx`DELETE FROM "exchanges" WHERE post_id = ${postId}`;

      // Delete favorites
      await tx`DELETE FROM "favorites" WHERE post_id = ${postId}`;

      // Delete chat rooms and messages
      const chatRooms = await tx`SELECT chat_id FROM "chat_room" WHERE post_id = ${postId}`;
      const chatIds = chatRooms.map((c: any) => c.chat_id);
      
      if (chatIds.length > 0) {
        await tx`DELETE FROM "message" WHERE chat_id IN (${chatIds})`;
        await tx`DELETE FROM "chat_room" WHERE post_id = ${postId}`;
      }

      // Delete images and categories
      await tx`DELETE FROM "post_image" WHERE post_id = ${postId}`;
      await tx`DELETE FROM "post_category" WHERE post_id = ${postId}`;

      // 3) Delete the post itself
      const deleted = await tx`
        DELETE FROM "Post"
        WHERE post_id = ${postId}
        RETURNING *
      `;

      return deleted[0] || null;
    });
  }
}

export const postService = new PostService();
