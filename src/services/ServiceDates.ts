import { safeParse} from "valibot"
import axios from "axios"
import { DraftDateSchema } from "../types";

type serviceData = {

    [k: string]: FormDataEntryValue;

}
export async function addProduct(data : serviceData) {
    try {
        
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
    // VALIDACIÓN DE FECHA ANTES DE ENVIAR
      const rawDate = result.output.dateList;
      const dateObject = new Date(rawDate);

      // Si la fecha es inválida, usamos la fecha actual para que no explote
      const finalDate = isNaN(dateObject.getTime()) 
        ? new Date().toISOString() 
        : dateObject.toISOString();
    
     await axios.post(url, 
        {
            barber: result.output.barber,
            service: result.output.service,
            price: +result.output.price,
            dateList: finalDate, // Formatear a "YYYY-MM-DD"
            client: result.output.client,   
            phone: +result.output.phone,
            
            
            // new Date(result.output.dateList)
        }
    )
            
    console.log("✅ Guardado con éxito en la DB");
} else {
    console.error("Errores de validación:", result.issues);
}    } catch (error) {
console.log("❌ Error en la petición:", error    
);        
    }
    
    
}