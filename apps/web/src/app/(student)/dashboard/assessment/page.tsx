"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { api } from "@/lib/api";
import {
  PHQ9_QUESTIONS,
  PHQ9_Q9_WARNING,
  GAD7_QUESTIONS,
  RESPONSE_SCALE,
} from "@/lib/constants";

// ── Types ──────────────────────────────────────────────────────────────────────
type SleepScore     = 1 | 2 | 3 | 4 | 5;
type StressScore    = 1 | 2 | 3 | 4 | 5;
type IsolationLevel = "LOW" | "MEDIUM" | "HIGH";

interface AssessmentData {
  phq9:       number[];    // 9 values, 0-3
  gad7:       number[];    // 7 values, 0-3
  sleep:      SleepScore | null;
  stress:     StressScore | null;
  isolation:  IsolationLevel | null;
}

type Step = "phq9" | "gad7" | "behavioral" | "review" | "result";

const SOFT_RESULTS: Record<string, { title: string; body: string; bg: string; border: string }> = {
  GREEN:  {
    title: "You're doing well.",
    body:  "It looks like you're managing things well at the moment. Optional support is always available if you'd ever like to talk.",
    bg: "#E8F2EE", border: "#B8D4C0",
  },
  YELLOW: {
    title: "Some support is available.",
    body:  "Things seem a little heavy right now. We'll help connect you with a counsellor who can offer some guidance.",
    bg: "#FEF4E0", border: "#E8D4B0",
  },
  RED: {
    title: "You've been prioritised for care.",
    body:  "We recommend immediate support. You've been placed at the top of the counselling queue — someone will reach out very soon.",
    bg: "#FDEAEA", border: "#F5B8B8",
  },
};

// Background tints per question group  
const BG_TINTS: Record<Step, string> = {
  phq9:       "linear-gradient(135deg, #F5F3EF 0%, #E8F2EE 100%)",
  gad7:       "linear-gradient(135deg, #F5F3EF 0%, #EAF0F8 100%)",
  behavioral: "linear-gradient(135deg, #F5F3EF 0%, #FAF2E6 100%)",
  review:     "linear-gradient(135deg, #F5F3EF 0%, #F5F3EF 100%)",
  result:     "linear-gradient(135deg, #F5F3EF 0%, #E8F2EE 100%)",
};

const TOTAL_SLIDES = PHQ9_QUESTIONS.length + GAD7_QUESTIONS.length + 3 + 1; // +3 behavioral, +1 review

// ── Ripple checkbox ────────────────────────────────────────────────────────────
function RadioOption({
  value,
  label,
  selected,
  onSelect,
}: {
  value: number;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative overflow-hidden w-full text-left flex items-center gap-4 rounded-xl border px-5 py-4",
        "font-sans text-base transition-all duration-200",
        selected
          ? "bg-[#E8F2EE] border-[#7BA89A] text-[#3D5A54] font-medium"
          : "bg-white border-[#E8F2EE] text-[#3D5A54]/70 hover:border-[#B8D4C0] hover:bg-[#F5F3EF]"
      )}
    >
      <span
        className={cn(
          "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all",
          selected ? "border-[#7BA89A] bg-[#7BA89A]" : "border-[#B8D4C0]"
        )}
      >
        {selected && <span className="w-2 h-2 rounded-full bg-white" />}
      </span>
      <span className="text-sm text-[#3D5A54]/40 mr-1 font-mono">{value}</span>
      {label}
    </button>
  );
}

