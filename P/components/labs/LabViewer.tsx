"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TheorySection } from "@/components/labs/TheorySection";
import { PracticalSteps } from "@/components/labs/PracticalSteps";
import { CodeSimulation } from "@/components/labs/CodeSimulation";
import { QuizPlayer, type Question } from "@/components/labs/QuizPlayer";

type LabRecord = {
  id: string;
  title: string;
  description: string | null;
  theory_content: unknown;
  practical_steps: unknown;
  code_examples: unknown;
};

export function LabViewer({
  lab,
  questions,
}: {
  lab: LabRecord;
  questions: Question[];
}) {
  const theory = (lab.theory_content ?? {}) as {
    sections?: { heading: string; body: string }[];
  };
  const steps = (lab.practical_steps ?? []) as {
    step: number;
    title: string;
    detail: string;
  }[];
  const code = (lab.code_examples ?? []) as {
    language: string;
    code: string;
    explanation?: string;
  }[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-heading">{lab.title}</h1>
        {lab.description ? (
          <p className="mt-2 text-muted-foreground">{lab.description}</p>
        ) : null}
      </div>
      <Tabs defaultValue="theory" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-muted/80 md:grid-cols-4">
          <TabsTrigger value="theory">Theory</TabsTrigger>
          <TabsTrigger value="practical">Practical</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
        </TabsList>
        <TabsContent value="theory" className="mt-6">
          <TheorySection sections={theory.sections ?? []} />
        </TabsContent>
        <TabsContent value="practical" className="mt-6">
          <PracticalSteps steps={steps} />
        </TabsContent>
        <TabsContent value="code" className="mt-6">
          <CodeSimulation examples={code} />
        </TabsContent>
        <TabsContent value="quiz" className="mt-6">
          <QuizPlayer labId={lab.id} questions={questions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
