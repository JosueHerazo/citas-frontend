import { safeParse} from "valibot"
import axios from "axios"
import { DraftDateSchema } from "../types";

type serviceData = {

    [k: string]: FormDataEntryValue;

}
export async function addProduct(data : serviceData) {
    try {
        console.log("Esquema actual:", DraftDateSchema); // Esto te dirá si ya cambió a string
        const priceNumber = Number(data.price);
        // const dateListNumber = Number(data.dateList);
        // VALIBOT LIMPIA LOS DATOS Y PARSEA EL TYPE
        const result = safeParse(DraftDateSchema,
            {
                barber: data.barber,
                service: data.service,
                price: isNaN(priceNumber) ? 0 : priceNumber, 
                dateList: data. dateList,
                client: data.client,
                phone: Number(data.phone),
               
                
            })
        console.log(result);
        
        // LUEGO SI LOS RESULTADOS CON CORECTOS 
if (result.success) {
    // SE CREA LA RUTA DE DESTINO
    const url = `${import.meta.env.VITE_API_URL}/api/date`
    // LUEGO SE ENVIA LA DATA A LA SERVER CON EL METODO POST Y SE AÑADE LA URL LUEGO LA DATA YA VALIDADA
  console.log("ERRORES DE VALIBOT:", result.issues);
     await axios.post(url, 
        {
            barber: result.output.barber,
            service: result.output.service,
            price: +result.output.price,
            dateList: result.output.dateList,
            client: result.output.client,   
            phone: result.output.phone,
            
            
            
        }
    )
            
    
} else {
    
}    } catch (error) {
        console.log(error);
        
    }
    
    
}