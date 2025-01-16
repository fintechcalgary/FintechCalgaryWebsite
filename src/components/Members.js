import { useState, useEffect } from "react";
import { FiUser, FiEdit2, FiPlus, FiX, FiImage } from "react-icons/fi";
import Modal from "./Modal";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableMember from "./DraggableMember";

export default function Members() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    major: "",
    imageUrl: "",
    username: "",
    password: "",
    role: "member",
    linkedinUrl: "",
    description: "",
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    memberId: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = async () => {
    const response = await fetch("/api/members");
    const data = await response.json();
    setMembers(data);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  if (!isAdmin) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <FiUser className="mx-auto text-4xl text-primary mb-4" />
          <p className="text-gray-400">
            You don&apos;t have permission to manage team members.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (submitting) return;

    try {
      setSubmitting(true);

      if (editingMember) {
        const response = await fetch(`/api/members/${editingMember._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            oldUsername: editingMember.username, // Include old username for reference
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update member");
        }
      } else {
        const response = await fetch("/api/members", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to create member");
        }
      }

      // Reset form and refresh members list
      resetForm();
      fetchMembers();
    } catch (error) {
      console.error("Error:", error);
      alert(error.message); // Display error message
    } finally {
      setSubmitting(false); // Reset submitting state
    }
  };

  const handleDelete = async (memberId) => {
    const memberToDelete = members.find((member) => member._id === memberId);

    if (session?.user?.username === memberToDelete.username) {
      console.log("Cannot delete yourself");
      return;
    }

    setDeleteModal({
      isOpen: true,
      memberId,
    });
  };

  const confirmDelete = async () => {
    const response = await fetch(`/api/members/${deleteModal.memberId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      fetchMembers();
      setDeleteModal({ isOpen: false, memberId: null });
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || "",
      position: member.position || "",
      major: member.major || "",
      imageUrl: member.imageUrl || "",
      username: member.username || "",
      password: "",
      role: member.role || "member",
      linkedinUrl: member.linkedinUrl || "",
      description: member.description || "",
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      position: "",
      major: "",
      imageUrl: "",
      username: "",
      password: "",
      role: "member",
      linkedinUrl: "",
      description: "",
    });
    setEditingMember(null);
    setShowForm(false);
  };

  const moveMember = (fromIndex, toIndex) => {
    const updatedMembers = [...members];
    const [movedMember] = updatedMembers.splice(fromIndex, 1);
    updatedMembers.splice(toIndex, 0, movedMember);
    setMembers(updatedMembers);

    // Call API to save the new order
    saveOrder(updatedMembers);
  };

  const saveOrder = async (updatedMembers) => {
    try {
      const response = await fetch("/api/members/order", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderedMemberIds: updatedMembers.map((member) => member._id),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save the new order");
      }
    } catch (error) {
      console.error("Error saving member order:", error);
      alert("Failed to save the new order. Please try again.");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FiUser className="text-primary" />
            Team Members
          </h3>
          <button
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            {showForm ? <FiX /> : <FiPlus />}
            {showForm ? "Cancel" : "Add"}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-2xl z-[9999]"
                onClick={() => resetForm()}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{
                  duration: 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="fixed inset-0 z-[9999] p-4 flex items-start justify-center overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-full max-w-4xl mx-auto bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-xl flex flex-col my-8">
                  <div className="sticky top-0 z-10 bg-gray-800/90 backdrop-blur-sm p-6 border-b border-gray-700 rounded-t-lg">
                    <h2 className="text-2xl font-semibold text-white">
                      {editingMember ? "Edit Member" : "Add Member"}
                    </h2>
                  </div>

                  <div className="p-6 overflow-y-auto">
                    <form
                      id="memberForm"
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              placeholder="Enter member name"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Position
                            </label>
                            <input
                              type="text"
                              placeholder="Enter position"
                              value={formData.position}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  position: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Major
                            </label>
                            <input
                              type="text"
                              placeholder="Enter major"
                              value={formData.major}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  major: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Username
                            </label>
                            <input
                              placeholder="Enter username address"
                              value={formData.username}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  username: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Password
                            </label>
                            <input
                              type="password"
                              placeholder="Enter password"
                              value={formData.password}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  password: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                              required={!editingMember}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Role
                            </label>
                            <div className="relative">
                              <select
                                value={formData.role}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    role: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 appearance-none"
                                required
                              >
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                              </select>
                              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-xs text-white">
                                ▼
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              LinkedIn URL
                            </label>
                            <input
                              type="url"
                              placeholder="Enter LinkedIn profile URL"
                              value={formData.linkedinUrl}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  linkedinUrl: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Profile Image
                            </label>
                            <div className="flex items-center gap-4">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="imageUpload"
                                required={!formData.imageUrl}
                              />
                              <label
                                htmlFor="imageUpload"
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200
                                ${
                                  uploading
                                    ? "bg-gray-700 text-gray-300"
                                    : "bg-gray-900/50 hover:bg-gray-700 text-white border border-gray-700 hover:border-primary"
                                }`}
                              >
                                <FiImage className="w-5 h-5" />
                                <span>
                                  {uploading ? "Uploading..." : "Choose Image"}
                                </span>
                              </label>
                              {formData.imageUrl && (
                                <div className="relative w-16 h-16 group">
                                  <img
                                    src={formData.imageUrl}
                                    alt="Profile preview"
                                    className="w-full h-full object-cover rounded-full border-2 border-gray-700 group-hover:border-primary transition-colors duration-200"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        imageUrl: "",
                                      }))
                                    }
                                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors duration-200"
                                  >
                                    <FiX size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Description
                            </label>
                            <textarea
                              placeholder="Enter member description"
                              value={formData.description}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  description: e.target.value,
                                })
                              }
                              rows={3}
                              className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>

                  <div className="sticky bottom-0 z-10 bg-gray-800/90 backdrop-blur-sm p-6 border-t border-gray-700 rounded-b-lg">
                    <div className="flex justify-end items-center gap-3">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                        disabled={uploading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="memberForm"
                        disabled={uploading || submitting}
                        className={`bg-primary hover:bg-primary/80 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2
                        ${
                          uploading || submitting
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {editingMember ? (
                          <>
                            <FiEdit2 className="w-4 h-4" />
                            {submitting ? "Updating..." : "Update Member"}
                          </>
                        ) : (
                          <>
                            <FiPlus className="w-4 h-4" />
                            {submitting ? "Adding..." : "Add Member"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member, index) => (
            <DraggableMember
              key={member._id}
              member={member}
              index={index}
              moveMember={moveMember}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              session={session}
            />
          ))}
        </div>

        {members.length === 0 && !showForm && (
          <div className="text-center py-12 bg-gray-800/50 rounded-lg min-h-[400px] flex flex-col items-center justify-center">
            <FiUser className="mx-auto text-4xl text-primary mb-4" />
            <p className="text-gray-400">
              No team members yet. Add your first member!
            </p>
          </div>
        )}

        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, memberId: null })}
          onConfirm={confirmDelete}
          title="Delete Member"
          message="Are you sure you want to remove this member? This action cannot be undone."
          confirmText="Remove Member"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </DndProvider>
  );
}
