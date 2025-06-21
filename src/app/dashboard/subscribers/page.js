"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiCalendar,
  FiDownload,
  FiTrash2,
  FiArrowLeft,
} from "react-icons/fi";
import Navbar from "@/components/Navbar";
import Modal from "@/components/Modal";
import Link from "next/link";

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const response = await fetch("/api/subscribers");
        const data = await response.json();
        setSubscribers(data);
      } catch (error) {
        console.error("Failed to fetch subscribers:", error);
      }
    };

    if (session?.user?.role === "admin") {
      fetchSubscribers();
    }
  }, [session]);

  const handleDeleteClick = (subscriber) => {
    setSubscriberToDelete(subscriber);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(
        `/api/subscribers/${subscriberToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete subscriber");
      }

      setSubscribers(
        subscribers.filter((s) => s._id !== subscriberToDelete._id)
      );
      setShowDeleteModal(false);
      setSubscriberToDelete(null);
    } catch (error) {
      console.error("Error deleting subscriber:", error);
    }
  };

  const downloadCSV = () => {
    const headers = ["Name", "Email", "Joined Date"];
    const csvData = subscribers.map((sub) => [
      sub.name,
      sub.email,
      new Date(sub.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (session?.user?.role !== "admin") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-white">
            You don&apos;t have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white">Subscribers</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white hover:bg-gray-700/50 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <button
              onClick={downloadCSV}
              className="px-4 py-2 rounded-lg bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
            >
              <FiDownload className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {subscribers.map((subscriber) => (
            <motion.div
              key={subscriber._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">
                    {subscriber.name}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-400">
                    <FiMail className="flex-shrink-0" />
                    <a
                      href={`mailto:${subscriber.email}`}
                      className="hover:text-primary transition-colors"
                    >
                      {subscriber.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FiCalendar className="flex-shrink-0" />
                    {new Date(subscriber.createdAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleDeleteClick(subscriber)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete subscriber"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {subscribers.length === 0 && (
          <p className="text-center text-gray-400 mt-8">No subscribers yet.</p>
        )}
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSubscriberToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Confirm Delete"
        message={`Are you sure you want to remove ${subscriberToDelete?.name} from the subscribers list?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
