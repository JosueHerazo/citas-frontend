import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL

export type Trabajo = {
    id:          number
    titulo:      string
    descripcion: string
    categoria:   string
    tipo:        'image' | 'video'
    url:         string
    barbero:     string
    createdAt:   string
}

export async function getTrabajos(): Promise<Trabajo[]> {
    try {
        const { data } = await axios.get(`${BASE}/api/date/trabajos`)
        return data.data || []
    } catch {
        return []
    }
}

export async function createTrabajo(formData: FormData): Promise<Trabajo> {
    const { data } = await axios.post(`${BASE}/api/date/trabajos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data.data
}

export async function deleteTrabajo(id: number): Promise<void> {
    await axios.delete(`${BASE}/api/date/trabajos/${id}`)
}
