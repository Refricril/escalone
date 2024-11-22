// src/components/ui/EmptyState.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  onCreateFlow: () => void;
}

export const EmptyState = ({ onCreateFlow }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white rounded-lg shadow-sm">
      <div className="space-y-6 max-w-md">
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold tracking-tight">
            Comece seu primeiro fluxo
          </h3>
          <p className="text-gray-500">
            Crie um fluxo de trabalho personalizado para gerenciar suas tarefas de forma eficiente.
          </p>
        </div>

        <Button
          onClick={onCreateFlow}
          variant="default"
          className="flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Criar primeiro fluxo
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;