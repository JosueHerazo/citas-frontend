import axios from "axios";

// Fíjate bien que empiece con "export async function"
export async function postComment(newsId: number, text: string, userName: string) {
    try {
        const url = `${import.meta.env.VITE_API_URL}/api/news/${newsId}/comments`;
        const { data } = await axios.post(url, { text, userName });
        return data;
    } catch (error) {
        console.error("Error al enviar comentario:", error);
        throw error;
    }
}

// Aprovechamos para exportar la función de Likes aquí mismo
export async function toggleLikeInDB(newsId: number, userId: string) {
    try {
        const url = `${import.meta.env.VITE_API_URL}/api/news/${newsId}/like`;
        const { data } = await axios.post(url, { userId });
        return data; // Retorna si quedó en like o no
    } catch (error) {
        console.error("Error en el like:", error);
    }
}