"use client";

import { useState, useEffect } from "react";
import { FiUser, FiEdit2, FiPlus, FiX, FiImage } from "react-icons/fi";
import Modal from "./Modal";
import PortalModal from "./PortalModal";
import { useSession } from "next-auth/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableMember from "./DraggableMember";
import Image from "next/image";

const DEFAULT_PROFILE_IMAGE = "/default-profile.webp";

export default function Members() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
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
    memberId: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("All");
  const [availableTeams, setAvailableTeams] = useState(["All"]);

  const fetchMembers = async () => {
    const response = await fetch("/api/members");
    const data = await response.json();
    setMembers(data);

    // Extract unique team names from members
    const uniqueTeams = [
      "All",
      ...new Set(data.map((member) => member.team || "General")),
    ];
    setAvailableTeams(uniqueTeams);
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

      const payload = {
        ...formData,
        imageUrl: formData.imageUrl || DEFAULT_PROFILE_IMAGE,
      };

      if (editingMember) {
        const response = await fetch(`/api/members/${editingMember._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,
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
          body: JSON.stringify(payload),
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
      team: member.team || "",
      position: member.position || "",
      major: member.major || "",
      imageUrl: member.imageUrl || "",
      username: member.username || "",
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
      team: "",
      position: "",
      major: "",
      imageUrl: "",
      username: "",
      role: "member",
      linkedinUrl: "",
      description: "",
    });
    setEditingMember(null);
    setShowForm(false);
  };

  const moveMember = (fromIndex, toIndex) => {
    // 1️⃣ Get the actual member being moved from the filtered list
    const movedMember = filteredMembers[fromIndex];

    // 2️⃣ Get its index in the full members list
    const globalFromIndex = members.findIndex((m) => m._id === movedMember._id);
    const globalToIndex = members.findIndex(
      (m) => m._id === filteredMembers[toIndex]._id
    );

    // 3️⃣ Swap members in the global list
    const updatedMembers = [...members];
    const [movedGlobalMember] = updatedMembers.splice(globalFromIndex, 1);
    updatedMembers.splice(globalToIndex, 0, movedGlobalMember);

    setMembers(updatedMembers);
    saveOrder(updatedMembers);
  };

  const saveOrder = async (updatedMembers) => {
    try {
      await fetch("/api/members/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderedMemberIds: updatedMembers.map((m) => m._id),
        }),
      });
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Failed to save order. Try again.");
    }
  };

  const filteredMembers =
    selectedTeam === "All"
      ? members
      : members.filter((member) => member.team === selectedTeam);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FiUser className="text-primary" />
            Team Members
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
          title={editingMember ? "Edit Member" : "Add Member"}
          maxWidth="max-w-4xl"
        >
          <div className="p-6">
            <form id="memberForm" onSubmit={handleSubmit} className="space-y-4">
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
                      placeholder="Enter member description"
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
                form="memberForm"
                disabled={uploading || submitting}
                className={`bg-primary hover:bg-primary/80 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2
                ${
                  uploading || submitting ? "opacity-50 cursor-not-allowed" : ""
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
        </PortalModal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member, index) => (
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
          <div className="text-center py-12 bg-gray-800/50 rounded-lg min-h-[400px] flex flex-col items-center justify-center animate-fadeIn">
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
