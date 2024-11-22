"use client"

import React from 'react';
import { Settings, Trash2, Pencil, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Flow } from "../../types";

interface FlowCardProps {
  flow: Flow;
  onOpen: (flowId: number) => void;
  onRename: (flow: { id: number; name: string }) => void;
  onConfigure: (stageId: number) => void;
  onDelete: (flowId: number) => void;
  onShowNoStagesMessage: () => void;
}

const FlowCard: React.FC<FlowCardProps> = ({
  flow,
  onOpen,
  onRename,
  onConfigure,
  onDelete,
  onShowNoStagesMessage
}) => {
  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div 
        onClick={() => onOpen(flow.id)}
        className="p-4 cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1 group-hover:text-blue-600 transition-colors">
              {flow.name}
            </h3>
            <p className="text-sm text-gray-500">
              {flow.cards} cartões • {flow.stages?.length || 0} etapas
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onRename({ id: flow.id, name: flow.name });
              }}
            >
              <Pencil className="h-4 w-4 text-gray-500 hover:text-gray-700" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implementar gerenciamento de usuários/permissões
              }}
            >
              <Users className="h-4 w-4 text-gray-500 hover:text-gray-700" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="border-t flex justify-end p-2 bg-gray-50 gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (flow.stages && flow.stages.length > 0) {
              onConfigure(flow.stages[0].id);
            } else {
              onShowNoStagesMessage();
            }
          }}
          className="hover:bg-gray-100"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(flow.id);
          }}
          className="hover:bg-red-50 text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FlowCard;