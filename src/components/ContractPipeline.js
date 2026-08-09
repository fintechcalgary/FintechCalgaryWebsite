"use client";

import { FiCheck, FiX } from "react-icons/fi";
import { CONTRACT_STAGES, CONTRACT_STATUS } from "@/lib/constants";

const STEP_STYLES = {
  done: {
    card: "border-primary/40 bg-primary/10",
    bubble: "bg-primary text-white",
    label: "text-white",
    role: "text-primary/80",
  },
  current: {
    card: "border-primary bg-primary/20 ring-1 ring-primary/60 shadow-lg shadow-primary/20",
    bubble: "bg-primary text-white animate-pulse",
    label: "text-white",
    role: "text-primary",
  },
  halted: {
    card: "border-red-500/60 bg-red-500/10 ring-1 ring-red-500/40",
    bubble: "bg-red-500 text-white",
    label: "text-red-300",
    role: "text-red-400/80",
  },
  upcoming: {
    card: "border-gray-700/40 bg-gray-800/30 opacity-60",
    bubble: "bg-gray-700 text-gray-300",
    label: "text-gray-300",
    role: "text-gray-500",
  },
};

export default function ContractPipeline({ stage, status }) {
  const isCompleted = status === CONTRACT_STATUS.COMPLETED;
  const isHalted = status === CONTRACT_STATUS.DO_NOT_PROCEED;

  const doneCount = isCompleted ? CONTRACT_STAGES.length : stage;
  const progressPercent = Math.round(
    (doneCount / CONTRACT_STAGES.length) * 100
  );

  const getStepState = (index) => {
    if (isCompleted || index < stage) return "done";
    if (index === stage) return isHalted ? "halted" : "current";
    return "upcoming";
  };

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isHalted
                ? "bg-red-500"
                : isCompleted
                ? "bg-green-500"
                : "bg-gradient-to-r from-primary to-purple-400"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {doneCount} of {CONTRACT_STAGES.length} stages approved
        </span>
      </div>

      {/* Stage steps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2">
        {CONTRACT_STAGES.map((stageInfo, index) => {
          const state = getStepState(index);
          const styles = STEP_STYLES[state];

          return (
            <div
              key={stageInfo.id}
              className={`rounded-xl border p-3 transition-all duration-300 ${styles.card}`}
              title={stageInfo.description}
            >
              <span
                className={`w-6 h-6 mb-2 rounded-full flex items-center justify-center text-xs font-bold ${styles.bubble}`}
              >
                {state === "done" ? (
                  <FiCheck className="w-3.5 h-3.5" />
                ) : state === "halted" ? (
                  <FiX className="w-3.5 h-3.5" />
                ) : (
                  index + 1
                )}
              </span>
              <p className={`text-xs font-semibold leading-tight ${styles.label}`}>
                {stageInfo.label}
              </p>
              <p
                className={`text-[10px] uppercase tracking-wide mt-1 ${styles.role}`}
              >
                {stageInfo.role}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
