"use client"

import React, { memo, useCallback } from 'react';
import { Settings, Trash2, Pencil, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Flow } from "../../types";

interface FlowCardProps {
  flow: Flow;
  onOpen: (flowId: string) => void;
  onRename: (flow: { id: string; name: string }) => void;
  onConfigure: (stageId: string) => void;
  onDelete: (flowId: string) => void;
  onShowNoStagesMessage: () => void;
}

const FlowCardActionButton = memo(({ 
  onClick, 
  icon: Icon, 
  className = "" 
}: { 
  onClick: (e: React.MouseEvent) => void; 
  icon: React.ElementType;
  className?: string;
}) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onClick}
    className={`opacity-0 group-hover:opacity-100 transition-opacity ${className}`}
  >
    <Icon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
  </Button>
));

FlowCardActionButton.displayName = 'FlowCardActionButton';

const FlowCard = ({
  flow,
  onOpen,
  onRename,
  onConfigure,
  onDelete,
  onShowNoStagesMessage
}: FlowCardProps) => {
  const handleCardClick = useCallback(() => {
    onOpen(flow.id);
  }, [flow.id, onOpen]);

  const handleRename = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRename({ id: flow.id, name: flow.name });
  }, [flow.id, flow.name, onRename]);

  const handleConfigure = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (flow.stages && flow.stages.length > 0) {
      onConfigure(flow.stages[0].id);
    } else {
      onShowNoStagesMessage();
    }
  }, [flow.stages, onConfigure, onShowNoStagesMessage]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(flow.id);
  }, [flow.id, onDelete]);

  const handleUsers = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implementar gerenciamento de usuários/permissões
  }, []);

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div 
        onClick={handleCardClick}
        className="p-4 cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && handleCardClick()}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1 group-hover:text-blue-600 transition-colors">
              {flow.name}
            </h3>
            <p className="text-sm text-gray-500">
              <span>{flow.cards} {flow.cards === 1 ? 'cartão' : 'cartões'}</span>
              <span className="mx-1">•</span>
              <span>
                {flow.stages?.length || 0} {flow.stages?.length === 1 ? 'etapa' : 'etapas'}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1">
            <FlowCardActionButton 
              onClick={handleRename} 
              icon={Pencil}
            />
            <FlowCardActionButton 
              onClick={handleUsers} 
              icon={Users}
            />
          </div>
        </div>
      </div>
      
      <div className="border-t flex justify-end p-2 bg-gray-50 gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleConfigure}
          className="hover:bg-gray-100"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="hover:bg-red-50 text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default memo(FlowCard);