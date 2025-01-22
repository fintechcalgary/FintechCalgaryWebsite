import { useDrag, useDrop } from "react-dnd";
import { motion } from "framer-motion";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Image from "next/image";

const DEFAULT_PROFILE_IMAGE = "/default-profile.webp";

function DraggableMember({
  member,
  index,
  moveMember,
  handleEdit,
  handleDelete,
  session,
}) {
  const [, ref] = useDrag({
    type: "MEMBER",
    item: { index },
  });

  const [, drop] = useDrop({
    accept: "MEMBER",
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveMember(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <motion.div
      ref={(node) => ref(drop(node))}
      key={member._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="bg-gray-800/50 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200"
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-32 h-32 mb-4 relative">
          <Image
            src={member.imageUrl || DEFAULT_PROFILE_IMAGE}
            alt={member.name}
            fill
            sizes="128px"
            className="object-cover rounded-full"
          />
        </div>
        <h4 className="text-xl font-semibold text-foreground mb-2">
          {member.name}
        </h4>
        <p className="text-primary font-medium mb-1">{member.position}</p>
        <p className="text-gray-400 mb-4">{member.major}</p>
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(member)}
            className="text-gray-400 hover:text-primary transition-colors p-2"
            title="Edit"
          >
            <FiEdit2 />
          </button>
          <button
            onClick={() => handleDelete(member._id)}
            className="text-gray-400 hover:text-red-500 transition-colors p-2"
            disabled={session?.user?.email === member.email}
            title="Delete"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default DraggableMember;
