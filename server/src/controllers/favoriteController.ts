import { favoriteService } from "../services/favoriteService";
import { strictBody } from "../utils/validate";

export const addFavorite = async ({ body, user, set }: any) => {
  try {
    if (!user || !user.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const allowed = ["post_id"];
    const required = ["post_id"];
    const v = strictBody(body, allowed, required);
    if (!v.ok) {
      set.status = 400;
      return { error: v.error };
    }

    const { post_id } = body;
    const favorite = await favoriteService.addFavorite(user.student_id, Number(post_id));

    set.status = 201;
    return { message: "Post added to favorites", data: favorite };
  } catch (err: any) {
    set.status = 400;
    return { error: err.message };
  }
};

export const removeFavorite = async ({ params, user, set }: any) => {
  try {
    if (!user || !user.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const post_id = Number(params.post_id);
    if (!post_id || Number.isNaN(post_id)) {
      set.status = 400;
      return { error: "Invalid post_id" };
    }

    const deleted = await favoriteService.removeFavorite(user.student_id, post_id);
    if (!deleted) {
      set.status = 404;
      return { error: "Favorite not found" };
    }

    set.status = 200;
    return { message: "Post removed from favorites", data: deleted };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

export const getMyFavorites = async ({ user, set }: any) => {
  try {
    if (!user || !user.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const favorites = await favoriteService.getUserFavorites(user.student_id);
    return { data: favorites };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

export const checkIsFavorite = async ({ params, user, set }: any) => {
  try {
    if (!user || !user.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const post_id = Number(params.post_id);
    const isFavorite = await favoriteService.checkIsFavorite(user.student_id, post_id);
    return { isFavorite };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};