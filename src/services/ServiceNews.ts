import axios from "axios";


// Verifica que el nombre sea exactamente getNews
export async function getNews() {
    try {
        
        const url = `${import.meta.env.DATABASE_URL}/api/news`;
        const { data } = await axios.get(url);
        // Retornamos la data. Si tu backend devuelve { data: [...] }, usa data.data
        return data; 
    } catch (error) {
        console.error("Error al obtener noticias:", error);
        return [];
    }
}

export async function addNews(formData: FormData) {
    try {
        const url = `${import.meta.env.DATABASE_URL}/api/news`;
        const { data } = await axios.post(url, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return data;
    } catch (error) {
        console.error("Error al añadir noticia:", error);
        throw error;
    }
}