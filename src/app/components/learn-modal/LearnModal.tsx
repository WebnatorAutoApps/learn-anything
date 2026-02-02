"use client";

import { useState, useRef, useEffect } from "react";
import { MIN_MODULES } from "@/lib/constants/validation";
import { useI18n } from "@/lib/i18n";
import type {
  StepKey,
  ExpertiseLevel,
  CommitmentFrequency,
  LearningPlanData,
  Message,
} from "./types";
import {
  TYPING_INDICATOR_DELAY_MS,
  calculateModules,
} from "./constants";
import { ChatMessages, StepInput, SummaryReview } from "./components";

interface LearnModalProps {
  onClose: () => void;
  onSubmit: (planData: LearningPlanData) => void;
}

export default function LearnModal({ onClose, onSubmit }: LearnModalProps) {
  const { t } = useI18n();
  const l = t.learn as Record<string, string>;
  const common = t.common as Record<string, string>;

  const expertiseLabels: Record<string, string> = {
    "No clue": l.expertiseNoClue,
    "Beginner": l.expertiseBeginner,
    "Intermediate": l.expertiseIntermediate,
    "Advanced": l.expertiseAdvanced,
    "Expert": l.expertiseExpert,
  };

  const commitmentLabels: Record<string, string> = {
    "Daily": l.commitDaily,
    "Every 3 days": l.commitEvery3Days,
    "Weekly": l.commitWeekly,
    "Bi-weekly": l.commitBiWeekly,
    "Monthly": l.commitMonthly,
  };

  const questions: Record<Exclude<StepKey, "done">, string> = {
    topic: l.questionTopic,
    details: l.questionDetails,
    expertise: l.questionExpertise,
    expertiseDetails: l.questionExpertiseDetails,
    commitment: l.questionCommitment,
    duration: l.questionDuration,
  };

  const [step, setStep] = useState<StepKey>("topic");
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", text: l.questionTopic },
  ]);
  const [inputValue, setInputValue] = useState("");

  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [expertise, setExpertise] = useState<ExpertiseLevel | "">("");
  const [expertiseDetails, setExpertiseDetails] = useState("");
  const [commitment, setCommitment] = useState<CommitmentFrequency | "">("");
  const [duration, setDuration] = useState<number | "">("");
  const [isTyping, setIsTyping] = useState(false);

  const stepMessageIndex = useRef<Partial<Record<StepKey, number>>>({ topic: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, step]);

  useEffect(() => {
    if (step === "topic" || step === "expertiseDetails") inputRef.current?.focus();
    else if (step === "details") textareaRef.current?.focus();
  }, [step]);

  function advanceToStep(nextStep: StepKey, userAnswer: string) {
    setMessages((prev) => [...prev, { role: "user", text: userAnswer }]);
    setInputValue("");

    if (nextStep === "done") {
      setStep("done");
      return;
    }

    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => {
        const updated = [
          ...prev,
          { role: "system" as const, text: questions[nextStep] },
        ];
        stepMessageIndex.current[nextStep] = updated.length - 1;
        return updated;
      });
      setIsTyping(false);
      setStep(nextStep);
    }, TYPING_INDICATOR_DELAY_MS);
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
      const answer = trimmed || l.skipped;
      setExpertiseDetails(trimmed);
      advanceToStep("commitment", answer);
    }
  }

  function handleExpertiseSelect(level: ExpertiseLevel) {
    setExpertise(level);
    advanceToStep("expertiseDetails", expertiseLabels[level] || level);
  }

  function handleCommitmentSelect(freq: CommitmentFrequency) {
    setCommitment(freq);
    advanceToStep("duration", commitmentLabels[freq] || freq);
  }

  function handleDurationSelect(months: number) {
    setDuration(months);
    const label = months === 1 ? l.month : `${months} ${l.months}`;

    if (commitment) {
      const modules = calculateModules(
        commitment as CommitmentFrequency,
        months
      );
      if (modules < MIN_MODULES) {
        setMessages((prev) => [...prev, { role: "user", text: label }]);
        setInputValue("");
        setIsTyping(true);
        setTimeout(() => {
          setMessages((prev) => {
            const updated = [
              ...prev,
              {
                role: "system" as const,
                text: l.minModulesError.replace("{steps}", String(modules)).replace("{min}", String(MIN_MODULES)),
              },
            ];
            stepMessageIndex.current.commitment = updated.length - 1;
            return updated;
          });
          setIsTyping(false);
          setStep("commitment");
          setCommitment("");
          setDuration("");
        }, TYPING_INDICATOR_DELAY_MS);
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

    const msgIndex = stepMessageIndex.current[targetStep];
    if (msgIndex === undefined) return;

    setMessages((prev) => prev.slice(0, msgIndex + 1));

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
      if (s !== targetStep) {
        delete stepMessageIndex.current[s];
      }
    }

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
      expertiseDetail: expertiseDetails || l.none,
      totalModules: modules,
    });
  }

  const summaryItems = [
    { label: l.topic, value: topic, targetStep: "topic" as StepKey },
    { label: l.details, value: details, targetStep: "details" as StepKey },
    { label: l.expertise, value: expertise ? (expertiseLabels[expertise] || expertise) : "", targetStep: "expertise" as StepKey },
    { label: l.expertiseDetails, value: expertiseDetails || l.skipped, targetStep: "expertiseDetails" as StepKey },
    { label: l.commitment, value: commitment ? (commitmentLabels[commitment] || commitment) : "", targetStep: "commitment" as StepKey },
    { label: l.duration, value: duration ? (duration === 1 ? l.month : `${duration} ${l.months}`) : "", targetStep: "duration" as StepKey },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 w-full max-w-2xl mx-4 flex flex-col max-h-[90vh] rounded-lg border border-theme-border bg-theme-surface shadow-lg shadow-[color:var(--t-glow)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-theme-border px-6 py-4">
          <h3 className="text-lg font-semibold text-theme-primary tracking-wide">
            <span className="text-theme-secondary">{">"}</span> {l.title}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover transition-colors"
            aria-label={common.close}
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
          <ChatMessages messages={messages} isTyping={isTyping} />

          {step === "done" && (
            <SummaryReview
              items={summaryItems}
              onEditStep={handleEditStep}
              onBegin={handleBegin}
            />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-theme-border px-6 py-4">
          {step !== "done" && !isTyping ? (
            <StepInput
              step={step}
              inputValue={inputValue}
              inputRef={inputRef}
              textareaRef={textareaRef}
              onInputChange={setInputValue}
              onTextSubmit={handleTextSubmit}
              onExpertiseSelect={handleExpertiseSelect}
              onCommitmentSelect={handleCommitmentSelect}
              onDurationSelect={handleDurationSelect}
            />
          ) : step === "done" ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-theme-border text-theme-primary hover:bg-theme-surface-hover transition-colors text-sm"
              >
                {common.cancel}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
