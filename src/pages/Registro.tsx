import { Form,  } from "react-router-dom"
// import { addProduct } from "../services/ServiceCitas"
// import ErrorMessage from "../components/ErrorMessage"
// import ErrorMessage from "../components/ErrorMessage"

// export async function action ({request} : ActionFunctionArgs) {
//   const formData = await request.formData()
//   const data = Object.fromEntries(formData)
//   if(Object.values(data).includes("")){
//     return "Todos los campos son obligatorios"
//   }
//   await addProduct(data)
//   return redirect("/")
// }


export default function Citas() {
  // const error = useActionData() as string[]

  return (
    <>
      <Form action="" className=" flex flex-row  flex-wrap  justify-between max-w-md mx-auto">
        {/* {error && <ErrorMessage>{error}</ErrorMessage>} */}
        <div className="formulario text-center  ">
          <h2 className="text-white">Registrate para reservar tu Cita</h2>
            <div >
              <label htmlFor="name" className="text-white">Nombre</label><br />
              <input
              name="name"
              // value={cliente.name} 
              // onChange={handleChange }
               type="text" 
               id="name" 
               className="shadow outline outline-amber-600 p-4 w-full mt-2" />
            </div>
            <div>
            <div>
              <label htmlFor="password" className="text-white">Contraseña</label><br />
              <input
              name="password"
              // value={cliente.phone}
              // onChange={handleChange}
               type="password" 
               id="password"
               className="shadow outline outlin outline-amber-600
                e-fuchsia-800 p-4 w-full mt-2" />
            </div>
              <label htmlFor="phone" className="text-white">Telefono</label><br />
              <input
              name="phone"
              // value={cliente.phone}
              // onChange={handleChange}
               type="number" 
               id="phone"
               className="shadow outline outlin outline-amber-600
                e-fuchsia-800 p-4 w-full mt-2" />
            </div>
            <div>
              <label htmlFor="email" 
              className="text-white">Correo electronico </label><br />
              <input
              name="email"
              // value={cliente.email}
              // onChange={handleChange}
               type="email" 
               id="email"
               className="shadow outline outlin outline-amber-600
                e-fuchsia-800  p-4 w-full mt-2" />
            </div>
            {/* <div>
              <label htmlFor="menssage" className="text-white">mensaje</label><br />
              <input 
                name="menssage" 
                value={cliente.menssage}
                id="menssage"
                type="text"
                className="shadow outline outline-amber-600 p-4 w-full mt-2"
              />
            </div> */}
            <div>
              <input
                  type="checkbox"
                  name="terms"
                  id="terms"
                />
              <label htmlFor="terms " className="text-white"> He leído y acepto el Aviso Legal y la Política de Privacidad</label><br />
              <input  
                  type="submit"
                  value={"Registrate Para reservar Cita"}
                  className="bg-amber-600 hover:bg-amber-600 text-white ml-3 p-4 w-full mt-2"
                  />
            </div>

          
        </div>

      </Form>
       
    </>
  )
}
