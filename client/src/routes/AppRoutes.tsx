import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

const router = createBrowserRouter(
    [
        {path: "/", element: <div className="border">ROOT PAHT</div>},
        {path: "/login", element: <Login />},
        {path: "/register", element: <Register/>}
    ]
)

const AppRoutes = () => {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default AppRoutes;