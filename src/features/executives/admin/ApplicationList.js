"use client";

import { useRouter } from "next/navigation";
import { FiTrash2 } from "react-icons/fi";
import { GlowCard } from "@/components/ui/spotlight-card";
import StatusBadge from "@/components/ui/StatusBadge";
import IconButton from "@/components/ui/IconButton";

function applicationHref(id) {
  return `/dashboard/executive-applications/${id}`;
}

export default function ApplicationList({
  applications,
  error,
  fetchApplications,
  formatDate,
  onDeleteClick,
  deletingId,
}) {
  const router = useRouter();

  const goToApplication = (id) => {
    router.push(applicationHref(id));
  };

  return (
    <>
      <div className="fc-admin-panel overflow-hidden">
        {error ? (
          <div className="p-6 text-center sm:p-8">
            <p className="text-sm text-red-400 sm:text-base">{error}</p>
            <button
              onClick={fetchApplications}
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm text-white transition-colors hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-6 text-center sm:p-8">
            <p className="fc-body text-sm sm:text-base">No applications found.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full">
                <thead className="border-b border-gray-700/50 bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                      Applicant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                      Program & Year
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                      Applied
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {applications.map((application, index) => (
                    <tr
                      key={application._id || index}
                      role="link"
                      tabIndex={0}
                      onClick={() => goToApplication(application._id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          goToApplication(application._id);
                        }
                      }}
                      className="cursor-pointer transition-colors hover:bg-gray-800/30"
                    >
                      <td className="px-6 py-4">
                        <span className="fc-title max-w-[220px] truncate text-sm underline decoration-white/40 underline-offset-2">
                          {application.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span title={application.role}>
                          <StatusBadge
                            tone="info"
                            size="sm"
                            className="max-w-[200px] truncate"
                          >
                            {application.role}
                          </StatusBadge>
                        </span>
                      </td>
                      <td className="px-6 py-4 fc-body">
                        <div className="max-w-[180px] truncate">
                          {application.program}
                        </div>
                        <div className="fc-muted">Year {application.year}</div>
                      </td>
                      <td className="px-6 py-4 fc-body">
                        <div className="max-w-[220px] truncate">
                          {application.email}
                        </div>
                        {application.phone ? (
                          <div className="fc-muted">{application.phone}</div>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 fc-body whitespace-nowrap">
                        {formatDate(application.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeleteClick(application);
                          }}
                          disabled={deletingId === application._id}
                          className="inline-flex items-center gap-1 text-sm font-medium text-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FiTrash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              <div className="space-y-4 p-4 sm:p-6">
                {applications.map((application, index) => (
                  <div
                    key={application._id || index}
                    role="link"
                    tabIndex={0}
                    onClick={() => goToApplication(application._id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        goToApplication(application._id);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <GlowCard
                      customSize
                      glowColor="purple"
                      className="w-full !gap-0 !p-4"
                    >
                      <div className="relative z-10">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="fc-title mb-1 truncate text-base underline decoration-white/40 underline-offset-2">
                              {application.name}
                            </h3>
                            <span title={application.role}>
                              <StatusBadge
                                tone="info"
                                size="sm"
                                className="max-w-[150px] truncate"
                              >
                                {application.role}
                              </StatusBadge>
                            </span>
                          </div>
                          <IconButton
                            variant="danger"
                            label="Delete Application"
                            disabled={deletingId === application._id}
                            onClick={(event) => {
                              event.stopPropagation();
                              onDeleteClick(application);
                            }}
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </IconButton>
                        </div>

                        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                          <div className="min-w-0">
                            <span className="fc-muted">Program:</span>
                            <div className="truncate text-white">
                              {application.program}
                            </div>
                            <div className="fc-muted">
                              Year {application.year}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <span className="fc-muted">Contact:</span>
                            <div className="break-all text-white">
                              {application.email}
                            </div>
                            {application.phone ? (
                              <div className="fc-muted">{application.phone}</div>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-3 border-t border-gray-700/30 pt-3">
                          <span className="fc-muted text-xs">Applied:</span>
                          <div className="text-sm text-white">
                            {formatDate(application.createdAt)}
                          </div>
                        </div>
                      </div>
                    </GlowCard>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="fc-muted mt-6 text-center sm:text-left">
        Total Applications: {applications.length}
      </div>
    </>
  );
}
