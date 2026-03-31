import { safeParse } from "valibot";
import axios from "axios";
import { DraftDateSchema, DatesSchema, type DateList } from "../types";

// ─── TIPOS ────────────────────────────────────────────────────────────────────
type ServiceData = {
    [k: string]: FormDataEntryValue;
};

// ─── HORARIOS ─────────────────────────────────────────────────────────────────
const HORARIOS_BARBERIA = {
    0: { inicio: 11, fin: 17 },
    1: { inicio: 10, fin: 20 },
    2: { inicio: 10, fin: 20 },
    3: { inicio: 10, fin: 20 },
    4: { inicio: 10, fin: 21 },
    5: { inicio: 10, fin: 21 },
    6: { inicio: 10, fin: 21 },
};

const BASE_URL = () => (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

// ─── CITAS ────────────────────────────────────────────────────────────────────

// POST /api/date — crear cita nueva (usado por NewDate action)
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

        const response = await axios.post(`${BASE_URL()}/api/date`, output);
        return response.data;

    } catch (error: any) {
        const msg = error.response?.data?.error || error.message || "Error desconocido";
        throw new Error(msg);
    }
}

// GET /api/date — listar todas las citas
export async function getDatesList(): Promise<DateList[]> {
    try {
        const { data } = await axios.get(`${BASE_URL()}/api/date`)
        const result = safeParse(DatesSchema, data.data)
        return result.success ? result.output : (data.data as DateList[])
    } catch (error) {
        console.error("Error al obtener citas:", error)
        return []
    }
}

// DELETE /api/date/:id
export async function deleteDate(id: number): Promise<void> {
    await axios.delete(`${BASE_URL()}/api/date/${id}`)
}

// PUT /api/date/:id — actualizar cita completa
export async function updateDate(id: number, data: any): Promise<void> {
    await axios.put(`${BASE_URL()}/api/date/${id}`, data)
}

// PATCH /api/date/:id — toggle isPaid de cita
export async function toggleCitaPaid(id: number): Promise<void> {
    await axios.patch(`${BASE_URL()}/api/date/${id}`)
}

// POST /api/service + PATCH /api/date/:id — registrar cobro completo
export async function registrarCobro(ventaData: DateList): Promise<{ success: boolean }> {
    try {
        await axios.post(`${BASE_URL()}/api/service`, {
            barber:  ventaData.barber,
            service: ventaData.service,
            client:  ventaData.client,
            phone:   String(ventaData.phone ?? "").replace(/\s+/g, ""),
            price:   Number(ventaData.price),
            isPaid:  true
        })
        await axios.patch(`${BASE_URL()}/api/date/${ventaData.id}`)
        return { success: true }
    } catch (error) {
        console.error("Error en registrarCobro:", error)
        throw error
    }
}

// ─── DISPONIBILIDAD ───────────────────────────────────────────────────────────

// GET /api/date/availability/:barber
export async function getBarberAvailability(barber: string) {
    if (!barber) return [];
    const url = `${BASE_URL()}/api/date/availability/${encodeURIComponent(barber.trim())}`;
    try {
        const { data } = await axios.get(url);
        const result = data.data || data;
        return Array.isArray(result) ? result : [];
    } catch (error) {
        console.error("Error en disponibilidad:", error);
        return [];
    }
}

// ─── BARBEROS ─────────────────────────────────────────────────────────────────

// GET /api/date/barberos → [{ id, nombre, foto }]
export async function getBarberosDB() {
    try {
        const { data } = await axios.get(`${BASE_URL()}/api/date/barberos`)
        return data.data || []
    } catch {
        return []
    }
}

// POST /api/date/barberos/add → crear barbero nuevo en tabla `barberos`
export async function addBarbero(nombre: string, foto?: string | null) {
    try {
        const { data } = await axios.post(`${BASE_URL()}/api/date/barberos/add`, {
            nombre,
            foto: foto || null
        })
        return data.data || null
    } catch (e: any) {
        console.error("addBarbero error:", e.response?.data || e.message)
        return null
    }
}

// PUT /api/date/barberos/:id → actualizar nombre o foto
export async function updateBarbero(id: number | string, payload: { nombre?: string; foto?: string | null }) {
    try {
        const { data } = await axios.put(`${BASE_URL()}/api/date/barberos/${id}`, payload)
        return data.data || null
    } catch (e: any) {
        console.error("updateBarbero error:", e.response?.data || e.message)
        return null
    }
}

// DELETE /api/date/barberos/:id
export async function deleteBarbero(id: number | string): Promise<boolean> {
    try {
        await axios.delete(`${BASE_URL()}/api/date/barberos/${id}`)
        return true
    } catch (e: any) {
        console.error("deleteBarbero error:", e.response?.data || e.message)
        return false
    }
}

// POST /api/date/barberos → legado JSON sentinel (mantener por compatibilidad)
export async function saveBarberosDB(barberos: any[]) {
    try {
        await axios.post(`${BASE_URL()}/api/date/barberos`, { barberos })
    } catch (e) {
        console.error("Error guardando barberos (legado):", e)
    }
}

// ─── HISTORIAL ────────────────────────────────────────────────────────────────

export async function getHistorialCierres() {
    try {
        const { data } = await axios.get(`${BASE_URL()}/api/cierres`);
        return data.data || data || [];
    } catch (error) {
        console.error("Error al obtener historial de cierres:", error);
        return [];
    }
}