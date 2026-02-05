import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal as RNModal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n } from "../../i18n/I18nProvider";
import { Button, Input } from "../ui";
import { MIN_MODULES } from "@learn-anything/shared";
import type { LearningPlanData } from "../../hooks";

type Step = "topic" | "details" | "expertise" | "expertiseDetails" | "commitment" | "duration" | "done";
type StepKey = Exclude<Step, "done">;

interface Message {
  role: "system" | "user";
  text: string;
}

const EXPERTISE_LEVELS = ["No clue", "Beginner", "Intermediate", "Advanced", "Expert"];

const COMMITMENT_OPTIONS = [
  { label: "Daily", days: 1 },
  { label: "Every 3 days", days: 3 },
  { label: "Weekly", days: 7 },
  { label: "Bi-weekly", days: 14 },
  { label: "Monthly", days: 30 },
];

const DURATION_OPTIONS = [
  { label: "1 month", months: 1 },
  { label: "2 months", months: 2 },
  { label: "3 months", months: 3 },
  { label: "6 months", months: 6 },
  { label: "9 months", months: 9 },
  { label: "12 months", months: 12 },
];

interface LearnModalProps {
  onClose: () => void;
  onSubmit: (data: LearningPlanData) => void;
  initialData?: LearningPlanData | null;
}

