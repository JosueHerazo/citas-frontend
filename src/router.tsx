import { createBrowserRouter } from "react-router-dom";

import Layout from "./layouts/Layout"; // Ajusta la ruta según tu carpeta
import ListDate, { action as listDateAction } from "./pages/ListDate"
import Login, { action as loginAction } from "./pages/Login"
import { ProtectedRoute } from "./pages/ProtectedRoute";
import Register, { action as registerAction } from "./pages/Register";
import Videos from "./pages/Videos";
import Noticias, {action as NewsAction}from "./pages/Noticias";
import  {loader as NewsLoader}from "./pages/Noticias";
import Inicio from "./pages/Inicio";
import Barberos from "./pages/Barberos";
import Trabajos from "./pages/Trabajos";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DatePicker from "./components/CustomDatePicker" // Tu componente de calendario
// import { action as adminDashboardAction } from "./pages/admin/AdminDashboard";
// import { action as adminCierresAction } from "./pages/admin/Cierres";
// import Cierres from "./pages/admin/Cierres";  
// import NewsManagement from "./pages/admin/NewsManagement";
// import { action as adminBarbersAction } from "./pages/admin/Barbers";
// import BarberManagement from "./pages/admin/BarberManagement";  
// import { action as adminTrabajosAction } from "./pages/admin/Trabajos";
// import TrabajosManagement from "./pages/admin/TrabajosManagement";  
// import { action as adminVideosAction } from "./pages/admin/Videos";
// import VideosManagement from "./pages/admin/VideosManagement";  
// import { ImportIcon } from "lucide-react";




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
            action: NewsAction,
            loader: NewsLoader
          },
          {
            path: "barberos/disponibles/:barber", 
            element: <DatePicker/>,
            // Opcional: puedes envolverlo en un Layout si lo necesitas
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