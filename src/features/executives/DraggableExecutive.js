import { useDrag, useDrop } from "react-dnd";
import { motion } from "framer-motion";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Image from "next/image";
import IconButton from "@/components/ui/IconButton";

const DEFAULT_PROFILE_IMAGE = "/default-profile.webp";

function DraggableExecutive({
  executive,
  index,
  moveExecutive,
  handleEdit,
  handleDelete,
  session,
}) {
  const [, ref] = useDrag({
    type: "EXECUTIVE",
    item: { index },
  });

  const [, drop] = useDrop({
    accept: "EXECUTIVE",
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveExecutive(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <motion.div
      ref={(node) => ref(drop(node))}
      key={executive._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="bg-gray-800/50 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200"
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-32 h-32 mb-4 relative">
          <Image
            src={executive.imageUrl || DEFAULT_PROFILE_IMAGE}
            alt={executive.name}
            fill
            sizes="128px"
            className="object-cover rounded-full"
          />
        </div>
        <h4 className="text-xl font-semibold text-foreground mb-2">
          {executive.name}
        </h4>
        <p className="text-primary font-medium mb-1">{executive.position}</p>
        <p className="fc-muted mb-4">{executive.major}</p>
        <div className="flex gap-2 relative z-20">
          <IconButton
            variant="edit"
            label="Edit"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(executive);
            }}
          >
            <FiEdit2 />
          </IconButton>
          <IconButton
            variant="danger"
            label="Delete"
            disabled={session?.user?.username == executive.username}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(executive._id);
            }}
          >
            <FiTrash2 />
          </IconButton>
        </div>
      </div>
    </motion.div>
  );
}

export default DraggableExecutive;

