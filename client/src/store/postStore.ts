import { create, type StateCreator } from "zustand";
import {
  getAllPost,
  getPostByCategory,
  deletePostApi,
  getMyPost,
} from "@/api/post";
import useTestStore from "./tokStore";

/* ================= TYPES ================= */

interface Image {
  image_id: number;
  image_url: string;
}

interface Post {
  post_id: number;
  title: string;
  description: string;
  first_name: string;
  last_name: string;
  created_at_th: string;
  category_id: number;
  category_name: string;
  images: Image[];
}

interface PostState {
  posts: Post[];
  myPosts: Post[];
  fetchPosts: () => Promise<void>;
  fetchPostByCategory: (category_id: number) => Promise<void>;
  deletePost: (post_id: number) => Promise<boolean>;
  addPost: (post: Post) => void;
  clearPosts: () => void;
  fetchMyPosts: () => Promise<void>;
}

/* ================= STORE ================= */

const postStore: StateCreator<PostState> = (set) => ({
  posts: [],
  myPosts: [],

  /* ===== FETCH ALL ===== */
  fetchPosts: async () => {
    try {
      const token = useTestStore.getState().token;
      const res = await getAllPost(token);
      set({ posts: res.data.data });
    } catch (err) {
      console.error("fetchPosts error:", err);
    }
  },

  /* ===== FETCH BY CATEGORY ===== */
  fetchPostByCategory: async (category_id) => {
    try {
      const token = useTestStore.getState().token;

      if (!category_id) {
        const res = await getAllPost(token);
        set({ posts: res.data.data });
        return;
      }

      const res = await getPostByCategory(token, category_id);
      set({ posts: res.data.data });
    } catch (err) {
      console.error("fetchPostByCategory error:", err);
    }
  },

  /* ===== DELETE ===== */
  deletePost: async (post_id) => {
    try {
      const token = useTestStore.getState().token;

      await deletePostApi(token, post_id);

      // ลบออกจาก state ทันที
      set((state) => ({
        posts: state.posts.filter(
          (p) => p.post_id !== post_id
        ),
      }));

      return true;
    } catch (err) {
      console.error("deletePost error:", err);
      return false;
    }
  },

  /* ===== ADD ===== */
  addPost: (post) =>
    set((state) => ({
      posts: [post, ...state.posts],
    })),

  clearPosts: () => set({ posts: [] }),

  fetchMyPosts: async () => {
    try{
      const token = useTestStore.getState().token;
      const res = await getMyPost(token)
      set({ myPosts: res.data.data})
    }catch(err){
      console.log(err);
    }}
});

const usePostStore = create<PostState>()(postStore);

export default usePostStore;