import { useRef, useState, useEffect } from "react";

interface VideoPostProps {
    url: string;
}

export default function VideoPost({ url }: VideoPostProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [playing, setPlaying] = useState(false);

    // Lógica para auto-play al hacer scroll
    useEffect(() => {
        const options = {
            root: null, // usa el viewport
            threshold: 0.7 // el 70% del video debe ser visible
        };

        const callback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    videoRef.current?.play().catch(() => {});
                    setPlaying(true);
                } else {
                    videoRef.current?.pause();
                    setPlaying(false);
                }
            });
        };

        const observer = new IntersectionObserver(callback, options);
        if (videoRef.current) observer.observe(videoRef.current);

        return () => observer.disconnect();
    }, []);

    const handleVideoClick = () => {
        if (playing) {
            videoRef.current?.pause();
        } else {
            videoRef.current?.play();
        }
        setPlaying(!playing);
    };

    return (
        <div className="relative h-full w-full">
            <video
                ref={videoRef}
                onClick={handleVideoClick}
                src={url}
                className="h-full w-full object-cover"
                loop
                muted // Muted por defecto (política de navegadores)
                playsInline
            />
            {/* Indicador visual de pausa (opcional) */}
            {!playing && (
                <div 
                    onClick={handleVideoClick}
                    className="absolute inset-0 flex items-center justify-center bg-black/20"
                >
                    <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <div className="w-0 h-0 border-y-[10px] border-y-transparent border-l-[15px] border-l-white ml-1" />
                    </div>
                </div>
            )}
        </div>
    );
}