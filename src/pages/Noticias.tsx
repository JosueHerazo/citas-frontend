// pages/Noticias.tsx
import { useState } from 'react';
import { useLoaderData, Form } from 'react-router-dom';
import { Heart, MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoPost from '../components/VideoPost';
// import { NewsPost } from '../types'; // Asegúrate de tener esta interfaz o usa 'any' temporalmente
// Agrega esta importación al inicio si no la tienes
import { getNews, addNews } from '../services/ServiceNews'; 
import {useFetcher } from 'react-router-dom';

// Esta es la función que te faltaba exportar
export const loader = async () => {
  try {
    const response = await getNews();
        return response; // Esto devuelve el { success: true, data: [...] }
    } catch (error) {
        return { success: false, data: [] };
    }
};

// También exportamos el action para que el formulario de subida funcione
// 2. EL ACTION (Corregido el error de 'request' y 'postId')
export const action = async ({ request }: { request: Request }) => {
    const formData = await request.formData();
    const intent = formData.get("intent");

    try {
        if (intent === "comment") {
            // const postId = formData.get("postId");
            // const text = formData.get("text");
            // Aquí DEBES llamar a tu API real:
            // await addComment({ postId, text, userName: 'Usuario' }); 
            return { success: true };
        }

        if (intent === "like") {
            // const postId = formData.get("postId");
            // await toggleLike(postId);
            return { success: true };
        }
        
        // Si no hay intent, es la subida de imagen/video
        await addNews(formData);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};
export default function Noticias() {
    const fetcher = useFetcher();
    const response = useLoaderData() as any;
    const posts = response?.data || response || [];
    
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [newComment, setNewComment] = useState("");

    return (
        <div className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar">
            {/* Botón Flotante para Subir */}

            {posts.length > 0 ? (
                posts.map((post: any) => (
                    <div 
                        key={post.id} 
                        className="h-screen w-full snap-start relative flex items-center justify-center border-b border-zinc-900"
                    >
                        {/* CONTENIDO MEDIA */}
                        <div className="w-full h-full flex items-center justify-center bg-zinc-950">
                            {post.type === 'video' ? (
                                <VideoPost url={post.url} />
                            ) : (
                                <img src={post.url} className="h-full w-full object-contain" alt="Publicación" />
                            )}
                        </div>

                        {/* OVERLAY DE INFORMACIÓN */}
                        <div className="absolute bottom-20 left-4 z-20 text-white max-w-[80%] pointer-events-none">
                            <h3 className="font-bold text-lg text-amber-500 drop-shadow-lg italic">
                                @{post.clientName || 'Usuario'}
                            </h3>
                            <p className="text-sm mt-2 leading-tight drop-shadow-md">
                                {post.description || 'Sin descripción'}
                            </p>
                        </div>

                        {/* ACCIONES LATERALES */}
                        <div className="absolute right-4 bottom-32 flex flex-col gap-6 z-30">
                           <div className="flex flex-col items-center gap-1">
                      <fetcher.Form method="post"> {/* Quitamos el action="/noticias/like..." */}
                        <input type="hidden" name="intent" value="like" />
                        <input type="hidden" name="postId" value={post.id} />
                        <button type="submit" className="bg-zinc-800/50 p-3 rounded-full hover:bg-zinc-700 transition-colors">
                            <Heart size={28} className={post.likes > 0 ? "fill-red-500 text-red-500" : "text-white"} />
                        </button>
                    </fetcher.Form>
                            <span className="text-xs font-semibold">{post.likes || 0}</span>
                        </div>

                            <div className="flex flex-col items-center gap-1">
                                <button 
                                    onClick={() => setSelectedPost(post)}
                                    className="bg-zinc-800/50 p-3 rounded-full hover:bg-zinc-700 transition-colors"
                                >
                                    <MessageCircle size={28} className="text-white" />
                                </button>
                                <span className="text-xs font-semibold">{post.comments?.length || 0}</span>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                    <p>No hay noticias disponibles.</p>
                </div>
            )}

            {/* --- MODAL DE COMENTARIOS (Aquí es donde se lee selectedPost) --- */}
            <AnimatePresence>
                {selectedPost && (
                    <>
                        {/* Fondo oscuro detrás del modal */}
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedPost(null)}
                            className="fixed inset-0 bg-black/60 z-[70]"
                        />
                        <motion.div 
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-x-0 bottom-0 bg-zinc-900 z-[80] rounded-t-3xl p-6 max-h-[70vh] flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                                <h3 className="font-bold text-lg italic text-amber-500">Comentarios</h3>
                                <X onClick={() => setSelectedPost(null)} className="cursor-pointer text-zinc-400" />
                            </div>

                            {/* Lista de comentarios */}
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4 no-scrollbar">
                                {selectedPost.comments?.length > 0 ? (
                                    selectedPost.comments.map((c: any, i: number) => (
                                        <div key={i} className="bg-zinc-800/40 p-3 rounded-xl">
                                            <p className="text-amber-500 text-xs font-bold mb-1">@{c.userName}</p>
                                            <p className="text-sm text-zinc-200">{c.text}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-zinc-500 text-sm py-10">Aún no hay comentarios. ¡Sé el primero!</p>
                                )}
                            </div>

                            {/* Input para comentar */}
                           <fetcher.Form method="post" className="flex gap-2 items-center border-t border-zinc-800 pt-4">
                                    {/* Campos ocultos para el action */}
                                    <input type="hidden" name="intent" value="comment" />
                                    <input type="hidden" name="postId" value={selectedPost.id} />
                                    
                                    <input 
                                        name="text" // IMPORTANTE: El name debe coincidir con formData.get("text")
                                        type="text" 
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Escribe un comentario..."
                                        className="flex-1 bg-zinc-800 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-amber-500"
                                    />
                                    <button type="submit" className="bg-amber-500 p-2 rounded-full text-black">
                                        <Send size={18} />
                                    </button>
                                </fetcher.Form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* MODAL DE SUBIDA (Igual que antes) */}
            <AnimatePresence>
                {showUpload && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
                    >
                        <div className="bg-zinc-900 w-full max-w-md p-6 rounded-2xl relative border border-zinc-800">
                            <X onClick={() => setShowUpload(false)} className="absolute top-4 right-4 cursor-pointer text-zinc-400" />
                            <h2 className="text-xl font-bold mb-4 italic text-amber-500">Nueva Publicación</h2>
                            <Form method="post" 
                            encType="multipart/form-data" 
                            onSubmit={() => setShowUpload(false)} className="space-y-4">
                                <input type="file" name="file" accept="image/*,video/*" required className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-amber-500 file:text-black" 
                                key={Date.now()}/>
                                <textarea name="description" placeholder="¿Qué estás pensando?" className="w-full bg-zinc-800 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 outline-none h-24 text-sm" />
                                <button type="submit" className="w-full bg-amber-500 text-black font-bold py-3 rounded-xl hover:bg-amber-400 transition-colors">Publicar</button>
                            </Form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}