import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import HomePage from "../pages/home/HomePage";
import LayoutUser from "../layouts/LayoutUser";
import EditProfile from "../pages/users/EditProfile";
import LayoutAdmin from "../layouts/LayoutAdmin";
import AdminReport from "../pages/admins/AdminReport";
import AdminPosts from "../pages/admins/AdminPosts";
import AdminUsers from "../pages/admins/AdminUsers";
import AdminCategories from "../pages/admins/AdminCategories";
import ChatPage from "@/pages/users/ChatPage";
import ProtectRouteUser from "./ProtectRouteUser";
import ProtectRouteAdmin from "./ProtectRouteAdmin";
import Layout from "@/layouts/Layout";
import ChatListPage from "@/pages/users/ChatList";
import LandingPage from "@/pages/landing/LandingPage";
import ExchangePage from "@/pages/users/Exchange";
import MyPostPage from "@/pages/users/MyPostPage";
import PostDetailPage from "@/pages/users/PostDetail";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout/>,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
  {
    path: "/user",
    element: <ProtectRouteUser element={<LayoutUser />}/>,
    children: [
      { index: true, element: <HomePage  /> },
      { path: "my-posts", element: <MyPostPage /> },
      { path: "edit-profile", element: <EditProfile /> },
      { path: "chat/:chatId", element: <ChatPage /> },
      { path: "chat-list", element: <ChatListPage /> },
      { path: "exchanges", element: <ExchangePage /> },
      { path: "post/:post_id", element: <PostDetailPage /> },
    ],
  },
  {
    path: "/admin",
    element: <ProtectRouteAdmin element={<LayoutAdmin />} />,
    children: [
      { index: true, element: <AdminPosts /> },
      { path: "reports", element: <AdminReport /> },
      { path: "users", element: <AdminUsers /> },
      { path: "categories", element: <AdminCategories /> },
      { path: "post/:post_id", element: <PostDetailPage /> },
    ],
  },
]);

const AppRoutes = () => {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default AppRoutes;
