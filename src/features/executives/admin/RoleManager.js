"use client";

import Image from "next/image";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import Spinner from "@/components/ui/Spinner";

export default function RoleManager({
  roles,
  rolesLoading,
  executiveApplicationsOpen,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  formatDate,
}) {
  return (
    <>
        {/* Role Management Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white">
                Executive Roles
              </h2>
              <p className="text-gray-400 text-lg">
                Manage available executive positions and their responsibilities
              </p>
            </div>
            {executiveApplicationsOpen && (
              <button
                onClick={onAddClick}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <FiPlus className="w-4 h-4" />
                Add an Opening
              </button>
            )}
          </div>

          {/* Roles Grid */}
          {rolesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="md" />
            </div>
          ) : roles.length === 0 ? (
            <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
              <p className="text-gray-400 text-lg mb-6">
                No executive roles have been created yet.
              </p>
              {executiveApplicationsOpen && (
                <button
                  onClick={onAddClick}
                  className="px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium mx-auto"
                >
                  <FiPlus className="w-4 h-4" />
                  Create First Role
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => (
                <div
                  key={role._id}
                  className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
                >
                  <div className="flex items-start justify-between mb-6">
                    <h3 className="text-white font-semibold text-xl">
                      {role.title}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditClick(role)}
                        className="p-2 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg transition-all duration-200 hover:scale-105"
                        title="Edit Role"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteClick(role)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-200 hover:scale-105"
                        title="Delete Role"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-gray-300 font-medium text-sm mb-3">
                        Responsibilities
                      </h4>
                      <div className="relative group">
                        <Image
                          src={role.responsibilitiesImageUrl}
                          alt={`${role.title} responsibilities`}
                          width={400}
                          height={128}
                          className="w-full h-32 object-cover rounded-lg border border-gray-700/50 cursor-pointer transition-transform group-hover:scale-105"
                          onClick={() =>
                            window.open(role.responsibilitiesImageUrl, "_blank")
                          }
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                          <span className="text-white text-sm font-medium">
                            Click to view full size
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Role Questions */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-gray-300 font-medium text-sm">
                          Application Questions
                        </h4>
                        <button
                          onClick={() => onAddQuestion(role)}
                          className="p-1.5 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg transition-all duration-200 hover:scale-105"
                          title="Add Question"
                        >
                          <FiPlus className="w-3 h-3" />
                        </button>
                      </div>

                      {role.questions && role.questions.length > 0 ? (
                        <div className="space-y-2">
                          {role.questions.map((question, index) => (
                            <div
                              key={question.id}
                              className="bg-gray-800/30 rounded-lg p-3 flex items-start justify-between"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-primary font-semibold text-xs">
                                    Q{index + 1}
                                  </span>
                                  {question.required && (
                                    <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-red-500/20 text-red-400">
                                      Required
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-300 text-xs font-medium mb-1">
                                  {question.label}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  ID: {question.id}
                                </p>
                              </div>
                              <div className="flex gap-1 ml-2">
                                <button
                                  onClick={() => onEditQuestion(role, question)}
                                  className="p-1 text-primary hover:text-primary/80 hover:bg-primary/10 rounded transition-colors"
                                  title="Edit Question"
                                >
                                  <FiEdit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => onDeleteQuestion(role, question)}
                                  className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                                  title="Delete Question"
                                >
                                  <FiTrash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                          <p className="text-gray-400 text-xs mb-2">
                            No custom questions for this role
                          </p>
                          <button
                            onClick={() => onAddQuestion(role)}
                            className="text-primary hover:text-primary/80 text-xs font-medium"
                          >
                            Add first question
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-400 pt-2 border-t border-gray-800">
                      Created: {formatDate(role.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

    </>
  );
}
