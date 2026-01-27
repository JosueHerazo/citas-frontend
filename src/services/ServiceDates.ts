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
    //   const rawDate = result.output.dateList;
    //   const dateObject = new Date(rawDate);

      // Si la fecha es inválida, usamos la fecha actual para que no explote
    //   const finalDate = isNaN(dateObject.getTime()) 
    //     ? new Date().toISOString() 
    //     : dateObject.toISOString();
    
     await axios.post(url, 
        {
            barber: result.output.barber,
            service: result.output.service,
            price: +result.output.price,
            dateList: result.output.dateList, // Formatear a "YYYY-MM-DD"
            client: result.output.client,   
            phone: +result.output.phone,
            
            
         
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

// services/ServiceDates.ts

export async function getBarberAvailability(barberName: string) {
    try {
        const url = `${import.meta.env.VITE_API_URL}/api/date/availability?barber=${barberName}`;
        const { data } = await axios.get(url);
        return data.data; // Retorna el array de citas del barbero
    } catch (error) {
        console.error("Error trayendo disponibilidad:", error);
        return [];
    }
}
export async function getHistorialCierres() {
    try {
        const url = `${import.meta.env.VITE_API_URL}/api/cierres`;
        const { data } = await axios.get(url);
        
        // Dependiendo de cómo responda tu API, ajusta esto:
        // Si tu backend responde { data: [...] } usamos data.data
        return data.data || data || []; 
    } catch (error) {
        console.error("Error al obtener historial de cierres:", error);
        return [];
    }
}
