import { useDrag, useDrop } from "react-dnd";
import { motion } from "framer-motion";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Image from "next/image";

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
        <p className="text-gray-400 mb-4">{executive.major}</p>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(executive);
            }}
            className="text-gray-400 hover:text-primary transition-all duration-200 p-2 rounded-lg hover:bg-primary/10 hover:scale-105 relative z-20 border border-transparent hover:border-primary/20"
            title="Edit"
          >
            <FiEdit2 />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(executive._id);
            }}
            className="text-gray-400 hover:text-red-500 transition-all duration-200 p-2 rounded-lg hover:bg-red-500/10 hover:scale-105 relative z-20 border border-transparent hover:border-red-500/20"
            disabled={session?.user?.username == executive.username}
            title="Delete"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default DraggableExecutive;

