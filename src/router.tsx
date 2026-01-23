import {  createBrowserRouter } from "react-router-dom"
// import ContentTatto from "./pages/ContentTatto"
import Inicio from "./pages/Inicio"
import Layout from "./layouts/Layout"
import Barberos from "./pages/Barberos"
import Videos from "./pages/Videos"
import Noticias from "./pages/Noticias"
import ListDate, {action as citasAction} from "./pages/ListDate"
import Trabajos from "./pages/Trabajos"
import Registro from "./pages/Registro"
// { action as registroAction}
export const  router = createBrowserRouter([
{
       path: "/",
       element: <Layout/>,
       children: [
        {
          index: true,
          element: <Inicio />,

        },
         {   
                path: "nuestros/barberos",
                element:<Barberos/>,
               
            },
            {   
                path: "nuestras/noticias",
                element:<Noticias/>,
               
            },
            {   
                path: "nuestros/trabajos",
                element:<Trabajos/>,
               
            },
         
              {   
                path: "nuestros/videos",
                element:<Videos/>,
               
            },
            {   
                   path: "cita/contacto",
                   element:<ListDate/>,
                   action: citasAction

               },
         {   
                path: "/nuevo/registro",
                element:<Registro/>,
                // action: registroAction
               
            },
         
     
          ]
      
   }] )
    






