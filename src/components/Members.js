import { useState, useEffect } from "react";
import {
  FiUser,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiX,
  FiImage,
} from "react-icons/fi";

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
    if (confirm("Are you sure you want to remove this member?")) {
      const response = await fetch(`/api/members/${memberId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchMembers();
      }
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
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
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/50 rounded-lg p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter member name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-primary"
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
                setFormData({ ...formData, position: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-primary"
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
                setFormData({ ...formData, major: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
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
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                <FiImage />
                {uploading ? "Uploading..." : "Choose Image"}
              </label>
              {formData.imageUrl && (
                <div className="relative w-20 h-20">
                  <img
                    src={formData.imageUrl}
                    alt="Profile preview"
                    className="w-full h-full object-cover rounded-full"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, imageUrl: "" }))
                    }
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/80 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {editingMember ? "Update Member" : "Add Member"}
          </button>
        </form>
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
    </div>
  );
}
