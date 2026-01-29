"use client";

import { useState, FormEvent } from "react";

const EXPERTISE_LEVELS = [
  "No clue",
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
] as const;

const COMMITMENT_FREQUENCIES = [
  "Daily",
  "Every 3 days",
  "Weekly",
  "Bi-weekly",
  "Monthly",
] as const;

const TIME_MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

type ExpertiseLevel = (typeof EXPERTISE_LEVELS)[number];
type CommitmentFrequency = (typeof COMMITMENT_FREQUENCIES)[number];

interface LearnModalProps {
  onClose: () => void;
}

interface FormErrors {
  topic?: string;
  details?: string;
  expertise?: string;
  commitment?: string;
  duration?: string;
}

export default function LearnModal({ onClose }: LearnModalProps) {
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [expertise, setExpertise] = useState<ExpertiseLevel | "">("");
  const [expertiseDetails, setExpertiseDetails] = useState("");
  const [commitment, setCommitment] = useState<CommitmentFrequency | "">("");
  const [duration, setDuration] = useState<number | "">("");
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!topic.trim()) {
      newErrors.topic = "Please tell us what you want to learn";
    }

    if (!details.trim()) {
      newErrors.details = "A short description helps us build a better plan";
    }

    if (!expertise) {
      newErrors.expertise = "Select your current level";
    }

    if (!commitment) {
      newErrors.commitment = "Choose how often you can dedicate time";
    }

    if (!duration) {
      newErrors.duration = "Pick a timeframe for your learning goal";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    // TODO: handle form submission in a future iteration
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop — clicking it does NOT dismiss the modal */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-lg border border-green-900/60 bg-green-950/95 shadow-lg shadow-green-900/30">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-green-900/40 bg-green-950/95 px-6 py-4">
          <h3 className="text-lg font-semibold text-green-400 tracking-wide">
            <span className="text-green-600">{">"}</span> Start a New Learning
            Path
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-green-600 hover:text-green-400 hover:bg-green-900/40 transition-colors"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Description */}
          <p className="text-green-600 text-sm leading-relaxed">
            Answer a few questions so we can build a personalized learning path
            just for you. The more detail you share, the better we can tailor
            your plan.
          </p>

          {/* Topic */}
          <div>
            <label
              htmlFor="learn-topic"
              className="block text-sm font-medium text-green-400 mb-1.5"
            >
              What do you want to learn?
            </label>
            <input
              id="learn-topic"
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (errors.topic) setErrors((prev) => ({ ...prev, topic: undefined }));
              }}
              placeholder='e.g. "Guitar", "Spanish", "Machine Learning"'
              className={`w-full rounded-lg border ${errors.topic ? "border-red-500/70" : "border-green-900/60"} bg-green-950/40 px-3 py-2 text-green-300 placeholder-green-800 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors`}
            />
            {errors.topic && (
              <p className="mt-1 text-xs text-red-400">{errors.topic}</p>
            )}
          </div>

          {/* Details */}
          <div>
            <label
              htmlFor="learn-details"
              className="block text-sm font-medium text-green-400 mb-1.5"
            >
              What do you want to accomplish?
            </label>
            <textarea
              id="learn-details"
              value={details}
              onChange={(e) => {
                setDetails(e.target.value);
                if (errors.details) setErrors((prev) => ({ ...prev, details: undefined }));
              }}
              placeholder="Describe your goals — e.g. &quot;I want to play my favorite songs on guitar&quot; or &quot;I need to hold a basic conversation in Spanish&quot;"
              rows={3}
              className={`w-full rounded-lg border ${errors.details ? "border-red-500/70" : "border-green-900/60"} bg-green-950/40 px-3 py-2 text-green-300 placeholder-green-800 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors resize-none`}
            />
            {errors.details && (
              <p className="mt-1 text-xs text-red-400">{errors.details}</p>
            )}
          </div>

          {/* Expertise Level */}
          <div>
            <label
              htmlFor="learn-expertise"
              className="block text-sm font-medium text-green-400 mb-1.5"
            >
              How would you rate your current level?
            </label>
            <select
              id="learn-expertise"
              value={expertise}
              onChange={(e) => {
                setExpertise(e.target.value as ExpertiseLevel);
                if (errors.expertise) setErrors((prev) => ({ ...prev, expertise: undefined }));
              }}
              className={`w-full rounded-lg border ${errors.expertise ? "border-red-500/70" : "border-green-900/60"} bg-green-950/40 px-3 py-2 text-green-300 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors appearance-none cursor-pointer`}
            >
              <option value="" disabled className="bg-green-950 text-green-700">
                Select your expertise level
              </option>
              {EXPERTISE_LEVELS.map((level) => (
                <option key={level} value={level} className="bg-green-950 text-green-300">
                  {level}
                </option>
              ))}
            </select>
            {errors.expertise && (
              <p className="mt-1 text-xs text-red-400">{errors.expertise}</p>
            )}
          </div>

          {/* Expertise Details */}
          <div>
            <label
              htmlFor="learn-expertise-details"
              className="block text-sm font-medium text-green-400 mb-1.5"
            >
              Tell us a bit more about your experience{" "}
              <span className="text-green-700 font-normal">(optional)</span>
            </label>
            <input
              id="learn-expertise-details"
              type="text"
              value={expertiseDetails}
              onChange={(e) => setExpertiseDetails(e.target.value)}
              placeholder={'e.g. "I built a small to-do app", "I can cook an omelette but that\'s about it"'}
              className="w-full rounded-lg border border-green-900/60 bg-green-950/40 px-3 py-2 text-green-300 placeholder-green-800 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
            />
          </div>

          {/* Commitment Frequency */}
          <div>
            <label
              htmlFor="learn-commitment"
              className="block text-sm font-medium text-green-400 mb-1.5"
            >
              How often can you dedicate time to this?
            </label>
            <select
              id="learn-commitment"
              value={commitment}
              onChange={(e) => {
                setCommitment(e.target.value as CommitmentFrequency);
                if (errors.commitment) setErrors((prev) => ({ ...prev, commitment: undefined }));
              }}
              className={`w-full rounded-lg border ${errors.commitment ? "border-red-500/70" : "border-green-900/60"} bg-green-950/40 px-3 py-2 text-green-300 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors appearance-none cursor-pointer`}
            >
              <option value="" disabled className="bg-green-950 text-green-700">
                Select your commitment level
              </option>
              {COMMITMENT_FREQUENCIES.map((freq) => (
                <option key={freq} value={freq} className="bg-green-950 text-green-300">
                  {freq}
                </option>
              ))}
            </select>
            {errors.commitment && (
              <p className="mt-1 text-xs text-red-400">{errors.commitment}</p>
            )}
          </div>

          {/* Time Commitment (Duration) */}
          <div>
            <label
              htmlFor="learn-duration"
              className="block text-sm font-medium text-green-400 mb-1.5"
            >
              How long do you want to commit to this goal?
            </label>
            <select
              id="learn-duration"
              value={duration}
              onChange={(e) => {
                setDuration(Number(e.target.value));
                if (errors.duration) setErrors((prev) => ({ ...prev, duration: undefined }));
              }}
              className={`w-full rounded-lg border ${errors.duration ? "border-red-500/70" : "border-green-900/60"} bg-green-950/40 px-3 py-2 text-green-300 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors appearance-none cursor-pointer`}
            >
              <option value="" disabled className="bg-green-950 text-green-700">
                Select a timeframe
              </option>
              {TIME_MONTHS.map((m) => (
                <option key={m} value={m} className="bg-green-950 text-green-300">
                  {m} {m === 1 ? "month" : "months"}
                </option>
              ))}
            </select>
            {errors.duration && (
              <p className="mt-1 text-xs text-red-400">{errors.duration}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-green-900/60 text-green-400 hover:bg-green-900/30 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-green-600 text-black font-semibold hover:bg-green-500 transition-colors"
            >
              Begin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
