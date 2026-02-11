import { safeParse,  } from "valibot";
import axios from "axios";
import { DraftDateSchema } from "../types";

// Tipado para los datos crudos del formulario
type ServiceData = {
    [k: string]: FormDataEntryValue;
};

const HORARIOS_BARBERIA = {
    0: {inicio: 11, fin: 17 }, // Domingo: Cerrado
    1: { inicio: 10, fin: 20 }, // Lunes
    2: { inicio: 10, fin: 20 }, // Martes
    3: { inicio: 10, fin: 20 }, // Miércoles
    4: { inicio: 10, fin: 21 }, // Jueves
    5: { inicio: 10, fin: 21 }, // Viernes
    6: { inicio: 10, fin: 21 }, // Sábado
};

export async function addProduct(data: ServiceData) {
    try {
        const result = safeParse(DraftDateSchema, {
            barber: data.barber,
            service: data.service,
            price: Number(data.price),
            dateList: data.dateList, // Ya viene en formato local desde ListDate
            client: data.client,
            phone: String(data.phone).trim(),
            duration: Number(data.duration)
        });
        
        if (!result.success) throw new Error("Datos del formulario inválidos");

        const { output } = result;
        const selectedDate = new Date(output.dateList as string);
        const diaSemana = selectedDate.getDay();
        const hora = selectedDate.getHours();
        const horarioHoy = HORARIOS_BARBERIA[diaSemana as keyof typeof HORARIOS_BARBERIA];

        if (!horarioHoy) throw new Error("La barbería está cerrada hoy");
        if (hora < horarioHoy.inicio || hora >= horarioHoy.fin) {
            throw new Error(`Horario hoy: ${horarioHoy.inicio}:00 a ${horarioHoy.fin}:00`);
        }

        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        // ENVIAMOS LA FECHA TAL CUAL (LOCAL), NO USEMOS toISOString()
        const response = await axios.post(`${baseUrl}/api/date`, output);
        return response.data;

    } catch (error: any) {
        const msg = error.response?.data?.error || error.message || "Error desconocido";
        throw new Error(msg); 
    }
}
export async function getBarberAvailability(barber: string) {
    if (!barber) return [];

    const baseUrl = import.meta.env.VITE_API_URL ;
    // Añadimos /availability/ antes del nombre del barbero
    const url = `${baseUrl}/api/date/availability/${encodeURIComponent(barber)}`;
    
    console.log("🚀 Llamando a:", url);
    
    try {
        const response = await axios.get(url);
        // Extraemos los datos correctamente según tu controlador
        const result = response.data.data || response.data || []; 
        return Array.isArray(result) ? result : [];
    } catch (error) {
        console.error("Error trayendo disponibilidad:", error);
        return [];
    }
}

export async function getHistorialCierres() {
    try {
        const url = `${import.meta.env.VITE_API_URL}/api/cierres`;
        const { data } = await axios.get(url);
        return data.data || data || []; 
    } catch (error) {
        console.error("Error al obtener historial de cierres:", error);
        return [];
    }
}