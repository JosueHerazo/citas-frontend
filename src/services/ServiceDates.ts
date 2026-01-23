import { safeParse} from "valibot"
import axios from "axios"
import { DraftDateSchema } from "../types";

type serviceData = {

    [k: string]: FormDataEntryValue;

}
export async function addProduct(data : serviceData) {
    try {
        // VALIBOT LIMPIA LOS DATOS Y PARSEA EL TYPE
        const result = safeParse(DraftDateSchema,
            {
             barber: data.barber,
            service: data.service,
            price: +data.phone,
            date: data.date,
            // createdAt: data.createdAt
            
        })
        console.log(result);
        
        // LUEGO SI LOS RESULTADOS CON CORECTOS 
if (result.success) {
    // SE CREA LA RUTA DE DESTINO
    const url = `${import.meta.env.VITE_API_URL}/api/service`
    // LUEGO SE ENVIA LA DATA A LA SERVER CON EL METODO POST Y SE AÑADE LA URL LUEGO LA DATA YA VALIDADA
  
     await axios.post(url, 
        {
            barber: result.output.barber,
            service: result.output.service,
             price: +result.output.price,
            date: result.output.date,
            
            
            
        }
    )
            
    
} else {
    
}    } catch (error) {
        console.log(error);
        
    }
    
    
}

// export async function getServices() {
//     try {
//             const url = `${import.meta.env.VITE_API_URL}/api/service`
//             const {data} = await axios(url)
//             const result = safeParse(DatesSchema, data.data)
//             if(result.success){
//                return result.output
//             }else{
//                 throw new Error("Hubo un error...")
//             }

            
            
            
//     } catch (error) {
//         return[]
//     }
// }


// export async function getServiceById(id : Service["id"]) {
//     try {
//             const url = `${import.meta.env.VITE_API_URL}/api/service/${id}`
//             const {data} = await axios(url)
//             const result = safeParse(ServiceSchema, data.data)
//             if(result.success){
//                return result.output
//             }else{
//                 throw new Error("Hubo un error...")
//             }

            
//             console.log(result);
            
            
//     } catch (error) {
        
//     }
// }

// export async function updateService (data : serviceData, id : Service["id"]){
//     try {
//         // const NumberSchema = coerce(number(), Number)
//         // const DateSchema = coerce(date(), Date)
//         const result = safeParse( DraftServiceSchema, {
//             // id: parse(NumberSchema, +data.id),
//             service: data.service,
//             price:  Number(data.price),
//             barber: data.barber,
//             client: data.client,
//             phone: Number(data.phone),
//             // createdAt:  parse(DateSchema,data.createdAt)


//         })
//         if(result){

//             const url = `${import.meta.env.VITE_API_URL}/api/service/${id}`
//             await axios.put(url, result.output)
//         }
//     } catch (error) {
        
//     }
    
// }

// export async function deleteService(id: Service["id"]) {
//     try {
//         const url = `${import.meta.env.VITE_API_URL}/api/service/${id}`
//         await axios.delete(url)
//     } catch (error) {
//         console.log(error);
        
//     }
    
// }
// // services/ServiceService.ts
// // export async function searchClients() {
// //     try {
// //         const url = `${import.meta.env.VITE_API_URL}/api/service`
// //         const { data } = await axios(url)
// //         return data.data as Client[]
// //     } catch (error) {
// //         console.log(error)
// //         return []
// //     }
// // 