export default function LearnModal({ onClose, onSubmit, initialData }: LearnModalProps) {
  const { t } = useI18n();
  const l = t.learn as Record<string, string>;
  const c = t.common as Record<string, string>;
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  // Translated option labels
  const expertiseLevels = [
    l.expertiseNoClue || "No clue",
    l.expertiseBeginner || "Beginner",
    l.expertiseIntermediate || "Intermediate",
    l.expertiseAdvanced || "Advanced",
    l.expertiseExpert || "Expert",
  ];

  const translateExpertise = (english: string) =>
    expertiseLevels[EXPERTISE_LEVELS.indexOf(english)] || english;

  const commitmentOptions = [
    { label: l.commitDaily || "Daily", days: 1 },
    { label: l.commitEvery3Days || "Every 3 days", days: 3 },
    { label: l.commitWeekly || "Weekly", days: 7 },
    { label: l.commitBiWeekly || "Bi-weekly", days: 14 },
    { label: l.commitMonthly || "Monthly", days: 30 },
  ];

  const durationOptions = [
    { label: l.month || "1 month", months: 1 },
    { label: `2 ${l.months || "months"}`, months: 2 },
    { label: `3 ${l.months || "months"}`, months: 3 },
    { label: `6 ${l.months || "months"}`, months: 6 },
    { label: `9 ${l.months || "months"}`, months: 9 },
    { label: `12 ${l.months || "months"}`, months: 12 },
  ];

  // Initialize state from initialData on mount (component is conditionally rendered)
  const stepMessageIndex = useRef<Partial<Record<StepKey, number>>>(
    initialData
      ? { topic: 0, details: 2, expertise: 4, expertiseDetails: 6, commitment: 8, duration: 10 }
      : { topic: 0 }
  );

  const [step, setStep] = useState<Step>(initialData ? "done" : "topic");
  const [messages, setMessages] = useState<Message[]>(() => {
    if (initialData) {
      return [
        { role: "system", text: l.questionTopic || "What do you want to learn?" },
        { role: "user", text: initialData.whatToLearn },
        { role: "system", text: l.questionDetails || "Tell me more about your learning goals." },
        { role: "user", text: initialData.openDetail },
        { role: "system", text: l.questionExpertise || "What's your current expertise level?" },
        { role: "user", text: translateExpertise(initialData.currentExpertise) },
        { role: "system", text: l.questionExpertiseDetails || "Tell me more about your current level (optional)." },
        { role: "user", text: initialData.expertiseDetail || (l.skipped || "(skipped)") },
        { role: "system", text: l.questionCommitment || "How often can you dedicate time?" },
        { role: "user", text: commitmentOptions.find((o) => o.days === initialData.commitmentDays)?.label || "" },
        { role: "system", text: l.questionDuration || "How long do you want this to take?" },
        { role: "user", text: durationOptions.find((o) => o.months === initialData.durationMonths)?.label || "" },
        { role: "system", text: l.summaryInstruction || "Here's a summary. Click any to edit." },
      ];
    }
    return [{ role: "system", text: l.questionTopic || "What do you want to learn?" }];
  });
  const [inputValue, setInputValue] = useState("");

  // Form values
  const [topic, setTopic] = useState(initialData?.whatToLearn || "");
  const [details, setDetails] = useState(initialData?.openDetail || "");
  const [expertise, setExpertise] = useState(initialData?.currentExpertise || "");
  const [expertiseDetails, setExpertiseDetails] = useState(initialData?.expertiseDetail || "");
  const [commitmentDays, setCommitmentDays] = useState(initialData?.commitmentDays || 0);
  const [durationMonths, setDurationMonths] = useState(initialData?.durationMonths || 0);

  const pendingEdit = useRef<StepKey | null>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  function addMessages(userText: string, systemText: string, nextStep: Step) {
    setMessages((prev) => {
      const newMessages: Message[] = [
        ...prev,
        { role: "user", text: userText },
        { role: "system", text: systemText },
      ];
      if (nextStep !== "done") {
        stepMessageIndex.current[nextStep as StepKey] = newMessages.length - 1;
      }
      return newMessages;
    });
    setStep(nextStep);
    setInputValue("");
  }

  interface RebuildOverrides {
    topic?: string;
    details?: string;
    expertise?: string;
    expertiseDetails?: string;
    commitmentDays?: number;
    durationMonths?: number;
  }

  function rebuildMessagesAndFinish(overrides: RebuildOverrides = {}) {
    const t_ = overrides.topic ?? topic;
    const d_ = overrides.details ?? details;
    const e_ = overrides.expertise ?? expertise;
    const ed_ = overrides.expertiseDetails ?? expertiseDetails;
    const cd_ = overrides.commitmentDays ?? commitmentDays;
    const dm_ = overrides.durationMonths ?? durationMonths;

    const rebuilt: Message[] = [
      { role: "system", text: l.questionTopic || "What do you want to learn?" },
      { role: "user", text: t_ },
      { role: "system", text: l.questionDetails || "Tell me more about your learning goals." },
      { role: "user", text: d_ },
      { role: "system", text: l.questionExpertise || "What's your current expertise level?" },
      { role: "user", text: translateExpertise(e_) },
      { role: "system", text: l.questionExpertiseDetails || "Tell me more about your current level (optional)." },
      { role: "user", text: ed_ || (l.skipped || "(skipped)") },
      { role: "system", text: l.questionCommitment || "How often can you dedicate time?" },
      { role: "user", text: commitmentOptions.find((o) => o.days === cd_)?.label || "" },
      { role: "system", text: l.questionDuration || "How long do you want this to take?" },
      { role: "user", text: durationOptions.find((o) => o.months === dm_)?.label || "" },
      { role: "system", text: l.summaryInstruction || "Here's a summary. Click any to edit." },
    ];

    stepMessageIndex.current = {
      topic: 0,
      details: 2,
      expertise: 4,
      expertiseDetails: 6,
      commitment: 8,
      duration: 10,
    };

    setMessages(rebuilt);
    setStep("done");
    setInputValue("");
    pendingEdit.current = null;
  }

  function handleEditStep(targetStep: StepKey) {
    const msgIndex = stepMessageIndex.current[targetStep];
    if (msgIndex === undefined) return;

    pendingEdit.current = targetStep;
    setMessages((prev) => prev.slice(0, msgIndex + 1));

    if (targetStep === "topic") setInputValue(topic);
    else if (targetStep === "details") setInputValue(details);
    else if (targetStep === "expertiseDetails") setInputValue(expertiseDetails);
    else setInputValue("");

    setStep(targetStep);
  }

  function handleTopicSubmit() {
    if (!inputValue.trim()) return;
    const val = inputValue.trim();
    setTopic(val);
    if (pendingEdit.current === "topic") {
      rebuildMessagesAndFinish({ topic: val });
      return;
    }
    addMessages(
      val,
      l.questionDetails || "Tell me more about your learning goals for this topic.",
      "details"
    );
  }

  function handleDetailsSubmit() {
    if (!inputValue.trim()) return;
    const val = inputValue.trim();
    setDetails(val);
    if (pendingEdit.current === "details") {
      rebuildMessagesAndFinish({ details: val });
      return;
    }
    addMessages(
      val,
      l.questionExpertise || "What's your current expertise level?",
      "expertise"
    );
  }

  function handleExpertiseSelect(level: string) {
    setExpertise(level);
    if (pendingEdit.current === "expertise") {
      rebuildMessagesAndFinish({ expertise: level });
      return;
    }
    addMessages(
      translateExpertise(level),
      l.questionExpertiseDetails || "Tell me more about your current level (optional).",
      "expertiseDetails"
    );
  }

  function handleExpertiseDetailsSubmit() {
    const val = inputValue.trim();
    setExpertiseDetails(val);
    if (pendingEdit.current === "expertiseDetails") {
      rebuildMessagesAndFinish({ expertiseDetails: val });
      return;
    }
    addMessages(
      val || (l.skipped || "(skipped)"),
      l.questionCommitment || "How often can you dedicate time?",
      "commitment"
    );
  }

  function handleCommitmentSelect(days: number, label: string) {
    setCommitmentDays(days);
    if (pendingEdit.current === "commitment") {
      const totalModules = Math.floor((durationMonths * 30) / days);
      if (totalModules < MIN_MODULES) {
        const errorMsg = (l.minModulesError || "That combination only gives {steps} step(s), but we need at least {min}.")
          .replace("{steps}", String(totalModules))
          .replace("{min}", String(MIN_MODULES));
        setMessages((prev) => [...prev, { role: "user", text: label }, { role: "system", text: errorMsg }]);
        setCommitmentDays(0);
        setDurationMonths(0);
        delete stepMessageIndex.current.commitment;
        delete stepMessageIndex.current.duration;
        pendingEdit.current = null;
        setStep("commitment");
        return;
      }
      rebuildMessagesAndFinish({ commitmentDays: days });
      return;
    }
    addMessages(
      label,
      l.questionDuration || "How long do you want this to take?",
      "duration"
    );
  }

  function handleDurationSelect(months: number, label: string) {
    const currentCommitmentDays = commitmentDays;
    const totalModules = Math.floor((months * 30) / currentCommitmentDays);
    if (totalModules < MIN_MODULES) {
      const errorMsg = (l.minModulesError || "That combination only gives {steps} step(s), but we need at least {min}.")
        .replace("{steps}", String(totalModules))
        .replace("{min}", String(MIN_MODULES));
      setMessages((prev) => [...prev, { role: "user", text: label }, { role: "system", text: errorMsg }]);
      setCommitmentDays(0);
      setDurationMonths(0);
      delete stepMessageIndex.current.commitment;
      delete stepMessageIndex.current.duration;
      pendingEdit.current = null;
      setStep("commitment");
      return;
    }
    setDurationMonths(months);
    if (pendingEdit.current === "duration") {
      rebuildMessagesAndFinish({ durationMonths: months });
      return;
    }
    addMessages(
      label,
      l.summaryInstruction || "All set! Review your answers below — click any to edit.",
      "done"
    );
  }

  function handleSubmit() {
    const totalDays = durationMonths * 30;
    const totalModules = Math.max(1, Math.floor(totalDays / commitmentDays));
    onSubmit({
      whatToLearn: topic,
      openDetail: details,
      currentExpertise: expertise,
      expertiseDetail: expertiseDetails,
      totalModules,
      commitmentDays,
      durationMonths,
    });
  }

  return (
    <RNModal
      visible
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-theme-bg" style={{ paddingTop: insets.top }}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-2 border-b border-theme-primary/30 bg-theme-surface">
          <Text className="font-mono text-base font-bold text-theme-primary tracking-wider">
            {">"} {l.title || "NEW_PROCESS"}
          </Text>
          <Pressable onPress={onClose} className="py-1">
            <Text className="font-mono text-base text-theme-muted">[ESC]</Text>
          </Pressable>
        </View>

        {/* Chat Area */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 py-4"
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, i) => (
            <View
              key={i}
              className={`mb-3 max-w-[85%] ${
                msg.role === "user" ? "self-end" : "self-start"
              }`}
            >
              <View
                className={`px-3 py-2 ${
                  msg.role === "user"
                    ? "border border-theme-primary/30 bg-theme-primary-dim"
                    : "border border-theme-primary/15 bg-theme-surface"
                }`}
              >
                <Text
                  className={`font-mono text-sm ${
                    msg.role === "user" ? "text-theme-primary" : "text-theme-secondary"
                  }`}
                >
                  {msg.role === "system" ? "> " : "$ "}{msg.text}
                </Text>
              </View>
            </View>
          ))}

          {/* Expertise Level Buttons */}
          {step === "expertise" && (
            <View className="gap-2 mt-2 mb-4">
              {expertiseLevels.map((level, index) => (
                <Pressable
                  key={level}
                  onPress={() => handleExpertiseSelect(EXPERTISE_LEVELS[index])}
                  className="border border-theme-primary/20 bg-theme-surface px-3 py-2"
                >
                  <Text className="font-mono text-sm text-theme-secondary">
                    <Text className="text-theme-primary">[{String(index + 1).padStart(2, "0")}]</Text> {level}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Commitment Buttons */}
          {step === "commitment" && (
            <View className="gap-2 mt-2 mb-4">
              {commitmentOptions.map((opt, index) => (
                <Pressable
                  key={opt.days}
                  onPress={() => handleCommitmentSelect(opt.days, opt.label)}
                  className="border border-theme-primary/20 bg-theme-surface px-3 py-2"
                >
                  <Text className="font-mono text-sm text-theme-secondary">
                    <Text className="text-theme-primary">[{String(index + 1).padStart(2, "0")}]</Text> {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Duration Buttons */}
          {step === "duration" && (
            <View className="gap-2 mt-2 mb-4">
              {durationOptions.map((opt, index) => (
                <Pressable
                  key={opt.months}
                  onPress={() => handleDurationSelect(opt.months, opt.label)}
                  className="border border-theme-primary/20 bg-theme-surface px-3 py-2"
                >
                  <Text className="font-mono text-sm text-theme-secondary">
                    <Text className="text-theme-primary">[{String(index + 1).padStart(2, "0")}]</Text> {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Summary / Done */}
          {step === "done" && (
            <View className="mt-4 border border-theme-primary/20 bg-theme-surface p-3 mb-4">
              <Text className="font-mono text-sm text-theme-muted uppercase tracking-wider mb-3">
                {">"} {l.summary || "SUMMARY"}
              </Text>
              <View className="gap-1">
                <SummaryRow
                  label={l.topic || "TOPIC"}
                  value={topic}
                  onPress={() => handleEditStep("topic")}
                />
                <SummaryRow
                  label={l.details || "DETAILS"}
                  value={details}
                  onPress={() => handleEditStep("details")}
                />
                <SummaryRow
                  label={l.expertise || "LEVEL"}
                  value={translateExpertise(expertise)}
                  onPress={() => handleEditStep("expertise")}
                />
                {expertiseDetails ? (
                  <SummaryRow
                    label={l.expertiseDetails || "BACKGROUND"}
                    value={expertiseDetails}
                    onPress={() => handleEditStep("expertiseDetails")}
                  />
                ) : null}
                <SummaryRow
                  label={l.commitment || "FREQUENCY"}
                  value={commitmentOptions.find((o) => o.days === commitmentDays)?.label || ""}
                  onPress={() => handleEditStep("commitment")}
                />
                <SummaryRow
                  label={l.duration || "DURATION"}
                  value={durationOptions.find((o) => o.months === durationMonths)?.label || ""}
                  onPress={() => handleEditStep("duration")}
                />
                <View className="flex-row mt-1">
                  <Text className="font-mono text-sm text-theme-muted w-28">MODULES:</Text>
                  <Text className="font-mono text-sm text-theme-secondary flex-1">
                    {String(Math.max(1, Math.floor((durationMonths * 30) / commitmentDays)))}
                  </Text>
                </View>
              </View>
              <View className="mt-4">
                <Button onPress={handleSubmit}>
                  {l.begin || "INITIALIZE"}
                </Button>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        {(step === "topic" || step === "details" || step === "expertiseDetails") && (
          <View className="px-4 py-3 border-t border-theme-primary/30 bg-theme-surface flex-row gap-2">
            {step === "expertiseDetails" ? (
              <>
                <View className="flex-1">
                  <Input
                    value={inputValue}
                    onChangeText={setInputValue}
                    placeholder={l.expertiseDetailPlaceholder || "Optional..."}
                    returnKeyType="send"
                    onSubmitEditing={handleExpertiseDetailsSubmit}
                  />
                </View>
                <Button size="sm" onPress={handleExpertiseDetailsSubmit}>
                  {inputValue.trim() ? (c.send || "SEND") : (l.skip || "SKIP")}
                </Button>
              </>
            ) : (
              <>
                <View className="flex-1">
                  <Input
                    value={inputValue}
                    onChangeText={setInputValue}
                    placeholder={
                      step === "topic"
                        ? (l.topicPlaceholder || "e.g., Machine Learning, Piano, Spanish...")
                        : (l.detailsPlaceholder || "Tell me more...")
                    }
                    returnKeyType="send"
                    onSubmitEditing={
                      step === "topic" ? handleTopicSubmit : handleDetailsSubmit
                    }
                  />
                </View>
                <Button
                  size="sm"
                  onPress={step === "topic" ? handleTopicSubmit : handleDetailsSubmit}
                  disabled={!inputValue.trim()}
                >
                  {c.send || "SEND"}
                </Button>
              </>
            )}
          </View>
        )}
        </KeyboardAvoidingView>
      </View>
    </RNModal>
  );
}

function SummaryRow({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-row py-1">
      <Text className="font-mono text-sm text-theme-muted w-28">{label}:</Text>
      <Text className="font-mono text-sm text-theme-secondary flex-1">{value}</Text>
      {onPress && (
        <Text className="font-mono text-xs text-theme-primary ml-2">[edit]</Text>
      )}
    </Pressable>
  );
}
