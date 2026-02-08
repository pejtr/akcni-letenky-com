import * as React from "react";

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

const INTERVAL_MS = 6000; // 6 seconds per image
const TRANSITION_MS = 1500; // 1.5s crossfade

export default function HeroBackgroundSlideshow() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [nextIndex, setNextIndex] = React.useState(1);
  const [transitioning, setTransitioning] = React.useState(false);

  React.useEffect(() => {
    // Preload all images
    HERO_IMAGES.forEach((img) => {
      const image = new Image();
      image.src = img.url;
    });
  }, []);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTransitioning(true);
      const next = (currentIndex + 1) % HERO_IMAGES.length;
      setNextIndex(next);

      // After transition completes, swap
      setTimeout(() => {
        setCurrentIndex(next);
        setTransitioning(false);
      }, TRANSITION_MS);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <>
      {/* Current image (always visible) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${HERO_IMAGES[currentIndex].url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          animation: "heroSlowZoom 12s ease-in-out infinite alternate",
        }}
        role="img"
        aria-label={HERO_IMAGES[currentIndex].alt}
      />

      {/* Next image (fades in during transition) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${HERO_IMAGES[nextIndex].url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: transitioning ? 1 : 0,
          transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
          animation: "heroSlowZoom 12s ease-in-out infinite alternate",
        }}
        role="img"
        aria-label={HERO_IMAGES[nextIndex].alt}
      />

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
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
                ? "bg-white scale-125 shadow-lg"
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Zobrazit obrázek ${i + 1}`}
          />
        ))}
      </div>

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
    </>
  );
}
