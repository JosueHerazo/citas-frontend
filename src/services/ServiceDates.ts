import { safeParse } from "valibot";
import axios from "axios";
import { DraftDateSchema } from "../types";

type ServiceData = {
    [k: string]: FormDataEntryValue;
};

const HORARIOS_BARBERIA = {
    0: { inicio: 11, fin: 17 },
    1: { inicio: 10, fin: 20 },
    2: { inicio: 10, fin: 20 },
    3: { inicio: 10, fin: 20 },
    4: { inicio: 10, fin: 21 },
    5: { inicio: 10, fin: 21 },
    6: { inicio: 10, fin: 21 },
};

export async function addProduct(data: ServiceData) {
    try {
        const result = safeParse(DraftDateSchema, {
            barber:   data.barber,
            service:  data.service,
            price:    Number(data.price),
            dateList: data.dateList,
            client:   data.client,
            phone:    String(data.phone).trim(),
            duration: Number(data.duration)
        });

        if (!result.success) throw new Error("Datos del formulario inválidos");

        const { output } = result;
        const selectedDate = new Date(output.dateList as string);
        const diaSemana    = selectedDate.getDay();
        const hora         = selectedDate.getHours();
        const horarioHoy   = HORARIOS_BARBERIA[diaSemana as keyof typeof HORARIOS_BARBERIA];

        if (!horarioHoy) throw new Error("La barbería está cerrada hoy");
        if (hora < horarioHoy.inicio || hora >= horarioHoy.fin) {
            throw new Error(`Horario: ${horarioHoy.inicio}:00 a ${horarioHoy.fin}:00`);
        }

        const baseUrl  = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const response = await axios.post(`${baseUrl}/api/date`, output);
        return response.data;

    } catch (error: any) {
        const msg = error.response?.data?.error || error.message || "Error desconocido";
        throw new Error(msg);
    }
}

export async function getBarberAvailability(barber: string) {
    if (!barber) return [];
    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, "");
    const url     = `${baseUrl}/api/date/availability/${encodeURIComponent(barber.trim())}`;
    try {
        const { data } = await axios.get(url);
        const result   = data.data || data;
        return Array.isArray(result) ? result : [];
    } catch (error) {
        console.error("Error en disponibilidad:", error);
        return [];
    }
}

export async function getHistorialCierres() {
    try {
        const url      = `${import.meta.env.VITE_API_URL}/api/cierres`;
        const { data } = await axios.get(url);
        return data.data || data || [];
    } catch (error) {
        console.error("Error al obtener historial de cierres:", error);
        return [];
    }
}

// ── Barberos en BD ────────────────────────────────────────────
export async function getBarberosDB() {
    try {
        const baseUrl  = import.meta.env.VITE_API_URL.replace(/\/$/, "")
        const { data } = await axios.get(`${baseUrl}/api/date/barberos`)
        return data.data || []
    } catch {
        return []
    }
}

export async function saveBarberosDB(barberos: any[]) {
    try {
        const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, "")
        await axios.post(`${baseUrl}/api/date/barberos`, { barberos })
    } catch (e) {
        console.error("Error guardando barberos", e)
    }
}