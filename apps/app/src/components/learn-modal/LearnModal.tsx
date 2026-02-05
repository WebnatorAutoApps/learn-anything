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
import { TextArea } from "../ui/Input";
import type { LearningPlanData } from "../../hooks";
import { MIN_MODULES } from "@learn-anything/shared";

type Step = "topic" | "details" | "expertise" | "expertiseDetails" | "commitment" | "duration" | "done";

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
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: LearningPlanData) => void;
  initialData?: LearningPlanData | null;
}

export default function LearnModal({ visible, onClose, onSubmit, initialData }: LearnModalProps) {
  const { t } = useI18n();
  const l = t.learn as Record<string, string>;
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [step, setStep] = useState<Step>("topic");
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", text: l.whatToLearn || "What do you want to learn?" },
  ]);
  const [inputValue, setInputValue] = useState("");

  // Form values
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [expertise, setExpertise] = useState("");
  const [expertiseDetails, setExpertiseDetails] = useState("");
  const [commitmentDays, setCommitmentDays] = useState(0);
  const [durationMonths, setDurationMonths] = useState(0);

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setTopic(initialData.whatToLearn);
        setDetails(initialData.openDetail);
        setExpertise(initialData.currentExpertise);
        setExpertiseDetails(initialData.expertiseDetail);
        setCommitmentDays(initialData.commitmentDays);
        setDurationMonths(initialData.durationMonths);
        setInputValue("");
        const summaryMessages: Message[] = [
          { role: "system", text: l.whatToLearn || "What do you want to learn?" },
          { role: "user", text: initialData.whatToLearn },
          { role: "system", text: l.tellMeMore || "Tell me more about your learning goals for this topic." },
          { role: "user", text: initialData.openDetail },
          { role: "system", text: l.expertiseLevel || "What's your current expertise level?" },
          { role: "user", text: initialData.currentExpertise },
          { role: "system", text: l.expertiseMoreDetail || "Tell me more about your current level (optional)." },
          { role: "user", text: initialData.expertiseDetail || "(skipped)" },
          { role: "system", text: l.commitmentFrequency || "How often can you dedicate time?" },
          { role: "user", text: COMMITMENT_OPTIONS.find((o) => o.days === initialData.commitmentDays)?.label || "" },
          { role: "system", text: l.howLong || "How long do you want this to take?" },
          { role: "user", text: DURATION_OPTIONS.find((o) => o.months === initialData.durationMonths)?.label || "" },
          { role: "system", text: l.reviewSummary || "Here's a summary of your learning plan. Ready to begin?" },
        ];
        setMessages(summaryMessages);
        setStep("done");
      } else {
        setStep("topic");
        setMessages([
          { role: "system", text: l.whatToLearn || "What do you want to learn?" },
        ]);
        setInputValue("");
        setTopic("");
        setDetails("");
        setExpertise("");
        setExpertiseDetails("");
        setCommitmentDays(0);
        setDurationMonths(0);
      }
    }
  }, [visible]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  function addMessages(userText: string, systemText: string, nextStep: Step) {
    setMessages((prev) => [
      ...prev,
      { role: "user", text: userText },
      { role: "system", text: systemText },
    ]);
    setStep(nextStep);
    setInputValue("");
  }

  function handleTopicSubmit() {
    if (!inputValue.trim()) return;
    setTopic(inputValue.trim());
    addMessages(
      inputValue.trim(),
      l.tellMeMore || "Tell me more about your learning goals for this topic.",
      "details"
    );
  }

  function handleDetailsSubmit() {
    if (!inputValue.trim()) return;
    setDetails(inputValue.trim());
    addMessages(
      inputValue.trim(),
      l.expertiseLevel || "What's your current expertise level?",
      "expertise"
    );
  }

  function handleExpertiseSelect(level: string) {
    setExpertise(level);
    addMessages(
      level,
      l.expertiseMoreDetail || "Tell me more about your current level (optional).",
      "expertiseDetails"
    );
  }

  function handleExpertiseDetailsSubmit() {
    const val = inputValue.trim();
    setExpertiseDetails(val);
    addMessages(
      val || "(skipped)",
      l.commitmentFrequency || "How often can you dedicate time?",
      "commitment"
    );
  }

  function handleCommitmentSelect(days: number, label: string) {
    setCommitmentDays(days);
    addMessages(
      label,
      l.howLong || "How long do you want this to take?",
      "duration"
    );
  }

  function handleDurationSelect(months: number, label: string) {
    setDurationMonths(months);
    const totalDays = months * 30;
    const totalModules = Math.max(1, Math.floor(totalDays / commitmentDays));
    addMessages(
      label,
      l.reviewSummary || "Here's a summary of your learning plan. Ready to begin?",
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
      visible={visible}
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
            {">"} {l.learnSomethingNew || "NEW_PROCESS"}
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
              {EXPERTISE_LEVELS.map((level, index) => (
                <Pressable
                  key={level}
                  onPress={() => handleExpertiseSelect(level)}
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
              {COMMITMENT_OPTIONS.map((opt, index) => (
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
              {DURATION_OPTIONS.map((opt, index) => (
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
                {">"} SUMMARY
              </Text>
              <View className="gap-1">
                <SummaryRow label="TOPIC" value={topic} />
                <SummaryRow label="DETAILS" value={details} />
                <SummaryRow label="LEVEL" value={expertise} />
                {expertiseDetails && (
                  <SummaryRow label="BACKGROUND" value={expertiseDetails} />
                )}
                <SummaryRow
                  label="FREQUENCY"
                  value={COMMITMENT_OPTIONS.find((o) => o.days === commitmentDays)?.label || ""}
                />
                <SummaryRow
                  label="DURATION"
                  value={DURATION_OPTIONS.find((o) => o.months === durationMonths)?.label || ""}
                />
                <SummaryRow
                  label="MODULES"
                  value={String(Math.max(1, Math.floor((durationMonths * 30) / commitmentDays)))}
                />
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
                    placeholder="Optional..."
                    returnKeyType="send"
                    onSubmitEditing={handleExpertiseDetailsSubmit}
                  />
                </View>
                <Button size="sm" onPress={handleExpertiseDetailsSubmit}>
                  {inputValue.trim() ? "SEND" : "SKIP"}
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
                        ? "e.g., Machine Learning, Piano, Spanish..."
                        : "Tell me more..."
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
                  SEND
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row">
      <Text className="font-mono text-sm text-theme-muted w-28">{label}:</Text>
      <Text className="font-mono text-sm text-theme-secondary flex-1">{value}</Text>
    </View>
  );
}
