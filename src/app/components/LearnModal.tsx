"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

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
  onSubmit: (planData: LearningPlanData) => void;
}

type StepKey =
  | "topic"
  | "details"
  | "expertise"
  | "expertiseDetails"
  | "commitment"
  | "duration"
  | "done";

interface Message {
  role: "system" | "user";
  text: string;
}

interface LearningPlanData {
  whatToLearn: string;
  openDetail: string;
  currentExpertise: ExpertiseLevel;
  expertiseDetail: string;
  totalModules: number;
}

const SESSIONS_PER_MONTH: Record<CommitmentFrequency, number> = {
  Daily: 30,
  "Every 3 days": 10,
  Weekly: 4,
  "Bi-weekly": 2,
  Monthly: 1,
};

const MIN_MODULES = 5;

function calculateModules(
  commitment: CommitmentFrequency,
  durationMonths: number
): number {
  return SESSIONS_PER_MONTH[commitment] * durationMonths;
}

const QUESTIONS: Record<Exclude<StepKey, "done">, string> = {
  topic:
    "Hey! I'm here to help you start a new learning journey. What do you want to learn?",
  details:
    "Nice choice! Can you tell me a bit more about what you'd like to accomplish?",
  expertise: "Got it! How would you rate your current level?",
  expertiseDetails:
    "Want to share a bit more about your experience? (you can skip this one)",
  commitment: "How often can you dedicate time to this?",
  duration: "Last one — how long do you want to commit to this goal?",
};

export type { LearningPlanData };

