import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
    // Obtenemos el rol guardado en el Login
    const userRole = localStorage.getItem("userRole"); 
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    // Si no está logueado o no es administrador/barbero, para afuera
    if (!isLoggedIn || (userRole !== "admin" && userRole !== "barber")) {
        return <Navigate to="/login" replace />;
    }

    // Si todo está bien, muestra el contenido (Outlet)
    return <Outlet />;
};