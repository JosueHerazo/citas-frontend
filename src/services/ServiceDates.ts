import { safeParse } from "valibot";
import axios from "axios";
import { DraftDateSchema } from "../types";

// Tipado para los datos crudos del formulario
type ServiceData = {
    [k: string]: FormDataEntryValue;
};

const HORARIOS_BARBERIA = {
    0: {inicio: 11, fin: 17 }, // Domingo
    1: { inicio: 10, fin: 20 }, // Lunes
    2: { inicio: 10, fin: 20 }, // Martes
    3: { inicio: 10, fin: 20 }, // Miércoles
    4: { inicio: 10, fin: 21 }, // Jueves
    5: { inicio: 10, fin: 21 }, // Viernes
    6: { inicio: 10, fin: 21 }, // Sábado
};

export async function addProduct(data: ServiceData) {
    try {
        // 1. Validar tipos con Valibot
        const result = safeParse(DraftDateSchema, {
            barber: data.barber,
            service: data.service,
            price: Number(data.price),
            dateList: data.dateList,
            client: data.client,
            phone: String(data.phone).trim(),
            duration: Number(data.duration)
        });
        
        if (!result.success) {
            console.table(result.issues.map(i => ({ campo: i.path?.[0].key, mensaje: i.message })));
            throw new Error("Datos del formulario inválidos");
        }

        const { output } = result;
        const selectedDate = new Date(output.dateList as string);
        const diaSemana = selectedDate.getDay();
        const hora = selectedDate.getHours();
        const horarioHoy = HORARIOS_BARBERIA[diaSemana as keyof typeof HORARIOS_BARBERIA];

        // 2. Validar Horario Comercial
        if (!horarioHoy) {
            throw new Error("La barbería está cerrada los domingos");
        }
        if (hora < horarioHoy.inicio || hora >= horarioHoy.fin) {
            throw new Error(`Horario hoy: ${horarioHoy.inicio}:00 a ${horarioHoy.fin}:00`);
        }

        // 3. VALIDACIÓN DE 3 HORAS REMOVIDA - Ahora permite citas inmediatas
        // Solo validar que la cita no sea en el pasado
        const now = new Date();
        if (selectedDate.getTime() < now.getTime()) {
            throw new Error("No puedes reservar citas en el pasado");
        }

        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        
        // 4. Primero verificar disponibilidad (nueva funcionalidad)
        const availabilityUrl = `${baseUrl}/api/availability/${encodeURIComponent(output.barber)}`;
        const availabilityResponse = await axios.get(availabilityUrl);
        const busySlots = availabilityResponse.data.data || [];
        
        // Verificar si hay solapamiento
        const newAppointmentEnd = new Date(selectedDate.getTime() + (output.duration * 60000)); // duration en minutos
        const hasConflict = busySlots.some((slot: string) => {
            const busyStart = new Date(slot);
            const busyEnd = new Date(busyStart.getTime() + (30 * 60000)); // Asumiendo 30 min por defecto
            
            // Verificar solapamiento
            return (
                (selectedDate >= busyStart && selectedDate < busyEnd) ||
                (newAppointmentEnd > busyStart && newAppointmentEnd <= busyEnd) ||
                (selectedDate <= busyStart && newAppointmentEnd >= busyEnd)
            );
        });
        
        if (hasConflict) {
            throw new Error("Este horario ya está ocupado o se solapa con otra cita");
        }
        
        // 5. Enviar al Backend
        const url = `${baseUrl}/api/date`;
        const response = await axios.post(url, output);
        
        console.log("✅ Cita guardada con éxito");
        return response.data;

    } catch (error: any) {
        const msg = error.response?.data?.error || error.message || "Error desconocido";
        console.error("❌ Error en la petición:", msg);
        throw new Error(msg); 
    }
}
export async function getAvailability(barber: string) {
    if (!barber) return [];

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const url = `${baseUrl}/api/availability/${encodeURIComponent(barber)}`;
    console.log("🚀 Llamando a:", url);
    
    try {
        const response = await axios.get(url);
        
        if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
            console.error("❌ El backend devolvió HTML. Revisa tu VITE_API_URL");
            return [];
        }

        const result = response.data.data || response.data || []; 
        console.log("📅 Disponibilidad recibida:", result);
        
        // Extrae solo las fechas para compatibilidad con DatePicker
        const datesOnly = result.map((slot: any) => slot.start || slot);
        return Array.isArray(datesOnly) ? datesOnly : [];

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