"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import Header from "@/components/ui/header";
import FlowGrid from "@/components/ui/flowgrid";
import { flowService } from "@/components/ui/flowservice"; // Ajuste o caminho conforme necessário
import KanbanBoard from "@/components/ui/kanbanboard";
import { EmptyState } from "@/components/ui/emptystate";
import FlowSettingsModal from "@/components/ui/FlowSettingsModal";
import type { Flow, Stage, CardType, Field } from "../../types";

interface ModalState {
  newFlow: boolean;
  deleteFlow: string | null;
  renameFlow: { id: string; name: string } | null;
  configStage: Stage | null;
}

const Flow = (): React.JSX.Element => {
  const { toast } = useToast();
  
  // Estados principais
  const [flows, setFlows] = useState<Flow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [newFlowName, setNewFlowName] = useState("");

  // Estado unificado para modais
  const [modals, setModals] = useState<ModalState>({
    newFlow: false,
    deleteFlow: null,
    renameFlow: null,
    configStage: null,
  });

  // Memoizar o flow atual
  const currentFlow = useMemo(() => 
    flows.find(flow => flow.id === selectedFlow),
    [flows, selectedFlow]
  );

  // Handlers memoizados
  const handleModalChange = useCallback((modalType: keyof ModalState, value: any) => {
    setModals(prev => ({ ...prev, [modalType]: value }));
  }, []);

  const getPreviousStageFields = useCallback((stageId: string): Field[] => {
    if (!currentFlow) return [];

    const currentStage = currentFlow.stages.find(s => s.id === stageId);
    if (!currentStage) return [];

    return currentFlow.stages
      .filter(s => s.order < currentStage.order)
      .flatMap(s => s.fields || [])
      .map(field => ({
        ...field,
        sourceStage: stageId,
        readOnly: true
      }));
  }, [currentFlow]);

  // Funções de atualização de estado otimizadas
  const updateFlowsAfterChange = useCallback((updatedFlow: Flow) => {
    setFlows(prev => prev.map(flow =>
      flow.id === updatedFlow.id ? updatedFlow : flow
    ));
  }, []);

  // Carregamento inicial
  useEffect(() => {
    const loadFlows = async () => {
      try {
        const data = await flowService.getFlows();
        setFlows(data);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os flows",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadFlows();
  }, [toast]);

  // Handlers de ações
  const handleCreateFlow = async () => {
    if (!newFlowName.trim()) return;

    try {
      console.log('Tentando criar flow:', newFlowName);
      
      const newFlow = await flowService.createFlow({
        name: newFlowName.trim(),
        cards: 0,
        members: 0,
        stages: [],
        fields: [],
        ownerId: "1",
        description: ''
      });

      console.log('Flow criado com sucesso:', newFlow);
      
      setFlows(prev => [...prev, newFlow]);
      setNewFlowName("");
      handleModalChange('newFlow', false);
      toast({ title: "Sucesso", description: "Flow criado com sucesso!" });
    } catch (error) {
      console.error('Erro ao criar flow:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o flow",
        variant: "destructive"
      });
    }
  };

  const handleUpdateFlow = async (flowId: string, updates: Partial<Flow>) => {
    try {
      console.log('Atualizando flow:', { flowId, updates });
      
      const updatedFlow = await flowService.updateFlow(flowId, updates);
      updateFlowsAfterChange(updatedFlow);
      toast({ title: "Sucesso", description: "Flow atualizado com sucesso!" });
    } catch (error) {
      console.error('Erro ao atualizar flow:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o flow",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFlow = async () => {
    if (!modals.deleteFlow) return;

    try {
      console.log('Deletando flow:', modals.deleteFlow);
      
      await flowService.deleteFlow(modals.deleteFlow);
      setFlows(prev => prev.filter(flow => flow.id !== modals.deleteFlow));
      handleModalChange('deleteFlow', null);
      toast({ title: "Sucesso", description: "Flow excluído com sucesso!" });
    } catch (error) {
      console.error('Erro ao deletar flow:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o flow",
        variant: "destructive"
      });
    }
  };

  const addNewStage = useCallback(async (stageName: string) => {
    if (!currentFlow) return;

    const newStage: Stage = {
      id: String(Date.now()),
      name: stageName,
      cards: [],
      order: currentFlow.stages.length,
      fieldConfig: {
        inheritFields: true,
        requiredFields: [],
        hiddenFields: []
      }
    };

    try {
      console.log('Adicionando novo estágio:', newStage);
      
      const updatedFlow = await flowService.updateFlow(currentFlow.id, {
        stages: [...currentFlow.stages, newStage]
      });
      updateFlowsAfterChange(updatedFlow);
    } catch (error) {
      console.error('Erro ao adicionar estágio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o estágio",
        variant: "destructive"
      });
    }
  }, [currentFlow, updateFlowsAfterChange, toast]);

  const handleStageUpdate = useCallback(async (stageId: string, updates: Partial<Stage>) => {
    if (!currentFlow) return;

    const updatedStages = currentFlow.stages.map(stage =>
      stage.id === stageId ? { ...stage, ...updates } : stage
    );

    await handleUpdateFlow(currentFlow.id, { stages: updatedStages });
  }, [currentFlow, handleUpdateFlow]);

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-64">Carregando...</div>;
    }

    if (selectedFlow && currentFlow) {
      return (
        <div className="space-y-3">
          <Button
            onClick={() => setSelectedFlow(null)}
            variant="ghost"
            className="hover:bg-gray-100"
          >
            ← Voltar ao Dashboard
          </Button>
          <KanbanBoard
            stages={currentFlow.stages}
            fields={currentFlow.fields}
            addStage={addNewStage}
            updateStage={handleStageUpdate}
            currentFlow={currentFlow}
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {flows.length === 0 ? (
          <EmptyState onCreateFlow={() => handleModalChange('newFlow', true)} />
        ) : (
          <FlowGrid
            flows={flows}
            onOpenFlow={setSelectedFlow}
            onConfigureFlow={flowId => handleModalChange('configStage', 
              flows.find(f => f.id === flowId)?.stages[0] || null
            )}
            onRenameFlow={flow => handleModalChange('renameFlow', flow)}
            onDeleteFlow={flowId => handleModalChange('deleteFlow', flowId)}
          />
        )}
      </div>
    );
  };

  const renderModals = () => (
    <>
      {/* Modal: Criar Flow */}
      <Dialog open={modals.newFlow} onOpenChange={(open) => handleModalChange('newFlow', open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Flow</DialogTitle>
            <DialogDescription>
              Crie um novo fluxo de trabalho para sua equipe.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <input
              type="text"
              value={newFlowName}
              onChange={(e) => setNewFlowName(e.target.value)}
              placeholder="Nome do flow"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white"
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setNewFlowName("");
                handleModalChange('newFlow', false);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateFlow}
              disabled={!newFlowName.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Flow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Excluir Flow */}
      <Dialog 
        open={modals.deleteFlow !== null} 
        onOpenChange={() => handleModalChange('deleteFlow', null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Flow</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este flow? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => handleModalChange('deleteFlow', null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteFlow}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Renomear Flow */}
      <Dialog 
        open={modals.renameFlow !== null} 
        onOpenChange={() => handleModalChange('renameFlow', null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Renomear Flow</DialogTitle>
            <DialogDescription>Digite o novo nome para o flow.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <input
              type="text"
              value={modals.renameFlow?.name || ""}
              onChange={(e) =>
                handleModalChange('renameFlow', modals.renameFlow ? {
                  ...modals.renameFlow,
                  name: e.target.value
                } : null)
              }
              placeholder="Novo nome do flow"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white"
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => handleModalChange('renameFlow', null)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (modals.renameFlow?.id && modals.renameFlow.name.trim()) {
                  handleUpdateFlow(modals.renameFlow.id, { 
                    name: modals.renameFlow.name.trim() 
                  });
                  handleModalChange('renameFlow', null);
                }
              }}
              disabled={!modals.renameFlow?.name.trim()}
            >
              Renomear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Configurar Stage */}
      {modals.configStage && currentFlow && (
        <Dialog 
          open={!!modals.configStage} 
          onOpenChange={() => handleModalChange('configStage', null)}
        >
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Configurar Estágio: {modals.configStage.name}</DialogTitle>
              <DialogDescription>
                Configure os campos e comportamentos deste estágio.
              </DialogDescription>
            </DialogHeader>
            <FlowSettingsModal
              flowId={currentFlow.id}
              stage={modals.configStage}
              initialFields={modals.configStage.fields || []}
              previousStageFields={getPreviousStageFields(modals.configStage.id)}
              availableStages={currentFlow.stages.filter(s => s.id !== modals.configStage?.id)}
              onClose={() => handleModalChange('configStage', null)}
              onDelete={(stageId) => {/* Implementar deleteStage */}}
              onSave={(updates) => {
                handleStageUpdate(modals.configStage!.id, updates);
                handleModalChange('configStage', null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showNewFlowButton={!selectedFlow}
        onNewFlow={() => handleModalChange('newFlow', true)}
      />
      <div className="flex justify-center px-2">
        <div className="max-w-[98vw] w-full p-4">
          {renderContent()}
          {renderModals()}
        </div>
      </div>
    </div>
  );
};

export default Flow;