import { createBrowserRouter } from "react-router-dom";
import Layout from "./layouts/Layout";
import NewDate, { action as listDateAction } from "./pages/NewDate";
import Login, { action as loginAction } from "./pages/Login";
import { ProtectedRoute } from "./pages/ProtectedRoute";
import Register, { action as registerAction } from "./pages/Register";
import Videos from "./pages/Videos";
import Noticias, { action as NewsAction, loader as noticiasLoader } from "./pages/Noticias";
import Inicio from "./pages/Inicio";
import Barberos from "./pages/Barberos";
import Trabajos from "./pages/Trabajos";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CustomDatePicker from "./components/CustomDatePicker";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <NewDate />,
        action: listDateAction,
      },
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
        element: <Barberos />,
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
        path: "nuestras/noticias",
        element: <Noticias />,
        action: NewsAction,
        loader: noticiasLoader,
      },
      {
        path: "barberos/disponibles/:barber",
        element: <CustomDatePicker />,
      },
      {
        path: "login/admin",
        element: <Login />,
        action: loginAction,
      },
      {
        path: "admin",
        element: <ProtectedRoute />,
        children: [
          {
            path: "dashboard",
            element: <AdminDashboard />,
          },
        ],
      },
    ],
  },
]);