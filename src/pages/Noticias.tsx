// pages/Noticias.tsx
import { useState } from 'react';
import { useLoaderData, Form, ActionFunctionArgs } from 'react-router-dom';
import { Heart, MessageCircle, PlusCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoPost from '../components/VideoPost';
import { addNews, getNews } from '../services/ServiceNews';
import { postComment, toggleLikeInDB } from '../services/ServiceComments';

// Definimos una interfaz mínima para los posts (puedes expandirla según tu modelo real)
interface NewsPost {
  id: number;
  clientName: string;
  description: string;
  url: string;
  type: 'image' | 'video';
  likes: number;
  comments?: Array<{ userName: string; text: string }>;
  liked?: boolean; // opcional: si ya le dio like el usuario actual
}

export const loader = async () => {
  try {
    return (await getNews()) as NewsPost[];
  } catch (error) {
    console.error("Error al cargar las noticias:", error);
    return [];
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  try {
    await addNews(formData);
    return { success: true };
  } catch (error) {
    return { error: 'Error al publicar' };
  }
};

export default function Noticias() {
  const posts = useLoaderData() as NewsPost[] || [];
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);
  const [comment, setComment] = useState<string>('');
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLike = async (postId: number) => {
    try {
      const userId = localStorage.getItem('userId') || 'anonymous';
      await toggleLikeInDB(postId, userId);
      // Refrescamos para ver el cambio (puedes optimizar con estado local después)
      window.location.reload();
    } catch (err) {
      setError('Error al dar like');
    }
  };

  const handleComment = async (postId: number) => {
    if (!comment.trim()) return;

    try {
      const userName = localStorage.getItem('userName') || 'Anonymous';
      await postComment(postId, comment, userName);
      setComment('');
      window.location.reload();
    } catch (err) {
      setError('Error al comentar');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Botón para abrir modal de subida */}
      <button
        onClick={() => setShowUpload(true)}
        className="fixed bottom-6 right-6 bg-amber-500 p-4 rounded-full shadow-lg z-50"
      >
        <PlusCircle size={28} />
      </button>

      {/* Modal de subida */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Subir Noticia</h2>
                <X
                  onClick={() => setShowUpload(false)}
                  className="cursor-pointer text-white hover:text-amber-400"
                  size={24}
                />
              </div>

              <Form
                method="post"
                encType="multipart/form-data"
                // Cerramos modal al enviar (puedes mejorar con estado de carga)
                onSubmit={() => setTimeout(() => setShowUpload(false), 300)}
                className="space-y-4"
              >
                <input
                  type="file"
                  name="file"
                  accept="image/*,video/*"
                  required
                  className="w-full p-2 bg-zinc-800 rounded text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-black hover:file:bg-amber-400"
                />
                <textarea
                  name="description"
                  placeholder="¿Qué quieres compartir hoy?..."
                  className="w-full bg-zinc-800 p-3 rounded-xl min-h-[100px] text-white resize-y focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <input
                  type="hidden"
                  name="clientName"
                  value={localStorage.getItem('userName') || 'Anonymous'}
                />
                <button
                  type="submit"
                  className="bg-amber-500 text-black py-3 rounded-xl w-full font-bold hover:bg-amber-400 transition-colors"
                >
                  Publicar
                </button>
              </Form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feed de publicaciones */}
      <div className="space-y-8 pb-20">
        {posts.map((post) => (
          <div key={post.id} className="bg-zinc-900 rounded-2xl p-5 shadow-lg">
            <p className="font-bold text-amber-500 mb-1">@{post.clientName}</p>
            <p className="text-gray-200 mb-3">{post.description}</p>

            {post.type === 'video' ? (
              <VideoPost url={post.url} />
            ) : (
              <img
                src={post.url}
                alt="Publicación"
                className="w-full rounded-lg object-cover max-h-[500px]"
              />
            )}

            <div className="flex gap-6 mt-4">
              <button
                onClick={() => handleLike(post.id)}
                className="flex items-center gap-2 text-gray-300 hover:text-red-400 transition-colors"
              >
                <Heart
                  className={post.liked ? 'fill-red-500 text-red-500' : ''}
                  size={24}
                />
                <span>{post.likes}</span>
              </button>

              <button
                onClick={() => setSelectedPost(post)}
                className="flex items-center gap-2 text-gray-300 hover:text-amber-400 transition-colors"
              >
                <MessageCircle size={24} />
                <span>{post.comments?.length || 0}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de comentarios */}
      {selectedPost && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-x-0 bottom-0 bg-zinc-900 p-6 rounded-t-3xl max-h-[85vh] overflow-y-auto z-40 border-t border-zinc-700"
        >
          <div className="relative">
            <X
              onClick={() => setSelectedPost(null)}
              className="absolute top-0 right-0 cursor-pointer text-gray-400 hover:text-white"
              size={28}
            />
            <h3 className="text-xl font-bold mb-5 text-center">Comentarios</h3>

            <div className="space-y-4 mb-6">
              {selectedPost.comments?.length ? (
                selectedPost.comments.map((c, i) => (
                  <div key={i} className="bg-zinc-800 p-3 rounded-xl">
                    <span className="font-semibold text-amber-400">@{c.userName}</span>
                    <p className="text-gray-200 mt-1">{c.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Sé el primero en comentar
                </p>
              )}
            </div>

            <div className="flex gap-2 sticky bottom-0 bg-zinc-900 pt-4 border-t border-zinc-700">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 bg-zinc-800 p-3 rounded-l-xl text-white outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={() => handleComment(selectedPost.id)}
                disabled={!comment.trim()}
                className="bg-amber-500 text-black px-5 rounded-r-xl font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}