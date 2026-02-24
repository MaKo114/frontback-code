import NavbarAdmin from "../components/NavbarAdmin";
import { Outlet } from "react-router-dom";

const LayoutAdmin = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <NavbarAdmin />
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default LayoutAdmin;