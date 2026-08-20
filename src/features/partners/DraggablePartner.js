import { useDrag, useDrop } from "react-dnd";
import { motion } from "framer-motion";
import { FiEdit2, FiTrash2, FiDownload, FiGlobe, FiImage } from "react-icons/fi";
import Image from "next/image";
import { GlowCard } from "@/components/ui/spotlight-card";

function DraggablePartner({
  partner,
  index,
  movePartner,
  onDragEnd,
  onEdit,
  onDelete,
  onDownloadLogo,
}) {
  const [, ref] = useDrag({
    type: "PARTNER",
    item: () => ({ id: partner._id }),
    end: () => onDragEnd?.(),
  });

  const [, drop] = useDrop({
    accept: "PARTNER",
    hover: (draggedItem) => {
      if (!draggedItem.id || draggedItem.id === partner._id) return;
      movePartner(draggedItem.id, index);
    },
  });

  return (
    <motion.div
      ref={(node) => ref(drop(node))}
      key={partner._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <GlowCard
        customSize
        color={partner.color || undefined}
        glowColor="purple"
        className="flex h-full w-full flex-col !gap-0 !p-4 sm:!p-6"
      >
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {partner.logo ? (
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                  <Image
                    src={partner.logo}
                    alt={partner.name ? `${partner.name} logo` : "Partner logo"}
                    fill
                    sizes="(max-width: 640px) 48px, 56px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${partner.color || "#8b5cf6"}20`,
                    borderColor: `${partner.color || "#8b5cf6"}50`,
                    borderWidth: "1px",
                  }}
                >
                  <FiImage
                    className="text-lg sm:text-xl"
                    style={{ color: partner.color || "#8b5cf6" }}
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="fc-title text-base sm:text-lg truncate">
                  {partner.name}
                </h3>
                {partner.website && (
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fc-link text-xs truncate block"
                  >
                    <FiGlobe className="inline w-3 h-3 mr-1" />
                    Website
                  </a>
                )}
              </div>
            </div>
            <div className="flex gap-1 sm:gap-2 flex-shrink-0">
              {partner.logo && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadLogo(partner);
                  }}
                  className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all touch-manipulation"
                  title="Download logo"
                >
                  <FiDownload className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(partner);
                }}
                className="p-1.5 sm:p-2 rounded-xl text-gray-400 hover:text-primary hover:bg-primary/10 transition-all touch-manipulation"
                title="Edit"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(partner);
                }}
                className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all touch-manipulation"
                title="Delete"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {partner.description && (
            <p className="fc-body line-clamp-3 mb-3 sm:mb-4 flex-grow">
              {partner.description}
            </p>
          )}
        </div>
      </GlowCard>
    </motion.div>
  );
}

export default DraggablePartner;
