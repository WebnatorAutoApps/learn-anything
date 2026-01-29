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

export default function LearnModal({ onClose }: LearnModalProps) {
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
      setMessages((prev) => [
        ...prev,
        { role: "system", text: QUESTIONS[nextStep] },
      ]);
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
    advanceToStep("done", label);
  }

  function handleBegin() {
    // TODO: handle form submission in a future iteration
    void topic;
    void details;
    void expertise;
    void expertiseDetails;
    void commitment;
    void duration;
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

          {/* Begin button when conversation is complete */}
          {step === "done" && (
            <div className="chat-message flex flex-col items-center gap-4 pt-4">
              <p className="text-green-500 text-sm text-center">
                All set! Ready to start your learning journey?
              </p>
              <button
                type="button"
                onClick={handleBegin}
                className="px-8 py-3 rounded-lg bg-green-600 text-black font-semibold text-lg hover:bg-green-500 transition-colors shadow-lg shadow-green-900/40"
              >
                Begin
              </button>
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