export default function LearnModal({ onClose, onSubmit }: LearnModalProps) {
  const [step, setStep] = useState<StepKey>("topic");
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", text: QUESTIONS.topic },
  ]);
  const [inputValue, setInputValue] = useState("");

  // Collected answers
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [expertise, setExpertise] = useState<ExpertiseLevel | "">("");
  const [expertiseDetails, setExpertiseDetails] = useState("");
  const [commitment, setCommitment] = useState<CommitmentFrequency | "">("");
  const [duration, setDuration] = useState<number | "">("");

  // Tracks whether we're waiting for the next question to appear
  const [isTyping, setIsTyping] = useState(false);

  // Tracks the message index where each step's system question lives.
  // This allows us to truncate the chat correctly when editing, even if
  // extra messages were inserted (e.g. module-count validation re-prompts).
  const stepMessageIndex = useRef<Partial<Record<StepKey, number>>>({
    topic: 0, // The first system message is always index 0
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, step]);

  // Focus the input whenever a new text-input step becomes active
  useEffect(() => {
    if (step === "topic" || step === "expertiseDetails") {
      inputRef.current?.focus();
    } else if (step === "details") {
      textareaRef.current?.focus();
    }
  }, [step]);

  function advanceToStep(nextStep: StepKey, userAnswer: string) {
    // Add user answer as a message
    setMessages((prev) => [...prev, { role: "user", text: userAnswer }]);
    setInputValue("");

    if (nextStep === "done") {
      setStep("done");
      return;
    }

    // Show typing indicator, then reveal next question
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => {
        const updated = [
          ...prev,
          { role: "system" as const, text: QUESTIONS[nextStep] },
        ];
        // Record the index of this step's system question
        stepMessageIndex.current[nextStep] = updated.length - 1;
        return updated;
      });
      setIsTyping(false);
      setStep(nextStep);
    }, 600);
  }

  function handleTextSubmit() {
    const trimmed = inputValue.trim();

    if (step === "topic") {
      if (!trimmed) return;
      setTopic(trimmed);
      advanceToStep("details", trimmed);
    } else if (step === "details") {
      if (!trimmed) return;
      setDetails(trimmed);
      advanceToStep("expertise", trimmed);
    } else if (step === "expertiseDetails") {
      const answer = trimmed || "(skipped)";
      setExpertiseDetails(trimmed);
      advanceToStep("commitment", answer);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  }

  function handleExpertiseSelect(level: ExpertiseLevel) {
    setExpertise(level);
    advanceToStep("expertiseDetails", level);
  }

  function handleCommitmentSelect(freq: CommitmentFrequency) {
    setCommitment(freq);
    advanceToStep("duration", freq);
  }

  function handleDurationSelect(months: number) {
    setDuration(months);
    const label = months === 1 ? "1 month" : `${months} months`;

    // Validate module count
    if (commitment) {
      const modules = calculateModules(
        commitment as CommitmentFrequency,
        months
      );
      if (modules < MIN_MODULES) {
        // Add the user's answer, then show a warning and re-prompt from commitment
        setMessages((prev) => [...prev, { role: "user", text: label }]);
        setInputValue("");
        setIsTyping(true);
        setTimeout(() => {
          setMessages((prev) => {
            const updated = [
              ...prev,
              {
                role: "system" as const,
                text: `That combination only gives ${modules} step${modules === 1 ? "" : "s"}, but we need at least ${MIN_MODULES} for the program to work. Let's try again — how often can you dedicate time to this?`,
              },
            ];
            // Update the commitment step's message index to this re-prompt
            stepMessageIndex.current.commitment = updated.length - 1;
            return updated;
          });
          setIsTyping(false);
          setStep("commitment");
          setCommitment("");
          setDuration("");
        }, 600);
        return;
      }
    }

    advanceToStep("done", label);
  }

  function handleEditStep(targetStep: StepKey) {
    const stepOrder: StepKey[] = [
      "topic",
      "details",
      "expertise",
      "expertiseDetails",
      "commitment",
      "duration",
    ];
    const targetIndex = stepOrder.indexOf(targetStep);

    // Use tracked message index for the target step's system question
    const msgIndex = stepMessageIndex.current[targetStep];
    if (msgIndex === undefined) return;

    // Keep messages up to and including the system question for the target step
    setMessages((prev) => prev.slice(0, msgIndex + 1));

    // Clear answers from the target step onward and remove their tracked indices
    const stepsToReset = stepOrder.slice(targetIndex);
    for (const s of stepsToReset) {
      switch (s) {
        case "topic":
          setTopic("");
          break;
        case "details":
          setDetails("");
          break;
        case "expertise":
          setExpertise("");
          break;
        case "expertiseDetails":
          setExpertiseDetails("");
          break;
        case "commitment":
          setCommitment("");
          break;
        case "duration":
          setDuration("");
          break;
      }
      // Remove tracked indices for steps after the target (not the target itself)
      if (s !== targetStep) {
        delete stepMessageIndex.current[s];
      }
    }

    // Pre-fill the input for text steps so users can edit the existing value
    if (targetStep === "topic") {
      setInputValue(topic);
    } else if (targetStep === "details") {
      setInputValue(details);
    } else if (targetStep === "expertiseDetails") {
      setInputValue(expertiseDetails);
    } else {
      setInputValue("");
    }

    setStep(targetStep);
  }

  function handleBegin() {
    if (!commitment || !duration || !expertise) return;

    const modules = calculateModules(
      commitment as CommitmentFrequency,
      duration as number
    );

    onSubmit({
      whatToLearn: topic,
      openDetail: details,
      currentExpertise: expertise as ExpertiseLevel,
      expertiseDetail: expertiseDetails || "(none)",
      totalModules: modules,
    });
  }

  // Determine what input to show for the current step
  function renderInput() {
    if (isTyping || step === "done") return null;

    switch (step) {
      case "topic":
        return (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='e.g. "Guitar", "Spanish", "Machine Learning"'
              className="flex-1 rounded-lg border border-green-900/60 bg-green-950/40 px-3 py-2 text-green-300 placeholder-green-800 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleTextSubmit}
              disabled={!inputValue.trim()}
              className="px-4 py-2 rounded-lg bg-green-600 text-black font-semibold hover:bg-green-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        );

      case "details":
        return (
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your goals..."
              rows={2}
              className="flex-1 rounded-lg border border-green-900/60 bg-green-950/40 px-3 py-2 text-green-300 placeholder-green-800 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors resize-none"
            />
            <button
              type="button"
              onClick={handleTextSubmit}
              disabled={!inputValue.trim()}
              className="self-end px-4 py-2 rounded-lg bg-green-600 text-black font-semibold hover:bg-green-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        );

      case "expertise":
        return (
          <div className="flex flex-wrap gap-2">
            {EXPERTISE_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => handleExpertiseSelect(level)}
                className="px-4 py-2 rounded-lg border border-green-900/60 text-green-400 hover:bg-green-900/40 hover:border-green-500 transition-colors"
              >
                {level}
              </button>
            ))}
          </div>
        );

      case "expertiseDetails":
        return (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='e.g. "I built a small to-do app"'
              className="flex-1 rounded-lg border border-green-900/60 bg-green-950/40 px-3 py-2 text-green-300 placeholder-green-800 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleTextSubmit}
              className="px-4 py-2 rounded-lg bg-green-600 text-black font-semibold hover:bg-green-500 transition-colors"
            >
              {inputValue.trim() ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              ) : (
                "Skip"
              )}
            </button>
          </div>
        );

      case "commitment":
        return (
          <div className="flex flex-wrap gap-2">
            {COMMITMENT_FREQUENCIES.map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => handleCommitmentSelect(freq)}
                className="px-4 py-2 rounded-lg border border-green-900/60 text-green-400 hover:bg-green-900/40 hover:border-green-500 transition-colors"
              >
                {freq}
              </button>
            ))}
          </div>
        );

      case "duration":
        return (
          <div className="flex flex-wrap gap-2">
            {TIME_MONTHS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleDurationSelect(m)}
                className="px-3 py-2 rounded-lg border border-green-900/60 text-green-400 hover:bg-green-900/40 hover:border-green-500 transition-colors min-w-[4rem]"
              >
                {m} {m === 1 ? "mo" : "mo"}
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  }

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70" />

        {/* Modal */}
        <div className="relative z-10 w-full max-w-2xl mx-4 flex flex-col max-h-[90vh] rounded-lg border border-green-900/60 bg-green-950/95 shadow-lg shadow-green-900/30">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-green-900/40 px-6 py-4">
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

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 min-h-[300px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-message flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2.5 ${
                    msg.role === "system"
                      ? "bg-green-900/30 text-green-300 border border-green-900/40"
                      : "bg-green-600/20 text-green-400 border border-green-600/30"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-green-900/30 text-green-500 border border-green-900/40 rounded-lg px-4 py-2.5">
                  <span className="typing-dots">
                    <span className="dot">.</span>
                    <span className="dot">.</span>
                    <span className="dot">.</span>
                  </span>
                </div>
              </div>
            )}

            {/* Summary and Begin when conversation is complete */}
            {step === "done" && (
              <div className="chat-message flex flex-col gap-4 pt-4">
                <p className="text-green-500 text-sm text-center">
                  All set! Review your answers below — click any to edit.
                </p>

                <div className="space-y-2">
                  {[
                    { label: "Topic", value: topic, targetStep: "topic" as StepKey },
                    { label: "Details", value: details, targetStep: "details" as StepKey },
                    { label: "Expertise", value: expertise, targetStep: "expertise" as StepKey },
                    { label: "Expertise details", value: expertiseDetails || "(skipped)", targetStep: "expertiseDetails" as StepKey },
                    { label: "Commitment", value: commitment, targetStep: "commitment" as StepKey },
                    { label: "Duration", value: duration ? `${duration} month${duration === 1 ? "" : "s"}` : "", targetStep: "duration" as StepKey },
                  ].map((item) => (
                    <button
                      key={item.targetStep}
                      type="button"
                      onClick={() => handleEditStep(item.targetStep)}
                      className="w-full text-left rounded border border-green-900/40 bg-green-900/20 px-4 py-2.5 hover:bg-green-900/40 hover:border-green-500 transition-colors group"
                    >
                      <span className="text-green-600 text-xs uppercase tracking-wider font-semibold">
                        {item.label}
                      </span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-green-300 text-sm">{item.value}</span>
                        <svg
                          className="h-4 w-4 text-green-700 group-hover:text-green-400 transition-colors shrink-0 ml-2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={handleBegin}
                    className="px-8 py-3 rounded-lg bg-green-600 text-black font-semibold text-lg hover:bg-green-500 transition-colors shadow-lg shadow-green-900/40"
                  >
                    Begin
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-green-900/40 px-6 py-4">
            {step !== "done" && !isTyping ? (
              renderInput()
            ) : step === "done" ? (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-green-900/60 text-green-400 hover:bg-green-900/30 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
  );
}