// ── 1-5 Slider ─────────────────────────────────────────────────────────────────
function ScoreSlider({
  value,
  onChange,
  lowLabel,
  highLabel,
  tint,
}: {
  value: number | null;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
  tint: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs font-sans text-[#3D5A54]/50">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "w-12 h-12 rounded-full font-sans text-sm font-medium transition-all duration-200 cursor-none border",
              value === v
                ? "text-white scale-110"
                : "bg-white text-[#3D5A54]/50 border-[#E8F2EE] hover:border-[#B8D4C0]"
            )}
            style={value === v ? { background: tint, borderColor: tint } : {}}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AssessmentPage() {
  const [step, setStep] = useState<Step>("phq9");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [result, setResult] = useState<"GREEN" | "YELLOW" | "RED" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<AssessmentData>({
    phq9: Array(PHQ9_QUESTIONS.length).fill(-1),
    gad7: Array(GAD7_QUESTIONS.length).fill(-1),
    sleep: null,
    stress: null,
    isolation: null,
  });

  const currentQuestions = step === "phq9" ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
  const currentAnswers   = step === "phq9" ? data.phq9 : data.gad7;
  const totalQuestions   = currentQuestions.length;

  // Progress bar width
  let progressPct = 0;
  if (step === "phq9")       progressPct = (questionIndex / TOTAL_SLIDES) * 100;
  else if (step === "gad7")  progressPct = ((PHQ9_QUESTIONS.length + questionIndex) / TOTAL_SLIDES) * 100;
  else if (step === "behavioral") progressPct = 80;
  else if (step === "review")    progressPct = 92;
  else progressPct = 100;

  const isQ9 = step === "phq9" && questionIndex === 8;

  const setAnswer = (val: number) => {
    if (step === "phq9") {
      const next = [...data.phq9];
      next[questionIndex] = val;
      setData((d) => ({ ...d, phq9: next }));
    } else {
      const next = [...data.gad7];
      next[questionIndex] = val;
      setData((d) => ({ ...d, gad7: next }));
    }
  };

  const goNext = () => {
    const questions = step === "phq9" ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((i) => i + 1);
    } else if (step === "phq9") {
      setStep("gad7");
      setQuestionIndex(0);
    } else if (step === "gad7") {
      setStep("behavioral");
    } else if (step === "behavioral") {
      setStep("review");
    }
  };

  const goPrev = () => {
    if (step === "phq9" || step === "gad7") {
      if (questionIndex > 0) {
        setQuestionIndex((i) => i - 1);
      } else if (step === "gad7") {
        setStep("phq9");
        setQuestionIndex(PHQ9_QUESTIONS.length - 1);
      }
    } else if (step === "behavioral") {
      setStep("gad7");
      setQuestionIndex(GAD7_QUESTIONS.length - 1);
    } else if (step === "review") {
      setStep("behavioral");
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Transform arrays back to objects for schema
      const phq9Obj: Record<string, number> = {};
      data.phq9.forEach((v, i) => { phq9Obj[`q${i + 1}`] = v; });

      const gad7Obj: Record<string, number> = {};
      data.gad7.forEach((v, i) => { gad7Obj[`q${i + 1}`] = v; });

      const response = await api.post<any>("/students/me/assessments", {
        phq9: phq9Obj,
        gad7: gad7Obj,
        sleep_score: data.sleep || 3,
        academic_stress_score: data.stress || 3,
        social_isolation_level: data.isolation || "MEDIUM"
      });

      // Calculate result for UI display (matched with backend logic ideally)
      const phq9Total = data.phq9.reduce((a, b) => a + Math.max(b, 0), 0);
      const gad7Total = data.gad7.reduce((a, b) => a + Math.max(b, 0), 0);
      const q9Flag    = (data.phq9[8] ?? 0) >= 1;
      
      if (q9Flag || phq9Total > 16 || gad7Total > 12) {
        setResult("RED");
      } else if (phq9Total > 9 || gad7Total > 7) {
        setResult("YELLOW");
      } else {
        setResult("GREEN");
      }
      setStep("result");
    } catch (err) {
      console.error("Failed to submit assessment", err);
      alert("Something went wrong with submission. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentAnswer = (step === "phq9" || step === "gad7") ? currentAnswers[questionIndex] : -1;
  const canProceed = currentAnswer >= 0;

  if (step === "result" && result) {
    const r = SOFT_RESULTS[result];
    return (
      <div
        className="min-h-[70vh] flex items-center justify-center px-4"
        style={{ background: BG_TINTS.result }}
      >
        <div
          className="animate-scale-in max-w-md w-full rounded-[24px] border p-10 flex flex-col items-center gap-6 text-center"
          style={{ background: r.bg, borderColor: r.border }}
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: r.border }}>
            <span className="text-4xl">◎</span>
          </div>
          <h2 className="font-serif text-3xl text-[#3D5A54]">{r.title}</h2>
          <p className="font-sans font-normal text-lg text-[#3E5C52] leading-relaxed">{r.body}</p>
          <a href="/dashboard" className="btn-primary text-base px-8 py-3">
            Back to dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-[80vh] flex flex-col"
      style={{ background: BG_TINTS[step] }}
    >
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-[#E8F2EE] fixed top-0 left-0 right-0 z-10">
        <div
          className="h-full bg-[#7BA89A] transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-8 py-12 max-w-2xl mx-auto w-full">

        {/* Section label */}
        <p className="font-sans text-sm font-medium tracking-widest uppercase text-[#7BA89A] mb-6 animate-fade-in">
          {step === "phq9" ? "Mood & energy" : step === "gad7" ? "Anxiety & worry" : step === "behavioral" ? "Sleep & daily life" : "Review your answers"}
        </p>

        {/* Question slide */}
        {(step === "phq9" || step === "gad7") && (
          <div key={`${step}-${questionIndex}`} className="w-full animate-slide-up flex flex-col gap-8">
            {/* Q9 warning */}
            {isQ9 && (
              <div className="rounded-xl bg-[#FEF4E0] border border-[#E8D4B0] px-5 py-4">
                <p className="font-sans text-base text-[#A0700A] leading-relaxed">{PHQ9_Q9_WARNING}</p>
              </div>
            )}

            <h2 className="font-serif text-2xl md:text-3xl text-[#3D5A54] leading-snug">
              Over the last two weeks, how often have you been bothered by…
              <br />
              <span className="text-[#3D5A54]/90">{currentQuestions[questionIndex]}</span>
            </h2>

            <div className="flex flex-col gap-3">
              {RESPONSE_SCALE.map((opt) => (
                <RadioOption
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                  selected={currentAnswers[questionIndex] === opt.value}
                  onSelect={() => setAnswer(opt.value)}
                />
              ))}
            </div>

            <p className="font-sans text-base text-[#3D5A54]/50 text-center">
              Question {questionIndex + 1} of {totalQuestions}
            </p>
          </div>
        )}

        {/* Behavioral */}
        {step === "behavioral" && (
          <div key="behavioral" className="w-full animate-slide-up flex flex-col gap-10">
            <h2 className="font-serif text-2xl md:text-3xl text-[#3D5A54]">
              A few more things about your daily life.
            </h2>

            <div className="flex flex-col gap-8">
              {/* Sleep */}
              <div className="flex flex-col gap-3">
                <p className="font-sans font-medium text-base text-[#3D5A54]">How has your sleep been lately?</p>
                <ScoreSlider
                  value={data.sleep}
                  onChange={(v) => setData((d) => ({ ...d, sleep: v as SleepScore }))}
                  lowLabel="Very poor"
                  highLabel="Very good"
                  tint="#E8D4B0"
                />
              </div>

              {/* Stress */}
              <div className="flex flex-col gap-3">
                <p className="font-sans font-medium text-sm text-[#3D5A54]">How would you rate your academic pressure right now?</p>
                <ScoreSlider
                  value={data.stress}
                  onChange={(v) => setData((d) => ({ ...d, stress: v as StressScore }))}
                  lowLabel="No pressure"
                  highLabel="Overwhelming"
                  tint="#C4D4E8"
                />
              </div>

              {/* Isolation */}
              <div className="flex flex-col gap-3">
                <p className="font-sans font-medium text-sm text-[#3D5A54]">How connected do you feel to people around you?</p>
                <div className="flex gap-3">
                  {(["HIGH", "MEDIUM", "LOW"] as IsolationLevel[]).map((level) => {
                    const labels: Record<IsolationLevel, string> = { HIGH: "Very connected", MEDIUM: "Somewhat", LOW: "Quite isolated" };
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setData((d) => ({ ...d, isolation: level }))}
                        className={cn(
                          "flex-1 py-3 rounded-xl border font-sans text-sm transition-all cursor-none",
                          data.isolation === level
                            ? "bg-[#E8F2EE] border-[#7BA89A] text-[#3D5A54] font-medium"
                            : "bg-white border-[#E8F2EE] text-[#3D5A54]/60 hover:border-[#B8D4C0]"
                        )}
                      >
                        {labels[level]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review */}
        {step === "review" && (
          <div key="review" className="w-full animate-slide-up flex flex-col gap-6">
            <h2 className="font-serif text-2xl text-[#3D5A54]">You're all done.</h2>
            <p className="font-sans font-normal text-sm text-[#3D5A54]/75 leading-relaxed">
              We've recorded your responses. When you're ready, submit to find out what support looks like for you right now.
            </p>
            <div className="rounded-xl bg-[#E8F2EE] border border-[#B8D4C0] p-5 flex flex-col gap-3">
              <p className="font-sans text-sm text-[#3D5A54]/60 flex justify-between">
                <span>PHQ-9 responses</span>
                <span className="font-medium text-[#3D5A54]">{data.phq9.filter((v) => v >= 0).length}/{PHQ9_QUESTIONS.length} answered</span>
              </p>
              <p className="font-sans text-sm text-[#3D5A54]/60 flex justify-between">
                <span>GAD-7 responses</span>
                <span className="font-medium text-[#3D5A54]">{data.gad7.filter((v) => v >= 0).length}/{GAD7_QUESTIONS.length} answered</span>
              </p>
              <p className="font-sans text-sm text-[#3D5A54]/60 flex justify-between">
                <span>Behavioural factors</span>
                <span className="font-medium text-[#3D5A54]">{[data.sleep, data.stress, data.isolation].filter(Boolean).length}/3 answered</span>
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex w-full gap-3 mt-10">
          {step !== "phq9" || questionIndex > 0 ? (
            <Button variant="ghost" onClick={goPrev} className="flex-1" id="assessment-back">
              Back
            </Button>
          ) : <div className="flex-1" />}

          {step === "review" ? (
            <Button
              onClick={handleSubmit}
              loading={submitting}
              className="flex-2 flex-grow"
              id="assessment-submit"
            >
              Submit check-in
            </Button>
          ) : (
            <Button
              onClick={goNext}
              disabled={step !== "behavioral" && !canProceed}
              className="flex-2 flex-grow"
              id="assessment-next"
            >
              {step === "behavioral" ? "Review answers" : "Next"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
