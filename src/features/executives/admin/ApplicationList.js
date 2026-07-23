"use client";

import { FiEye, FiTrash2 } from "react-icons/fi";

export default function ApplicationList({
  applications,
  error,
  fetchApplications,
  formatDate,
  onViewDetails,
  onDeleteClick,
}) {
  return (
    <>
        {/* Applications Table - Mobile Cards vs Desktop Table */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          {error ? (
            <div className="p-6 sm:p-8 text-center">
              <p className="text-red-400 text-sm sm:text-base">{error}</p>
              <button
                onClick={fetchApplications}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <p className="text-gray-400 text-sm sm:text-base">
                No applications found.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50 border-b border-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Applicant
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Program & Year
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Applied
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {applications.map((application, index) => (
                      <tr
                        key={application._id || index}
                        className="hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {application.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary max-w-[200px] truncate"
                            title={application.role}
                          >
                            {application.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div>{application.program}</div>
                          <div className="text-gray-400">
                            Year {application.year}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div>{application.email}</div>
                          {application.phone && (
                            <div className="text-gray-400">
                              {application.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {formatDate(application.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => onViewDetails(application)}
                              className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
                            >
                              <FiEye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => onDeleteClick(application)}
                              disabled={deletingId === application._id}
                              className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiTrash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                <div className="p-4 sm:p-6 space-y-4">
                  {applications.map((application, index) => (
                    <div
                      key={application._id || index}
                      className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-medium text-base mb-1">
                            {application.name}
                          </h3>
                          <span
                            className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary max-w-[150px] truncate"
                            title={application.role}
                          >
                            {application.role}
                          </span>
                        </div>
                        <div className="flex gap-2 ml-3">
                          <button
                            onClick={() => onViewDetails(application)}
                            className="p-2 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteClick(application)}
                            disabled={deletingId === application._id}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Application"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400">Program:</span>
                          <div className="text-white">
                            {application.program}
                          </div>
                          <div className="text-gray-400">
                            Year {application.year}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">Contact:</span>
                          <div className="text-white break-all">
                            {application.email}
                          </div>
                          {application.phone && (
                            <div className="text-gray-400">
                              {application.phone}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-700/30">
                        <span className="text-gray-400 text-xs">Applied:</span>
                        <div className="text-white text-sm">
                          {formatDate(application.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 text-sm text-gray-400 text-center sm:text-left">
          Total Applications: {applications.length}
        </div>

    </>
  );
}
