"use client";

import { useState, useEffect } from "react";
import { FiUser, FiEdit2, FiPlus, FiX, FiImage } from "react-icons/fi";
import Modal from "./Modal";
import PortalModal from "./PortalModal";
import { useSession } from "next-auth/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableExecutive from "./DraggableExecutive";
import Image from "next/image";

const DEFAULT_PROFILE_IMAGE = "/default-profile.webp";

export default function Executives() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [executives, setExecutives] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExecutive, setEditingExecutive] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    team: "",
    position: "",
    major: "",
    imageUrl: "",
    username: "",
    role: "member",
    linkedinUrl: "",
    description: "",
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    executiveId: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("All");
  const [availableTeams, setAvailableTeams] = useState(["All"]);

  const fetchExecutives = async () => {
    const response = await fetch("/api/executives");
    const data = await response.json();
    setExecutives(data);

    // Extract unique team names from executives
    const uniqueTeams = [
      "All",
      ...new Set(data.map((executive) => executive.team || "General")),
    ];
    setAvailableTeams(uniqueTeams);
  };

  useEffect(() => {
    fetchExecutives();
  }, []);

  if (!isAdmin) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <FiUser className="mx-auto text-4xl text-primary mb-4" />
          <p className="text-gray-400">
            You don&apos;t have permission to manage team executives.
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

      const payload = {
        ...formData,
        imageUrl: formData.imageUrl || DEFAULT_PROFILE_IMAGE,
      };

      if (editingExecutive) {
        const response = await fetch(`/api/executives/${editingExecutive._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,
            oldUsername: editingExecutive.username, // Include old username for reference
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update executive");
        }
      } else {
        const response = await fetch("/api/executives", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to create executive");
        }
      }

      // Reset form and refresh executives list
      resetForm();
      fetchExecutives();
    } catch (error) {
      console.error("Error:", error);
      alert(error.message); // Display error message
    } finally {
      setSubmitting(false); // Reset submitting state
    }
  };

  const handleDelete = async (executiveId) => {
    const executiveToDelete = executives.find((executive) => executive._id === executiveId);

    if (session?.user?.username === executiveToDelete.username) {
      console.log("Cannot delete yourself");
      return;
    }

    setDeleteModal({
      isOpen: true,
      executiveId,
    });
  };

  const confirmDelete = async () => {
    const response = await fetch(`/api/executives/${deleteModal.executiveId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      fetchExecutives();
      setDeleteModal({ isOpen: false, executiveId: null });
    }
  };

  const handleEdit = (executive) => {
    setEditingExecutive(executive);
    setFormData({
      name: executive.name || "",
      team: executive.team || "",
      position: executive.position || "",
      major: executive.major || "",
      imageUrl: executive.imageUrl || "",
      username: executive.username || "",
      role: executive.role || "member",
      linkedinUrl: executive.linkedinUrl || "",
      description: executive.description || "",
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
      team: "",
      position: "",
      major: "",
      imageUrl: "",
      username: "",
      role: "member",
      linkedinUrl: "",
      description: "",
    });
    setEditingExecutive(null);
    setShowForm(false);
  };

  const moveExecutive = (fromIndex, toIndex) => {
    // 1️⃣ Get the actual executive being moved from the filtered list
    const movedExecutive = filteredExecutives[fromIndex];

    // 2️⃣ Get its index in the full executives list
    const globalFromIndex = executives.findIndex((e) => e._id === movedExecutive._id);
    const globalToIndex = executives.findIndex(
      (e) => e._id === filteredExecutives[toIndex]._id
    );

    // 3️⃣ Swap executives in the global list
    const updatedExecutives = [...executives];
    const [movedGlobalExecutive] = updatedExecutives.splice(globalFromIndex, 1);
    updatedExecutives.splice(globalToIndex, 0, movedGlobalExecutive);

    setExecutives(updatedExecutives);
    saveOrder(updatedExecutives);
  };

  const saveOrder = async (updatedExecutives) => {
    try {
      await fetch("/api/executives/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderedExecutiveIds: updatedExecutives.map((e) => e._id),
        }),
      });
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Failed to save order. Try again.");
    }
  };

  const filteredExecutives =
    selectedTeam === "All"
      ? executives
      : executives.filter((executive) => executive.team === selectedTeam);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FiUser className="text-primary" />
            Team Executives
          </h3>
          <div className="flex gap-4 items-center">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="bg-gray-900 text-white border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {availableTeams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>

            <button
              onClick={(e) => {
                e.stopPropagation();
                showForm ? resetForm() : setShowForm(true);
              }}
              className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
            >
              {showForm ? <FiX /> : <FiPlus />}
              {showForm ? "Cancel" : "Add"}
            </button>
          </div>
        </div>

        <PortalModal
          isOpen={showForm}
          onClose={resetForm}
          title={editingExecutive ? "Edit Executive" : "Add Executive"}
          maxWidth="max-w-4xl"
        >
          <div className="p-6">
            <form id="executiveForm" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter executive name"
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
                      Team
                    </label>
                    <input
                      type="text"
                      placeholder="Enter team"
                      value={formData.team}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          team: e.target.value,
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
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
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
                          <Image
                            src={formData.imageUrl}
                            alt="Profile preview"
                            width={64}
                            height={64}
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
                      placeholder="Enter executive description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={7}
                      className="form-input scrollbar-thin scrollbar-track-gray-900/50 scrollbar-thumb-gray-500/50 hover:scrollbar-thumb-gray-400/80"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="sticky bottom-0 z-10 bg-gray-800/90 backdrop-blur-sm p-6 border-t border-gray-700/50">
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
                form="executiveForm"
                disabled={uploading || submitting}
                className={`bg-primary hover:bg-primary/80 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2
                ${
                  uploading || submitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {editingExecutive ? (
                  <>
                    <FiEdit2 className="w-4 h-4" />
                    {submitting ? "Updating..." : "Update Executive"}
                  </>
                ) : (
                  <>
                    <FiPlus className="w-4 h-4" />
                    {submitting ? "Adding..." : "Add Executive"}
                  </>
                )}
              </button>
            </div>
          </div>
        </PortalModal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredExecutives.map((executive, index) => (
            <DraggableExecutive
              key={executive._id}
              executive={executive}
              index={index}
              moveExecutive={moveExecutive}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              session={session}
            />
          ))}
        </div>

        {executives.length === 0 && !showForm && (
          <div className="text-center py-12 bg-gray-800/50 rounded-lg min-h-[400px] flex flex-col items-center justify-center animate-fadeIn">
            <FiUser className="mx-auto text-4xl text-primary mb-4" />
            <p className="text-gray-400">
              No team executives yet. Add your first executive!
            </p>
          </div>
        )}

        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, executiveId: null })}
          onConfirm={confirmDelete}
          title="Delete Executive"
          message="Are you sure you want to remove this executive? This action cannot be undone."
          confirmText="Remove Executive"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </DndProvider>
  );
}

