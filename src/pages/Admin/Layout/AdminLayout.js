import { Outlet } from "react-router-dom";
import Dashboard from "../Home/SlideBar"; 

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-800 p-8">

      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;