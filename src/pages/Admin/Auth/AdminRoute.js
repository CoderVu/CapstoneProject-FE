import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const AdminRoute = () => {
    const auth = useSelector((state) => state.auth.auth);
    const location = useLocation();
    const isAdmin = auth?.role?.name === "ROLE_ADMIN";
    const isStaff = auth?.role?.name === "ROLE_STAFF";
    
    // Nếu không đăng nhập, chuyển hướng về trang đăng nhập
    if (!auth) {
        return <Navigate to="/signin" replace />;
    }

    // Nếu không phải ADMIN hoặc STAFF, chuyển hướng về trang đăng nhập
    if (!isAdmin && !isStaff) {
        return <Navigate to="/signin" replace />;
    }

    // Nếu là STAFF, chỉ cho phép truy cập dashboard và orders
    if (isStaff) {
        const allowedPaths = ["/admin/dashboard", "/admin/orders"];
        if (!allowedPaths.includes(location.pathname)) {
            return <Navigate to="/admin/dashboard" replace />;
        }
    }

    // Cho phép truy cập
    return <Outlet />;
};

export default AdminRoute;
    