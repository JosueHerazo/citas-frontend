import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Heart, Share2, Send, PlusCircle } from "lucide-react";
import { ActionFunctionArgs, redirect, useLoaderData } from "react-router-dom";
import { addNews, getNews } from "../services/ServiceNews";
import VideoPost from "../components/VideoPost";

export interface NewsItem {
    id: number;
    user: string;
    type: 'image' | 'video';
    url: string;
    description: string;
    likes: number;
    comments: any[];
}

export async function loader() {
    const news = await getNews();
    return news || [];
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    try {
        await addNews(formData);
        return redirect("/nuestras/noticias");
    } catch (error) {
        return "Error al publicar";
    }
}

export default function Noticias() {
    const rawData = useLoaderData();
    const newsData = Array.isArray(rawData) ? (rawData as NewsItem[]) : [];
    
    const [showComments, setShowComments] = useState<number | null>(null);
    const [commentsList, setCommentsList] = useState<any[]>([]);
    const [commentText, setCommentText] = useState("");
    const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
    const [showHeartAnim, setShowHeartAnim] = useState<number | null>(null); // Para el corazón gigante

    const mockFeeds: NewsItem[] = [
        { id: 1, user: "Josue Barber", type: 'video', url: "https://assets.mixkit.co/videos/preview/mixkit-stylist-cutting-hair-of-a-male-client-44432-large.mp4", description: "Corte VIP del día.", likes: 120, comments: [] }
    ];

    const displayFeeds = newsData.length > 0 ? newsData : mockFeeds;

    // Lógica de Doble Tap
    const handleDoubleTap = (postId: number) => {
        setLikedPosts(prev => ({ ...prev, [postId]: true }));
        setShowHeartAnim(postId);
        setTimeout(() => setShowHeartAnim(null), 800); // El corazón desaparece tras 800ms
    };

    return (
        <div className="relative h-[100dvh] w-full bg-black overflow-hidden font-sans">
            
            {/* HEADER FLOTANTE */}
            <div className="fixed top-0 w-full z-50 flex justify-between p-6 items-center bg-gradient-to-b from-black/80 to-transparent">
                <h2 className="text-white font-black text-2xl italic tracking-tighter">LATINOS<span className="text-amber-400">VIP</span></h2>
                <button className="bg-amber-400 p-2 rounded-full text-black shadow-lg active:scale-90 transition-transform">
                    <PlusCircle size={28} />
                </button>
            </div>

            {/* FEED VERTICAL */}
            <div className="h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
                {displayFeeds.map((post) => (
                    <div key={post.id} className="relative h-screen w-full snap-start flex items-center justify-center overflow-hidden">
                        
                        {/* ÁREA DE DOBLE TAP */}
                        <div 
                            className="absolute inset-0 z-10" 
                            onDoubleClick={() => handleDoubleTap(post.id)}
                        />

                        {/* CONTENIDO PRINCIPAL */}
                        {post.type === 'video' ? (
                            <VideoPost url={post.url} />
                        ) : (
                            <img src={post.url} className="h-full w-full object-cover" alt="Feed" />
                        )}

                        {/* ANIMACIÓN DE CORAZÓN GIGANTE (Doble Tap) */}
                        <AnimatePresence>
                            {showHeartAnim === post.id && (
                                <motion.div 
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1.5, opacity: 1 }}
                                    exit={{ scale: 2, opacity: 0 }}
                                    className="absolute z-20 pointer-events-none"
                                >
                                    <Heart size={100} className="text-red-700 fill-current drop-shadow-2xl" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />

                        {/* ACCIONES LATERALES */}
                        <div className="absolute right-4 bottom-32 flex flex-col gap-6 z-30">
                            <button 
                                onClick={() => setLikedPosts(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                                className="flex flex-col items-center group"
                            >
                                <motion.div whileTap={{ scale: 1.4 }}>
                                    <Heart size={38} className={likedPosts[post.id] ? "text-red-500 fill-current" : "text-white"} />
                                </motion.div>
                                <span className="text-white text-xs font-bold mt-1 shadow-black drop-shadow-md">
                                    {post.likes + (likedPosts[post.id] ? 1 : 0)}
                                </span>
                            </button>

                            <button 
                                onClick={() => { setShowComments(post.id); setCommentsList(post.comments || []); }} 
                                className="text-white flex flex-col items-center"
                            >
                                <MessageCircle size={38} />
                                <span className="text-xs font-bold mt-1 drop-shadow-md">{post.comments?.length || 0}</span>
                            </button>

                            <button className="text-white flex flex-col items-center opacity-90">
                                <Share2 size={34} />
                            </button>
                        </div>

                        {/* INFO DEL POST */}
                        <div className="absolute bottom-12 left-4 right-16 text-white z-30 pointer-events-none">
                            <p className="font-black text-lg mb-1 italic drop-shadow-lg">@{post.user}</p>
                            <p className="text-sm opacity-90 line-clamp-2 drop-shadow-md leading-relaxed">{post.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* PANEL DE COMENTARIOS */}
            <AnimatePresence>
                {showComments !== null && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                            onClick={() => setShowComments(null)} 
                            className="fixed inset-0 bg-black/70 z-[70] backdrop-blur-sm" 
                        />
                        <motion.div 
                            initial={{ y: "100%" }} animate={{ y: "35%" }} exit={{ y: "100%" }} 
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-0 z-[80] bg-zinc-900 rounded-t-[2.5rem] p-6 flex flex-col border-t border-white/10"
                        >
                            <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-6" />
                            <div className="flex justify-between items-center text-white mb-6">
                                <span className="font-black text-xl uppercase tracking-widest text-amber-400">Comentarios</span>
                                <X onClick={() => setShowComments(null)} className="cursor-pointer text-zinc-500" />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-5 pb-32 custom-scrollbar">
                                {commentsList.length > 0 ? (
                                    commentsList.map((c, i) => (
                                        <div key={i} className="flex gap-4 items-start animate-fade-in">
                                            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400 font-bold">
                                                {c.userName?.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-zinc-400 text-xs">@{c.userName}</p>
                                                <p className="text-white text-sm mt-0.5 leading-snug">{c.text}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 text-zinc-600 font-medium">No hay comentarios aún.</div>
                                )}
                            </div>

                            <div className="absolute bottom-0 left-0 w-full p-6 bg-zinc-900/95 backdrop-blur-md border-t border-white/5 flex gap-3">
                                <input 
                                    type="text" 
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Añade un comentario..."
                                    className="bg-zinc-800 text-white flex-1 px-5 py-3.5 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-amber-400 transition-all"
                                />
                                <button 
                                    onClick={() => { console.log("Enviado"); setCommentText(""); }}
                                    className="bg-amber-400 text-black px-6 rounded-2xl font-bold active:scale-90 transition-transform flex items-center justify-center"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}