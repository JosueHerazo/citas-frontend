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
        console.table(result.issues.map(i => ({ campo: i.path?.[0].key, mensaje: i.message })));            throw new Error("Datos del formulario inválidos");
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

        // 3. Validar antelación (3 horas)
        const now = new Date();
        if (selectedDate.getTime() < now.getTime() + (3 * 60 * 60 * 1000)) {
            throw new Error("La cita debe ser con al menos 3 horas de antelación");
        }
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        // 4. Enviar al Backend
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
        
        // Si el backend responde con HTML es que la URL está mal configurada
        if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
            console.error("❌ El backend devolvió HTML. Revisa tu VITE_API_URL");
            return [];
        }

        // Accedemos a los datos. Si tu backend devuelve { data: [...] } usamos response.data.data
        const result = response.data.data || response.data || []; 
        console.log("📅 Disponibilidad recibida:", result);
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