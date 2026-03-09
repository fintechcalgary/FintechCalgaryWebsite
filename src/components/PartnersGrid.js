"use client";

import { useState, useEffect, useRef } from "react";
import DraggablePartner from "./DraggablePartner";

export default function PartnersGrid({
  partners,
  onPartnersChange,
  onEdit,
  onDelete,
  onDownloadLogo,
}) {
  const [localPartners, setLocalPartners] = useState(partners);
  const latestOrderRef = useRef(localPartners);

  useEffect(() => {
    setLocalPartners(partners);
    latestOrderRef.current = partners;
  }, [partners]);

  const movePartner = (fromId, toIndex) => {
    const fromIndex = localPartners.findIndex((p) => p._id === fromId);
    if (fromIndex === -1 || fromIndex === toIndex) return;
    const updated = [...localPartners];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    latestOrderRef.current = updated;
    setLocalPartners(updated);
  };

  const savePartnerOrder = async (orderedPartners) => {
    try {
      const res = await fetch("/api/partners/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderedPartnerIds: orderedPartners.map((p) => p._id),
        }),
      });
      if (!res.ok) throw new Error("Failed to save order");
    } catch (err) {
      console.error(err);
      alert("Failed to save order. Try again.");
    }
  };

  const handleDragEnd = () => {
    const finalOrder = latestOrderRef.current;
    onPartnersChange(finalOrder);
    savePartnerOrder(finalOrder);
  };

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {localPartners.map((partner, index) => (
        <DraggablePartner
          key={partner._id}
          partner={partner}
          index={index}
          movePartner={movePartner}
          onDragEnd={handleDragEnd}
          onEdit={onEdit}
          onDelete={onDelete}
          onDownloadLogo={onDownloadLogo}
        />
      ))}
    </div>
  );
}
