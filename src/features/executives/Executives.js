"use client";

import { useState, useEffect } from "react";
import { FiUser, FiEdit2, FiPlus, FiX, FiImage } from "react-icons/fi";
import Modal from "@/components/ui/Modal/ConfirmModal";
import PortalModal from "@/components/ui/Modal/ContentModal";
import Button from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import DraggableExecutive from "@/features/executives/DraggableExecutive";
import Image from "next/image";
import { uploadFile } from "@/lib/frontend-helpers";
import { UPLOAD_FOLDERS } from "@/lib/constants";
import EmptyState from "@/components/ui/EmptyState";

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
          <p className="fc-muted">
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
      const imageUrl = await uploadFile(file, UPLOAD_FOLDERS.EXECUTIVE_IMAGES);
      setFormData((prev) => ({ ...prev, imageUrl }));
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
    // 1. Get the actual executive being moved from the filtered list
    const movedExecutive = filteredExecutives[fromIndex];

    // 2. Get its index in the full executives list
    const globalFromIndex = executives.findIndex((e) => e._id === movedExecutive._id);
    const globalToIndex = executives.findIndex(
      (e) => e._id === filteredExecutives[toIndex]._id
    );

    // 3. Swap executives in the global list
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
    <div className="min-h-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="fc-title text-2xl flex items-center gap-2">
            <FiUser className="text-primary" />
            Team Executives
          </h3>
          <div className="flex gap-4 items-center">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="form-input"
            >
              {availableTeams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant={showForm ? "cancel" : "primary"}
              onClick={(e) => {
                e.stopPropagation();
                showForm ? resetForm() : setShowForm(true);
              }}
              className="!flex-none !px-4 !py-2"
            >
              {showForm ? <FiX /> : <FiPlus />}
              {showForm ? "Cancel" : "Add"}
            </Button>
          </div>
        </div>

        <PortalModal
          isOpen={showForm}
          onClose={resetForm}
          title={editingExecutive ? "Edit Executive" : "Add Executive"}
          size="lg"
          footer={
            <>
              <Button
                type="button"
                variant="cancel"
                onClick={resetForm}
                disabled={uploading || submitting}
                className="!flex-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="executiveForm"
                variant="primary"
                disabled={uploading || submitting}
                className="!flex-none"
              >
                {editingExecutive ? (
                  <FiEdit2 className="h-4 w-4" />
                ) : (
                  <FiPlus className="h-4 w-4" />
                )}
                {editingExecutive
                  ? submitting
                    ? "Updating..."
                    : "Update Executive"
                  : submitting
                    ? "Adding..."
                    : "Add Executive"}
              </Button>
            </>
          }
        >
          <form
            id="executiveForm"
            onSubmit={handleSubmit}
            className="fc-modal-body space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-4">
                <div>
                  <label className="fc-form-label">
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
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="fc-form-label">
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
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="fc-form-label">
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
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="fc-form-label">
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
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="fc-form-label">
                    Username
                  </label>
                  <input
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        username: e.target.value,
                      })
                    }
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="fc-form-label">
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
                    className="form-input"
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="fc-form-label">
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
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="fc-form-label">
                    Profile Image
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="executiveImageUpload"
                    />
                    <label
                      htmlFor="executiveImageUpload"
                      className={`fc-modal-file-btn ${
                        uploading ? "pointer-events-none opacity-60" : ""
                      }`}
                    >
                      <FiImage className="h-5 w-5" />
                      {uploading ? "Uploading..." : "Choose Image"}
                    </label>
                    {formData.imageUrl ? (
                      <div className="group relative h-16 w-16">
                        <Image
                          src={formData.imageUrl}
                          alt="Profile preview"
                          width={64}
                          height={64}
                          className="h-full w-full rounded-full border-2 border-gray-700 object-cover transition-colors duration-200 group-hover:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              imageUrl: "",
                            }))
                          }
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 hover:bg-red-600 p-1.5 text-white"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className="fc-form-label">
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
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </form>
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
          <EmptyState
            variant="public"
            icon={FiUser}
            minHeightClass="min-h-[400px]"
            className="animate-fadeIn"
          >
            No team executives yet. Add your first executive!
          </EmptyState>
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
  );
}

