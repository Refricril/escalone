"use client";

import React from 'react';
import { Settings, Pencil, Trash2 } from "lucide-react";
import type { Flow } from "../../types";

interface FlowGridProps {
  flows: Flow[];
  onOpenFlow: (id: number) => void;
  onConfigureFlow: (id: number) => void;
  onRenameFlow: (flow: { id: number; name: string }) => void;
  onDeleteFlow: (id: number) => void;
}

const FlowGrid: React.FC<FlowGridProps> = ({
  flows,
  onOpenFlow,
  onConfigureFlow,
  onRenameFlow,
  onDeleteFlow,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {flows.map((flow) => (
        <div 
          key={flow.id}
          className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
        >
          <div className="flex justify-between items-start mb-2">
            <div 
              className="flex-1 cursor-pointer"
              onClick={() => onOpenFlow(flow.id)}
            >
              <h3 className="text-lg font-medium text-gray-900">
                {flow.name}
              </h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onConfigureFlow(flow.id)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Configurar"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => onRenameFlow({ id: flow.id, name: flow.name })}
                className="p-1 hover:bg-gray-100 rounded"
                title="Renomear"
              >
                <Pencil className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => onDeleteFlow(flow.id)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <div>Cartões: {flow.cards}</div>
            <div>Membros: {flow.members}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlowGrid;