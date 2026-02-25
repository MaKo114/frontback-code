import { Link, Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div>
      <div className="space-x-2 px-2">
        <Link to="/login">login</Link>
        <Link to="/register">register</Link>
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
