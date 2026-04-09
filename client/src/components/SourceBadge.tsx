/**
 * SourceBadge - small badge indicating the offer source (Pelikán or Kiwi.com)
 */

interface SourceBadgeProps {
  source?: string;
  className?: string;
}

export default function SourceBadge({ source, className = "" }: SourceBadgeProps) {
  if (!source) return null;

  if (source === "pelikan") {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200 ${className}`}
        title="Nabídka od Pelikán.cz"
      >
        🦩 Pelikán
      </span>
    );
  }

  if (source === "kiwi") {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700 border border-teal-200 ${className}`}
        title="Nabídka od Kiwi.com"
      >
        🥝 Kiwi.com
      </span>
    );
  }

  return null;
}
