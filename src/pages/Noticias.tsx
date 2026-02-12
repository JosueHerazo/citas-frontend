import { useState, useEffect } from 'react';
import { useLoaderData, useFetcher } from 'react-router-dom';
import { Heart, MessageCircle, Plus, X, Image as ImageIcon, Film, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoPost from '../components/VideoPost';

export default function Noticias() {
    const fetcher = useFetcher();
    const data = useLoaderData();
    const posts = Array.isArray(data) ? data : [];
    
    const [showUpload, setShowUpload] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userId, setUserId] = useState<string>('');
    
    // Estados para el formulario de subida
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'image' | 'video'>('image');

    useEffect(() => {
        const user = localStorage.getItem("cliente_nombre") || 'Anónimo';
        setUserId(user);
        if (user === "Josue" || user === "AdminVIP") setIsAdmin(true);
    }, []);

    const handleLike = (newsId: number) => {
        fetcher.submit(
            { userId, newsId: newsId.toString(), intent: 'like' }, 
            { method: 'post', action: '/nuestras/noticias' } 
        );
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', description);
        formData.append('clientName', userId);
        formData.append('type', type);
        formData.append('intent', 'create'); // IMPORTANTE

        fetcher.submit(formData, { 
            method: 'post', 
            action: '/nuestras/noticias',
            encType: 'multipart/form-data' 
        });
        
        setShowUpload(false);
        setFile(null);
        setDescription('');
    };

    return (
        <div className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar">
            {/* Botón Admin */}
            {isAdmin && (
                <button 
                    onClick={() => setShowUpload(true)}
                    className="fixed top-6 right-6 z-[100] bg-amber-500 text-black p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
                >
                    <Plus size={32} strokeWidth={3} />
                </button>
            )}

            {/* Lista de Posts */}
            {posts.map((post: any) => (
                <div key={post.id} className="h-screen w-full snap-start relative flex items-center justify-center border-b border-zinc-900">
                    <div className="w-full h-full flex items-center justify-center bg-zinc-950">
                        {post.type === 'video' ? <VideoPost url={post.url} /> : <img src={post.url} className="h-full w-full object-contain" />}
                    </div>
                    
                    <div className="absolute right-4 bottom-32 flex flex-col gap-6 z-30 items-center">
                        <div className="flex flex-col items-center">
                            <motion.button 
                                whileTap={{ scale: 0.8 }}
                                onClick={() => handleLike(post.id)}
                                className={`p-3 rounded-full ${post.likes_list?.some((l: any) => l.userId === userId) ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800/50 text-white'}`}
                            >
                                <Heart size={28} fill={post.likes_list?.some((l: any) => l.userId === userId) ? "currentColor" : "none"} />
                            </motion.button>
                            <span className="text-white text-xs font-bold mt-1">{post.likes_list?.length || 0}</span>
                        </div>
                    </div>
                </div>
            ))}

            {/* Modal de Subida */}
            <AnimatePresence>
                {showUpload && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4">
                        <div className="bg-zinc-900 w-full max-w-md rounded-3xl p-6 border border-zinc-800">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-amber-500 uppercase">Nueva Noticia</h2>
                                <button onClick={() => setShowUpload(false)}><X className="text-white" /></button>
                            </div>

                            <form onSubmit={handleUpload} className="space-y-4">
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setType('image')} className={`flex-1 p-3 rounded-xl flex items-center justify-center gap-2 ${type === 'image' ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-white'}`}><ImageIcon size={20}/> Foto</button>
                                    <button type="button" onClick={() => setType('video')} className={`flex-1 p-3 rounded-xl flex items-center justify-center gap-2 ${type === 'video' ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-white'}`}><Film size={20}/> Video</button>
                                </div>

                                <input type="file" accept={type === 'image' ? "image/*" : "video/*"} onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-zinc-400" />
                                
                                <textarea 
                                    placeholder="¿Qué está pasando en la barbería?"
                                    className="w-full bg-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 h-32"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />

                                <button 
                                    type="submit" 
                                    disabled={fetcher.state === 'submitting'}
                                    className="w-full bg-amber-500 text-black font-bold p-4 rounded-xl flex items-center justify-center gap-2"
                                >
                                    {fetcher.state === 'submitting' ? <Loader2 className="animate-spin" /> : 'PUBLICAR AHORA'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- FUNCIONES FUERA DEL COMPONENTE ---

export async function loader() {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/news`);
        const data = await response.json();
        return data.data || data;
    } catch { return []; }
}

export async function action({ request }: { request: Request }) {
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === 'like') {
        const userId = formData.get("userId");
        const newsId = formData.get("newsId");
        await fetch(`${import.meta.env.VITE_API_URL}/api/news/${newsId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
    }

    if (intent === 'create') {
        // Para subir archivos, enviamos el FormData directamente al backend
        await fetch(`${import.meta.env.VITE_API_URL}/api/news`, {
            method: 'POST',
            body: formData // El backend recibirá el multer 'file' y los otros campos
        });
    }

    return null;
}