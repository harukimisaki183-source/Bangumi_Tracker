import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Star, Film, Tv, Sparkles, ArrowUpRight } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";

interface WorkCardProps {
  work: {
    id: number;
    name: string;
    type: string;
    rating: number;
    cover_url: string;
    description: string | null;
    tags: { id: number; name: string }[];
  };
  index?: number;
}

const typeLabels: Record<string, string> = {
  movie: "电影",
  series: "剧集",
  anime: "动漫",
};

const typeGradients: Record<string, string> = {
  movie: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  series: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  anime: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
};

const typeIcons: Record<string, React.ReactNode> = {
  movie: <Film className="w-3 h-3" />,
  series: <Tv className="w-3 h-3" />,
  anime: <Sparkles className="w-3 h-3" />,
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.95,
    filter: "blur(4px)",
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 24,
      mass: 0.8,
      delay: (i % 5) * 0.07,
    },
  }),
};

export default function WorkCard({ work, index = 0 }: WorkCardProps) {
  const accent = useThemeStore((s) => s.accent);
  const isScrapbook = accent === "scrapbook";

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isScrapbook) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const roundedRating = Math.round(work.rating);

  return (
    <motion.div
      className="masonry-item"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      layout
    >
      <Link to={`/works/${work.id}`} className="block group">
        <motion.div
          className={`relative overflow-hidden ${isScrapbook ? "scrapbook-card" : ""}`}
          style={{
            borderRadius: isScrapbook ? "4px" : "var(--radius-card)",
            background: "var(--card-bg)",
            border: isScrapbook ? undefined : "1px solid var(--card-border)",
            boxShadow: isScrapbook ? undefined : "var(--card-shadow)",
            rotateX: isScrapbook ? undefined : rotateX,
            rotateY: isScrapbook ? undefined : rotateY,
            transformPerspective: isScrapbook ? undefined : 800,
            transformStyle: isScrapbook ? undefined : "preserve-3d",
          }}
          whileHover={{
            boxShadow: isScrapbook ? undefined : "var(--card-shadow-hover)",
            y: isScrapbook ? 0 : -4,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Cover image */}
          <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
            <motion.img
              src={work.cover_url}
              alt={work.name}
              className="w-full h-full object-cover"
              style={{ display: "block" }}
              whileHover={{ scale: 1.06 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2NyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2NyIgZmlsbD0iI2Y0ZjRmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE0Ij7lm77niYc8L3RleHQ+PC9zdmc+";
              }}
            />

            {/* Gradient overlay */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 40%, transparent 70%)",
              }}
              initial={{ opacity: 0.4 }}
              whileHover={{ opacity: 0.85 }}
              transition={{ duration: 0.3 }}
            />

            {/* Type badge — scrapbook sticker style or default */}
            {isScrapbook ? (
              <motion.span
                className={`absolute top-3 right-3 scrapbook-sticker scrapbook-sticker-${work.type}`}
                initial={{ x: 10, opacity: 0, rotate: 3 }}
                animate={{ x: 0, opacity: 1, rotate: -3 }}
                transition={{
                  delay: (index % 5) * 0.07 + 0.2,
                  type: "spring",
                  stiffness: 300,
                }}
              >
                {typeIcons[work.type]}
                {typeLabels[work.type]}
              </motion.span>
            ) : (
              <motion.span
                className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 text-white text-xs font-semibold"
                style={{
                  fontFamily: "var(--font-display)",
                  borderRadius: "var(--radius-pill)",
                  background: typeGradients[work.type] || typeGradients.anime,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  delay: (index % 5) * 0.07 + 0.2,
                  type: "spring",
                  stiffness: 300,
                }}
              >
                {typeIcons[work.type]}
                {typeLabels[work.type]}
              </motion.span>
            )}

            {/* Rating badge */}
            <div
              className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 text-xs font-bold"
              style={{
                fontFamily: "var(--font-display)",
                borderRadius: isScrapbook ? "4px" : "var(--radius-pill)",
                background: isScrapbook ? "var(--scrap-paper)" : "rgba(0,0,0,0.5)",
                backdropFilter: isScrapbook ? undefined : "blur(8px)",
                color: isScrapbook ? "var(--scrap-ink)" : "#FBBF24",
                border: isScrapbook ? "1.5px solid var(--border)" : "1px solid rgba(255,255,255,0.1)",
                transform: isScrapbook ? "rotate(2deg)" : undefined,
              }}
            >
              <Star
                className="w-3 h-3"
                style={{
                  fill: isScrapbook ? "var(--star-filled)" : "currentColor",
                  color: "var(--star-filled)",
                }}
              />
              {work.rating.toFixed(1)}
            </div>

            {/* Hover arrow (not in scrapbook mode) */}
            {!isScrapbook && (
              <motion.div
                className="absolute bottom-3 right-3"
                initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                whileHover={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: "var(--accent-gradient)",
                    boxShadow: "0 2px 12px var(--accent-glow)",
                  }}
                >
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Card body */}
          <div className={isScrapbook ? "p-3" : "p-4"}>
            <h3
              className="text-sm font-semibold leading-tight line-clamp-2 mb-1.5"
              style={{
                fontFamily: isScrapbook ? "var(--font-body)" : "var(--font-display)",
                color: "var(--text-primary)",
              }}
            >
              {work.name}
            </h3>

            {work.description && (
              <p
                className="text-xs line-clamp-2 mb-3 leading-relaxed"
                style={{ color: "var(--text-tertiary)" }}
              >
                {work.description}
              </p>
            )}

            {/* Stars */}
            <div className="flex items-center gap-0.5 mb-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5"
                  style={{
                    color: i < roundedRating ? "var(--star-filled)" : "var(--star-empty)",
                    fill: i < roundedRating ? "var(--star-filled)" : "none",
                  }}
                />
              ))}
            </div>

            {/* Tags */}
            {work.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {work.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="badge-pill"
                    style={{
                      background: isScrapbook ? "var(--scrap-highlight)" : "var(--bg-muted)",
                      color: isScrapbook ? "var(--scrap-ink)" : "var(--text-tertiary)",
                      fontSize: "0.65rem",
                      padding: "0.15rem 0.5rem",
                      border: isScrapbook ? "1px dashed var(--border)" : undefined,
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
