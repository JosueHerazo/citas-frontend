import { Outlet } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { } from '@fortawesome/free-solid-svg-icons'
import { faInstagram } from "@fortawesome/free-brands-svg-icons/faInstagram"
import latinosvip from "../assets/latinosvip.jpg"
import { Link, } from 'react-router-dom'

export default function Layout() {
  return (
    <>
        <header className=" bg-black flex  justify-between flex-col content-center items-center h-50
         sm:flex-row  mb-5 mx-1  hover:text-yellow-200 shadow-xl">
            <Link to="/inicio">
                <img src={latinosvip} alt="Logo" className='text-3xl size-60 w-50 ml-2 ' />
            </Link>

            <nav className='flex flex-wrap justify-end sm:justify-start  mr-2 ml-2 my-2 text-white uppercase text-2xl  shadow-xl'>
                <Link to="/" className='mx-2  hover:text-yellow-200'>Inicio</Link>

                <Link to="nuestros/barberos" className='mx-2  hover:text-yellow-200'>Barberos</Link>

                {/* < Link to="/coverup" className='mx-2  hover:text-yellow-200'>Cover Up</Link> */}

                <Link to="nuestros/trabajos" className='mx-2  hover:text-yellow-200'>Trabajos</Link>

                <Link to="nuestros/videos" className='mx-2  hover:text-yellow-200'>Videos</Link>

                <Link to="nuestras/noticias" className='mx-2  hover:text-yellow-200'>Noticias</Link>

                <Link to="cita/contacto" className='mx-2  hover:text-yellow-200'>Citas</Link>
            </nav>
            <div className='flex justify-end my-2 mr-10 text-white uppercase text-2xl'>
                <h1 className="ml-20  hover:text-yellow-200 shadow-xl">
                    <FontAwesomeIcon icon={faInstagram} /> LatinosVIP
                </h1>
            </div>
            <div>
                <p className="text-white">
                    <Link to={"/nuevo/registro"}>
                        Registrate
                    </Link>
                </p>
            </div>
        </header>

       <main className=" mt-10  mx-auto  ">
      <Outlet/>

       </main>
    </>
  )
}
