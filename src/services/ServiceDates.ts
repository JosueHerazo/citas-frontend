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
        console.log("📤 Datos recibidos para crear cita:", data);
        
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
        console.log("✅ Datos validados:", output);
        
        const selectedDate = new Date(output.dateList as string);
        console.log("📅 Fecha seleccionada:", selectedDate);
        
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

        // 3. Validar que no sea en el pasado
        const now = new Date();
        if (selectedDate.getTime() < now.getTime()) {
            throw new Error("No puedes reservar citas en el pasado");
        }

        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        
        // 4. Obtener disponibilidad del barbero
        console.log("🔍 Obteniendo disponibilidad para:", output.barber);
        const busySlots = await getAvailability(output.barber);
        console.log("📊 Slots ocupados encontrados:", busySlots.length);
        
        // 5. Verificar si hay solapamiento - CORRECCIÓN IMPORTANTE
        const newAppointmentStart = selectedDate;
        const newAppointmentEnd = new Date(selectedDate.getTime() + (output.duration * 60000));
        
        console.log("⏰ Nueva cita:", {
            inicio: newAppointmentStart.toLocaleString(),
            fin: newAppointmentEnd.toLocaleString(),
            duración: output.duration + "min"
        });
        
        const hasConflict = busySlots.some((slotDate: any) => {
            // slotDate puede ser string o Date
            const busyStart = new Date(slotDate);
            
            // Asumir duración de 30min por defecto si no tenemos info
            const busyDuration = 30; // minutos
            const busyEnd = new Date(busyStart.getTime() + (busyDuration * 60000));
            
            // Verificar solapamiento
            const conflict = (
                (newAppointmentStart >= busyStart && newAppointmentStart < busyEnd) ||
                (newAppointmentEnd > busyStart && newAppointmentEnd <= busyEnd) ||
                (newAppointmentStart <= busyStart && newAppointmentEnd >= busyEnd)
            );
            
            if (conflict) {
                console.log("❌ Conflicto detectado:", {
                    citaExistente: busyStart.toLocaleString(),
                    nuevaCita: newAppointmentStart.toLocaleString()
                });
            }
            
            return conflict;
        });
        
        if (hasConflict) {
            throw new Error("Este horario ya está ocupado o se solapa con otra cita");
        }
        
        // 6. Enviar al Backend
        const url = `${baseUrl}/api/date`;
        console.log("📡 Enviando POST a:", url, "con datos:", output);
        
        const response = await axios.post(url, output);
        
        console.log("✅ Cita guardada con éxito:", response.data);
        return response.data;

    } catch (error: any) {
        console.error("❌ Error en addProduct:");
        console.error("Mensaje:", error.message);
        console.error("Stack:", error.stack);
        
        const msg = error.response?.data?.error || error.message || "Error desconocido";
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
export async function getAvailabilityRouterDate(barber: string) {
    if (!barber) return [];

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    
    // PRUEBA PRIMERO CON LA RUTA QUE SÍ FUNCIONA
    const url = `${baseUrl}/api/date/availability/${encodeURIComponent(barber)}`;
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

    } catch (error: any) {
        console.error("Error trayendo disponibilidad:", error.response?.data || error.message);
        
        // Si falla, intenta con la ruta alternativa
        console.log("🔄 Intentando ruta alternativa...");
        try {
            const altUrl = `${baseUrl}/api/date/${encodeURIComponent(barber)}`;
            console.log("🔄 Llamando a alternativa:", altUrl);
            const altResponse = await axios.get(altUrl);
            const altResult = altResponse.data.data || altResponse.data || [];
            const datesOnly = altResult.map((slot: any) => slot.dateList || slot.start || slot);
            return Array.isArray(datesOnly) ? datesOnly : [];
        } catch (altError) {
            console.error("❌ Ambas rutas fallaron");
            return [];
        }
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