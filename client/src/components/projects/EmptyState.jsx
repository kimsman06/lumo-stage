import React from "react";
import { Plus, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmptyState = ({ onCreateNew }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4">
    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
      <Lightbulb className="w-12 h-12 text-primary" />
    </div>
    <h3 className="text-2xl font-bold mb-2">No Projects Yet</h3>
    <p className="text-muted-foreground text-center max-w-md mb-6">
      프로젝트를 생성하여 3D 조명 시뮬레이션을 시작하세요.
    </p>
    <Button size="lg" onClick={onCreateNew} className="gap-2">
      <Plus className="w-5 h-5" />
      Create Your First Project
    </Button>
  </div>
);

export default EmptyState;