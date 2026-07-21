"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function LabCard({
  lab,
  completed = false,
}: {
  lab: {
    title: string;
    description: string | null;
    difficulty: string | null;
  };
  completed?: boolean;
}) {
  return (
    <motion.div whileHover={{ y: -3 }}>
      <Card className="h-full border-none bg-card shadow-soft">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-heading">{lab.title}</h3>
            <div className="flex shrink-0 flex-wrap gap-1">
              {completed ? (
                <Badge className="bg-[#1D9E75] text-white hover:bg-[#1D9E75]/90">
                  Completed
                </Badge>
              ) : null}
              {lab.difficulty ? (
                <Badge variant="secondary">{lab.difficulty}</Badge>
              ) : null}
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {lab.description ?? "Open lab to view theory, code, and quiz."}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
