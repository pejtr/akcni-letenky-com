import * as React from "react";
import { Film, Image as ImageIcon, Volume2, VolumeX, Play, Pause } from "lucide-react";

const HERO_IMAGES = [
  {
    url: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/eCOBWuKXQQSEMeXG.jpg",
    alt: "Tropická pláž s palmami",
  },
  {
    url: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/dvtWnJVBDDqkDLtN.jpg",
    alt: "Santorini při západu slunce",
  },
  {
    url: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/CvGyrdNZEWzYGvvk.jpg",
    alt: "Dubaj panorama",
  },
  {
    url: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/OCtenHRMrNgwEHXh.jpg",
    alt: "Maledivy overwater bungalovy",
  },
  {
    url: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/rXhvUdFAyBvTwLAI.jpg",
    alt: "Paříž Eiffelova věž při západu slunce",
  },
];

const HERO_VIDEO_SRC = "/videos/bruslime-rychle-a-sexy.mp4";
const INTERVAL_MS = 6000;
const TRANSITION_MS = 1500;

export default function HeroBackgroundSlideshow() {
  const [mediaMode, setMediaMode] = React.useState<"video" | "slideshow">("video");
  const [videoLoaded, setVideoLoaded] = React.useState(false);
  const [videoPlaying, setVideoPlaying] = React.useState(true);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [nextIndex, setNextIndex] = React.useState(1);
  const [transitioning, setTransitioning] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Preload fallback images
  React.useEffect(() => {
    HERO_IMAGES.forEach((img) => {
      const image = new Image();
      image.src = img.url;
    });
  }, []);

  // Attempt video autoplay on mount
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().then(() => {
      setVideoPlaying(true);
      setVideoLoaded(true);
    }).catch(() => {
      // Autoplay failed or low-power mode, fallback smoothly to slideshow
      console.log("[HeroVisual] Autoplay prevented or unavailable, fallback to slides");
      setMediaMode("slideshow");
    });
  }, []);

  // Slideshow interval (active if in slideshow mode or while video is loading)
  React.useEffect(() => {
    if (mediaMode !== "slideshow") return;

    const timer = setInterval(() => {
      setTransitioning(true);
      const next = (currentIndex + 1) % HERO_IMAGES.length;
      setNextIndex(next);

      setTimeout(() => {
        setCurrentIndex(next);
        setTransitioning(false);
      }, TRANSITION_MS);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [mediaMode, currentIndex]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (videoPlaying) {
      video.pause();
      setVideoPlaying(false);
    } else {
      video.play().then(() => setVideoPlaying(true));
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Background Image Layer (Always present as instant poster/fallback) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${HERO_IMAGES[currentIndex].url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          animation: "heroSlowZoom 14s ease-in-out infinite alternate",
        }}
        role="img"
        aria-label={HERO_IMAGES[currentIndex].alt}
      />

      {/* Next image for slideshow crossfade */}
      {mediaMode === "slideshow" && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${HERO_IMAGES[nextIndex].url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: transitioning ? 1 : 0,
            transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
            animation: "heroSlowZoom 14s ease-in-out infinite alternate",
          }}
          role="img"
          aria-label={HERO_IMAGES[nextIndex].alt}
        />
      )}

      {/* High-Octane Cinematic Video Layer */}
      {mediaMode === "video" && (
        <video
          ref={videoRef}
          src={HERO_VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 transform-gpu ${
            videoLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
          style={{
            filter: "contrast(1.06) brightness(0.92) saturate(1.18)",
          }}
        />
      )}

      {/* Luxury Cinematic Glass Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-slate-950/65 z-[1]" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60 z-[1] mix-blend-multiply" />

      {/* Visual Badge & Controls (Bottom Right - pointer events enabled for buttons) */}
      <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold text-white/90 shadow-xl">
          {mediaMode === "video" ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="tracking-wide">Live Visual Flow</span>
              <button
                onClick={togglePlay}
                className="ml-1 p-1 hover:bg-white/20 rounded-full transition-colors"
                title={videoPlaying ? "Pozastavit video" : "Pustit video"}
              >
                {videoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <button
                onClick={() => setMediaMode("slideshow")}
                className="p-1 hover:bg-white/20 rounded-full transition-colors text-white/70 hover:text-white"
                title="Přepnout na foto galerii"
              >
                <ImageIcon className="w-3 h-3" />
              </button>
            </>
          ) : (
            <>
              <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
              <span className="tracking-wide">Destinace</span>
              <button
                onClick={() => setMediaMode("video")}
                className="ml-1 flex items-center gap-1 px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-[11px] font-bold transition-all shadow-md"
                title="Aktivovat živé video"
              >
                <Film className="w-3 h-3" /> Video
              </button>
            </>
          )}
        </div>
      </div>

      {/* Slide Indicators for Slideshow mode */}
      {mediaMode === "slideshow" && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 pointer-events-auto">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (i !== currentIndex) {
                  setNextIndex(i);
                  setTransitioning(true);
                  setTimeout(() => {
                    setCurrentIndex(i);
                    setTransitioning(false);
                  }, TRANSITION_MS);
                }
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "bg-white scale-125 shadow-lg shadow-white/50"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Zobrazit obrázek ${i + 1}`}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes heroSlowZoom {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.08);
          }
        }
      `}</style>
    </div>
  );
}

