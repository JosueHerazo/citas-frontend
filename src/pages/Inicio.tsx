import { faWhatsapp, } from "@fortawesome/free-brands-svg-icons/faWhatsapp"
import { faStar } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Link } from "react-router-dom"
import latinosvip from "../assets/latinosvip.jpg"


export default function Inicio() {
  
  return (
    <>
      <div className="  font-black bg-black text-amber-600 hover:text-amber-200 grid flex-col justify-center justify-items-center align-middle mx-auto uppercase p-10 my-5S w-auto py-5 ">
        <div className="text-4xl py-5 text-center ">
          <h1>LatinosVIP Barbershop En MADRID</h1>
      <div className=" w-full h-30 flex justify-center contact mt-10 shadow-xl">
        <img src={latinosvip} alt="" className="z-50 img-fluid w-80 z" />
        <img src={latinosvip} alt="" className="z-40 img-fluid w-80" />
        <img src={latinosvip} alt="" className="z-30 img-fluid w-80" />
        <img src={latinosvip} alt="" className="z-20 img-fluid w-80" />
        <img src={latinosvip} alt="" className="z-10 img-fluid w-80" />
        <img src={latinosvip} alt="" className="z-10 img-fluid w-80" />
        <img src={latinosvip} alt="" className="z-10 img-fluid w-80" />
        <img src={latinosvip} alt="" className="z-10 img-fluid w-80" />
        <img src={latinosvip} alt="" className="z-10 img-fluid w-80" />
        <img src={latinosvip} alt="" className="z-10 img-fluid w-80" />
        <img src={latinosvip} alt="" className="z-10 img-fluid w-80" />
        <img src={latinosvip} alt="" className="z-10 img-fluid w-80" />
        <img src={latinosvip} alt="" className="z-10 img-fluid w-80" />
      </div>
        </div>
        <div className="text-4xl py-5">
          <h2 className=" ">contactanos <FontAwesomeIcon icon={faWhatsapp} />  <span>722335405</span> </h2>
        </div>
        <div className="text-4xl py-5">
          <p>Excelente servicio</p>
        </div>
        <div >
          <p ><FontAwesomeIcon className="text-yellow-300" icon={faStar} /><FontAwesomeIcon className="text-yellow-300" icon={faStar} /><FontAwesomeIcon className="text-yellow-300" icon={faStar} /><FontAwesomeIcon className="text-yellow-300" icon={faStar} /><FontAwesomeIcon className="text-yellow-300" icon={faStar} /></p>
        </div>
      </div>
      <div>
        <div className=" p-5 my-8 bg-black text-amber-600 hover:text-amber-200 shadow-xl">
          <h1>Barberia Excelente Calidad</h1>
        </div>
        <div className="grid justify-items-center shadow-xl bg-black text-amber-600 hover:text-amber-200 font-semibold">
          <p>En LatinosVIP, contamos con artistas expertos en diversos estilos, como Mechas, trenzas, limpieza facial entre  otros. Sin embargo, nuestros barberos están especializados en brindar un excelente servicio. Nuestros cortes no solo son obras de arte, sino que también hacemos cambios de imagen con tu corte de cabello con una precisión extraordinaria.<br/>
            Deja que los artistas te sorprendan y te harán sentir 100% identificado con tu tatuaje, ya sea un diseño pequeño, mediano o grande.</p>
        </div>
        <div>
        <Link to="nuestros/trabajos" className="uppercase Header my-5 p-5 bg-black text-amber-600 hover:text-amber-200  text-center  flex flex-col  mx-auto">descubre todos nuestros trabajos</Link>
        </div>

      

 <div className=" flex flex-row  flex-wrap  justify-between max-w-md mx-auto">
          <h1 className="text-amber-600 my-3">Contáctanos</h1>
          <a href="" className="bg-amber-600 font-extrabold ml-3 text-white mb-3 hover:bg-amber-600 p-4 w-full mt-2">Llamanos</a>
          
              <h2 className="text-amber-600">Horarios</h2>
              <a href="" className="bg-amber-600  ml-3 text-white mb-3 hover:bg-amber-600 p-4 w-full mt-2"> 
              <p className="font-extrabold">De lunes a Miercoles de 10:00 a 20:00 - Jueves a Sabados de 10:00 a 21:00 - Domingos de 11:00 a 17:00</p>

              </a>
              <h2 className="text-amber-600">Dirección</h2>
          <a href="" className="bg-amber-600  ml-3 text-white mb-3 hover:bg-amber-600 p-4 w-full mt-2">
              <p className="font-extrabold"> Calle Virgen del Pilar 11</p>

          </a>
            
          </div>
        

 </div>
    </>
  )
}
