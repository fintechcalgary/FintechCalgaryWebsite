"use client";

import { useState, useEffect, useRef } from "react";
import DraggablePartner from "@/features/partners/DraggablePartner";
import {
  API_ENDPOINTS,
  CONTENT_TYPES,
  ERROR_MESSAGES,
  HTTP_METHODS,
} from "@/lib/constants";

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
      const res = await fetch(API_ENDPOINTS.PARTNERS_ORDER, {
        method: HTTP_METHODS.PUT,
        headers: { "Content-Type": CONTENT_TYPES.JSON },
        body: JSON.stringify({
          orderedPartnerIds: orderedPartners.map((p) => p._id),
        }),
      });
      if (!res.ok) throw new Error("Failed to save order");
    } catch (err) {
      console.error(err);
      alert(ERROR_MESSAGES.SAVE_ORDER_FAILED);
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
