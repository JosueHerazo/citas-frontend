import { createBrowserRouter } from "react-router-dom";

// Layouts y Protecciones
import Layout from "./layouts/Layout"; // Ajusta la ruta según tu carpeta


// Vistas de Clientes (Públicas o de flujo normal)
import ListDate, { action as listDateAction } from "./pages/ListDate"
import Login, { action as loginAction } from "./pages/Login"
import { ProtectedRoute } from "./pages/ProtectedRoute";
import Register, { action as registerAction } from "./pages/Register";
import Videos from "./pages/Videos";
import Noticias from "./pages/Noticias";
import Inicio from "./pages/Inicio";
import Barberos from "./pages/Barberos";
import Trabajos from "./pages/Trabajos";
import AdminDashboard from "./pages/admin/AdminDashboard";



export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // Ruta raíz: Formulario de Citas
      {
        index: true,
        element: <ListDate />,
        action: listDateAction,
      },
      // Grupo de rutas bajo /nuevo
      
        {
            path: "nuevo/inicio",
            element: <Inicio />,
          },
          {
            path: "nuevo/registro",
            element: <Register />,
            action: registerAction,
          },
          {
            path: "nuestros/barberos",
            element: <Barberos/>,
          },
          {
            path: "nuestros/trabajos",
            element: <Trabajos />,
          },
          {
            path: "nuestros/videos",
            element: <Videos />,
          },
      
          {
            path: "nuestras/noticias" ,
            element: <Noticias />,
          },
      
      // Autenticación
      {
        path: "/login/admin",
        element: <Login />,
        action: loginAction,
      },
      // Rutas Protegidas (Solo Admin/Barbero)
      {
        path: "/admin",
        element: <ProtectedRoute />,
    },
          {
        path: "/admin",
        element: <ProtectedRoute />,
    },  
          {
            path: "/dashboard",
            element: <AdminDashboard/>,
          },
        
          
]
  },
]);