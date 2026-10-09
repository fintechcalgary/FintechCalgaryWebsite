"use client";

import {
  FiEye,
  FiMail,
  FiPhone,
  FiBookOpen,
  FiCalendar,
  FiLink,
  FiFileText,
  FiHelpCircle,
} from "react-icons/fi";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDateTimeShort } from "@/lib/dates";

function InfoCard({ icon: Icon, iconTone, title, children }) {
  const toneClass =
    {
      blue: "bg-blue-500/20 text-blue-400",
      green: "bg-green-500/20 text-green-400",
      purple: "bg-purple-500/20 text-purple-400",
      orange: "bg-orange-500/20 text-orange-400",
      primary: "bg-primary/20 text-primary",
    }[iconTone] || "bg-primary/20 text-primary";

  return (
    <section className="fc-admin-panel p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneClass}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function FieldRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-gray-900/50 p-3">
      {Icon ? (
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="fc-muted text-xs">{label}</div>
        <div className="break-words text-white">{children}</div>
      </div>
    </div>
  );
}

function AnswerBlock({ label, answer }) {
  return (
    <div className="fc-admin-panel p-5 sm:p-6">
      <h3 className="mb-3 flex items-start gap-2 font-semibold text-primary">
        <FiHelpCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span className="min-w-0 break-words">{label}</span>
      </h3>
      <div className="fc-body whitespace-pre-wrap break-words rounded-lg bg-gray-900/50 p-4">
        {answer?.trim() ? answer : "No response provided"}
      </div>
    </div>
  );
}

/**
 * Full-page application detail layout (replaces the old cramped modal).
 */
export default function ExecutiveApplicationDetail({ application, roles = [] }) {
  const selectedRole = roles.find((role) => role.title === application.role);
  const questionsToShow = selectedRole?.questions || [];

  return (
    <div className="space-y-6">
      {/* Applicant header */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary sm:h-16 sm:w-16">
              {(application.name || "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-bold text-white sm:text-3xl">
                {application.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge tone="info" size="sm">
                  {application.role}
                </StatusBadge>
                <span className="fc-body text-sm">
                  {application.program} · Year {application.year}
                </span>
              </div>
            </div>
          </div>
          <div className="sm:text-right">
            <div className="fc-muted text-sm">Applied</div>
            <div className="font-medium text-white">
              {formatDateTimeShort(application.createdAt)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <InfoCard icon={FiMail} iconTone="blue" title="Contact Information">
          <div className="space-y-3">
            <FieldRow icon={FiMail} label="Email">
              <a
                href={`mailto:${application.email}`}
                className="fc-link break-all"
              >
                {application.email}
              </a>
            </FieldRow>
            {application.phone ? (
              <FieldRow icon={FiPhone} label="Phone">
                {application.phone}
              </FieldRow>
            ) : null}
          </div>
        </InfoCard>

        <InfoCard
          icon={FiBookOpen}
          iconTone="green"
          title="Academic Information"
        >
          <div className="space-y-3">
            <FieldRow icon={FiBookOpen} label="Program">
              {application.program}
            </FieldRow>
            <FieldRow icon={FiCalendar} label="Year of Study">
              Year {application.year}
            </FieldRow>
          </div>
        </InfoCard>
      </div>

      <InfoCard icon={FiLink} iconTone="purple" title="Links & Documents">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FieldRow icon={FiLink} label="LinkedIn">
            {application.linkedin ? (
              <a
                href={application.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="fc-link break-all text-sm"
              >
                View Profile
              </a>
            ) : (
              <span className="fc-muted">Not provided</span>
            )}
          </FieldRow>
          <FieldRow icon={FiFileText} label="Resume">
            {application.resume ? (
              <a
                href={application.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="fc-link inline-flex items-center gap-1 text-sm"
              >
                <FiEye className="h-3 w-3" />
                View Resume
              </a>
            ) : (
              <span className="fc-muted">Not provided</span>
            )}
          </FieldRow>
        </div>
      </InfoCard>

      <div className="space-y-4">
        <h2 className="flex items-center gap-3 text-lg font-semibold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
            <FiHelpCircle className="h-4 w-4" />
          </span>
          Application Questions
        </h2>

        {questionsToShow.length > 0 ? (
          questionsToShow.map((question) => (
            <AnswerBlock
              key={question.id}
              label={question.label}
              answer={application[question.id]}
            />
          ))
        ) : (
          <>
            <AnswerBlock
              label="Why do you want to be an executive?"
              answer={application.why}
            />
            <AnswerBlock
              label="What does 'fintech' mean to you, and how do you see its role in the future of business and innovation?"
              answer={application.fintechVision}
            />
            <AnswerBlock
              label="Are you currently involved with any other clubs or commitments? How do you plan to balance your responsibilities?"
              answer={application.otherCommitments}
            />
          </>
        )}
      </div>
    </div>
  );
}
