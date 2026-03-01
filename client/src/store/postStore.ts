import { create, type StateCreator } from "zustand";
import { getAllPost, getPostByCategory } from "@/api/post";
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
  images: Image[];
}

interface PostState {
  posts: Post[];
  fetchPosts: (token: string) => Promise<void>;
  fetchPostByCategory: (category_id: number) => Promise<void>;
  addPost: (post: Post) => void;
  clearPosts: () => void;
}

/* ================= STORE ================= */

const postStore: StateCreator<PostState> = (set) => ({
  posts: [],

  fetchPosts: async (token) => {
    const res = await getAllPost(token)
    set({ posts: res.data.data });
  },

  fetchPostByCategory: async (category_id) => {
    const token = useTestStore.getState().token;
    const res = await getPostByCategory(token, category_id)
    set({ posts: res.data.data });
  },

  addPost: (post) =>
    set((state) => ({
      posts: [post, ...state.posts],
    })),

  clearPosts: () => set({ posts: [] }),
});

const usePostStore = create<PostState>()(postStore);

export default usePostStore;