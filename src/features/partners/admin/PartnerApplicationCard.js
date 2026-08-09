"use client";

import { motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiGlobe,
  FiMapPin,
  FiHome,
  FiDownload,
  FiTrash2,
  FiEdit2,
  FiExternalLink,
} from "react-icons/fi";
import { SiLinkedin, SiFacebook, SiX } from "react-icons/si";
import Image from "next/image";
import { formatDateLocale } from "@/lib/dates";
import { getApprovalStatusMeta } from "@/features/partners/approvalStatus";

function externalUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `https://${url}`;
}

export default function PartnerApplicationCard({
  member,
  index = 0,
  onEdit,
  onDelete,
  onDownloadLogo,
  onApprovalStatusChange,
}) {
  const statusMeta = getApprovalStatusMeta(member.approvalStatus);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 h-full flex flex-col group cursor-pointer"
      onClick={() => onEdit(member)}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {member.logo ? (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
              <Image
                src={member.logo}
                alt={`${member.organizationName} logo`}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <FiHome className="text-primary text-xl" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-white truncate">
              {member.organizationName}
            </h3>
            <p className="text-xs text-gray-400">
              {formatDateLocale(member.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {member.logo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownloadLogo(member);
              }}
              className="text-gray-400 hover:text-blue-400 transition-all duration-200 p-2 rounded-lg hover:bg-blue-500/10 hover:scale-105 relative z-20 border border-transparent hover:border-blue-500/20"
              title="Download Logo"
            >
              <FiDownload className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(member);
            }}
            className="text-gray-400 hover:text-primary transition-all duration-200 p-2 rounded-xl hover:bg-primary/10 hover:scale-105 relative z-20 border border-transparent hover:border-primary/20"
            title="Edit"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(member);
            }}
            className="text-gray-400 hover:text-red-400 transition-all duration-200 p-2 rounded-lg hover:bg-red-500/10 hover:scale-105 relative z-20 border border-transparent hover:border-red-500/20"
            title="Delete"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${statusMeta.badgeClass}`}
          >
            {statusMeta.shortLabel}
          </span>
          {member.approvalStatus === "accepted" && member.approvedAt && (
            <span className="text-xs text-gray-400">
              Approved on {formatDateLocale(member.approvedAt)}
            </span>
          )}
        </div>
        {member.approvalStatus === "pending" && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApprovalStatusChange(member._id, "accepted");
              }}
              className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-500 px-3 py-1 rounded transition-all duration-200 relative z-20 border border-green-500/20 hover:border-green-500/40 hover:scale-105"
            >
              Accept
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApprovalStatusChange(member._id, "rejected");
              }}
              className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-500 px-3 py-1 rounded transition-all duration-200 relative z-20 border border-red-500/20 hover:border-red-500/40 hover:scale-105"
            >
              Reject
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <FiUser className="text-gray-400 w-4 h-4 flex-shrink-0" />
          <span className="text-white truncate">
            {[member.title, member.firstName, member.lastName]
              .filter(Boolean)
              .join(" ")}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <FiMail className="text-gray-400 w-4 h-4 flex-shrink-0" />
          <a
            href={`mailto:${member.contactEmail}`}
            className="text-primary hover:text-primary/80 transition-colors truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {member.contactEmail}
          </a>
        </div>

        {member.contactPhoneNumber && (
          <div className="flex items-center gap-2 text-sm">
            <FiPhone className="text-gray-400 w-4 h-4 flex-shrink-0" />
            <span className="text-white text-xs">Personal:</span>
            <span className="text-white">{member.contactPhoneNumber}</span>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6 pt-4 border-t border-gray-800">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Organization
        </h4>

        {member.organizationEmail && (
          <div className="flex items-center gap-2 text-sm">
            <FiMail className="text-gray-400 w-4 h-4 flex-shrink-0" />
            <a
              href={`mailto:${member.organizationEmail}`}
              className="text-primary hover:text-primary/80 transition-colors truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {member.organizationEmail}
            </a>
          </div>
        )}

        {member.organizationPhoneNumber && (
          <div className="flex items-center gap-2 text-sm">
            <FiPhone className="text-gray-400 w-4 h-4 flex-shrink-0" />
            <span className="text-white">{member.organizationPhoneNumber}</span>
          </div>
        )}

        {member.website && (
          <div className="flex items-center gap-2 text-sm">
            <FiGlobe className="text-gray-400 w-4 h-4 flex-shrink-0" />
            <a
              href={externalUrl(member.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors truncate flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {member.website}
              <FiExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {(member.address ||
          member.city ||
          member.province ||
          member.country ||
          member.postalCode) && (
          <div className="flex items-start gap-2 text-sm">
            <FiMapPin className="text-gray-400 w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="text-white text-sm leading-relaxed">
              {member.address && <div>{member.address}</div>}
              <div>
                {[member.city, member.province, member.postalCode]
                  .filter(Boolean)
                  .join(", ")}
              </div>
              {member.country && <div>{member.country}</div>}
            </div>
          </div>
        )}
      </div>

      {(member.linkedin || member.facebook || member.twitter) && (
        <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
          {member.linkedin && (
            <a
              href={externalUrl(member.linkedin)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-500 transition-colors"
              title="LinkedIn"
              onClick={(e) => e.stopPropagation()}
            >
              <SiLinkedin className="w-4 h-4" />
            </a>
          )}
          {member.facebook && (
            <a
              href={externalUrl(member.facebook)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 transition-colors"
              title="Facebook"
              onClick={(e) => e.stopPropagation()}
            >
              <SiFacebook className="w-4 h-4" />
            </a>
          )}
          {member.twitter && (
            <a
              href={externalUrl(member.twitter)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
              title="X (Twitter)"
              onClick={(e) => e.stopPropagation()}
            >
              <SiX className="w-4 h-4" />
            </a>
          )}
        </div>
      )}

      {member.aboutUs && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-400 mb-2 font-medium">About</p>
          <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">
            {member.aboutUs}
          </p>
        </div>
      )}
    </motion.div>
  );
}
