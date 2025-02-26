import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
    const auth = useSelector((state) => state.auth.auth);
    const isAdmin = auth?.role?.name === "ROLE_ADMIN";
    return isAdmin ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default AdminRoute;
    