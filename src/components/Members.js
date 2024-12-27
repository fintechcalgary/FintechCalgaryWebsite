import { useState, useEffect } from "react";
import {
  FiUser,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiX,
  FiImage,
} from "react-icons/fi";
import Modal from "./Modal";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    major: "",
    imageUrl: "",
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    memberId: null,
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const response = await fetch("/api/members");
    const data = await response.json();
    setMembers(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingMember
      ? `/api/members/${editingMember._id}`
      : "/api/members";
    const response = await fetch(url, {
      method: editingMember ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      setFormData({ name: "", position: "", major: "", imageUrl: "" });
      setShowForm(false);
      setEditingMember(null);
      fetchMembers();
    }
  };

  const handleDelete = async (memberId) => {
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
      name: member.name,
      position: member.position,
      major: member.major,
      imageUrl: member.imageUrl,
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

  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-4">
          <FiUser className="text-primary" />
          Team Members
        </h3>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingMember(null);
            setFormData({ name: "", position: "", major: "", imageUrl: "" });
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          {showForm ? <FiX /> : <FiPlus />}
          {showForm ? "Cancel" : "Add Member"}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="flex flex-col bg-gray-800/90 backdrop-blur-sm rounded-lg p-8 space-y-6 border border-gray-700/50 shadow-xl w-full max-w-3xl relative">
            <form onSubmit={handleSubmit} className="flex-1 space-y-6">
              <h2 className="text-2xl font-semibold text-white">
                {editingMember ? "Edit Member" : "Add Member"}
              </h2>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Enter member name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">
                  Position
                </label>
                <input
                  type="text"
                  placeholder="Enter position"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">
                  Major
                </label>
                <input
                  type="text"
                  placeholder="Enter major"
                  value={formData.major}
                  onChange={(e) =>
                    setFormData({ ...formData, major: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Profile Picture
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
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
                ${
                  uploading
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-900/50 hover:bg-gray-700 text-white border border-gray-700 hover:border-primary"
                }`}
                  >
                    <FiImage className="w-5 h-5" />
                    <span>{uploading ? "Uploading..." : "Choose Image"}</span>
                  </label>
                  {formData.imageUrl && (
                    <div className="relative w-24 h-24 group">
                      <img
                        src={formData.imageUrl}
                        alt="Profile preview"
                        className="w-full h-full object-cover rounded-full border-2 border-gray-700 group-hover:border-primary transition-colors duration-200"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, imageUrl: "" }))
                        }
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors duration-200"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/80 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                >
                  {editingMember ? (
                    <>
                      <FiEdit2 className="w-4 h-4" />
                      Update Member
                    </>
                  ) : (
                    <>
                      <FiPlus className="w-4 h-4" />
                      Add Member
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <div
            key={member._id}
            className="bg-gray-800/50 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 mb-4">
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="w-full h-full object-cover rounded-full"
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
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {members.length === 0 && !showForm && (
        <div className="text-center py-12 bg-gray-800/50 rounded-lg">
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
  );
}
