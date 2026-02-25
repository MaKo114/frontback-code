import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import HomePage from "../pages/home/HomePage";
import LayoutUser from "../layouts/LayoutUser";
import MyPosts from "../pages/users/MyPosts";
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout/>,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
  {
    path: "/user",
    element: <ProtectRouteUser element={<LayoutUser />}/>,
    children: [
      { index: true, element: <HomePage /> },
      { path: "my-posts", element: <MyPosts /> },
      { path: "edit-profile", element: <EditProfile /> },
      { path: "chat", element: <ChatPage /> },
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
