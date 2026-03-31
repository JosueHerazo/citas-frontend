import { Navigate, Outlet, useLocation } from "react-router-dom";

export const ProtectedRoute = () => {
    const userRole = localStorage.getItem("userRole");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const location = useLocation();

    // Si no está logueado o no es admin/barbero → redirigir al login correcto
    if (!isLoggedIn || (userRole !== "admin" && userRole !== "barber")) {
        return <Navigate 
            to="/login/admin" 
            state={{ from: location }}   // ← Muy recomendado
            replace 
        />;
    }

    return <Outlet />;
};