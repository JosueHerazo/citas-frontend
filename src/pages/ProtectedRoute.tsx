import { Navigate, Outlet, useLocation } from "react-router-dom";

export const ProtectedRoute = () => {
    const userRole = localStorage.getItem("userRole");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const location = useLocation();

    if (!isLoggedIn || (userRole !== "admin" && userRole !== "barber")) {
        return <Navigate 
            to="/login/admin"           // ← Cambia a la ruta real del login
            state={{ from: location }}  // Guarda la página a la que quería ir
            replace 
        />;
    }

    return <Outlet />;
};