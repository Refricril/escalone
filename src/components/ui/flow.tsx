"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/ui/header";
import { Settings, Pencil, Trash2, Plus } from "lucide-react";
import FlowGrid from "@/components/ui/flowgrid";
import { flowService } from "@/components/ui/flowservice";
import KanbanBoard from "@/components/ui/kanbanboard";
import { EmptyState } from "@/components/ui/emptystate";
import NewCardForm from '../new-card-form';
import FlowSettingsModal from "@/components/ui/FlowSettingsModal";
import type { Flow, Stage, CardType, Field } from "../../types";

const Flow = (): React.JSX.Element => {
  const { toast } = useToast();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFlow, setSelectedFlow] = useState<number | null>(null);
  const [isNewFlowModalOpen, setIsNewFlowModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false); // Novo state
  const [deleteFlowId, setDeleteFlowId] = useState<number | null>(null);
  const [renamingFlow, setRenamingFlow] = useState<{ id: number; name: string } | null>(null);
  const [newFlowName, setNewFlowName] = useState("");
  const [configuringStage, setConfiguringStage] = useState<Stage | null>(null);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);

  const currentFlow = flows.find(flow => flow.id === selectedFlow);

  const handleConfigureFlow = (flowId: number) => {
    console.log('Configurando flow:', flowId);
    const flow = flows.find(f => f.id === flowId);
    if (flow) {
      setSelectedFlow(flowId);
      setIsConfigModalOpen(true);
    }
  };

  const getPreviousStageFields = (stageId: number): Field[] => {
    if (!currentFlow) return [];

    const currentStage = currentFlow.stages.find(s => s.id === stageId);
    if (!currentStage) return [];

    return currentFlow.stages
      .filter(s => 
        typeof s.order === 'number' && 
        typeof currentStage.order === 'number' && 
        s.order < currentStage.order
      )
      .flatMap(s => s.fields || [])
      .map(field => ({
        ...field,
        sourceStage: stageId,
        readOnly: true
      }));
  };

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
  }, []);

  const handleCreateFlow = async () => {
    if (!newFlowName.trim()) return;

    try {
      const newFlow = await flowService.createFlow({
        name: newFlowName.trim(),
        cards: 0,
        members: 0,
        stages: [],
        fields: [],
        ownerId: 1,
        description: ''
      });

      setFlows(prev => [...prev, newFlow]);
      setNewFlowName("");
      setIsNewFlowModalOpen(false);
      toast({
        title: "Sucesso",
        description: "Flow criado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o flow",
        variant: "destructive"
      });
    }
  };

  const handleUpdateFlow = async (flowId: number, updates: Partial<Flow> | { stages: Stage[] }) => {
    try {
      const updatedFlow = await flowService.updateFlow(flowId, updates);
      setFlows(prev => prev.map(flow => 
        flow.id === flowId ? updatedFlow : flow
      ));
      toast({
        title: "Sucesso",
        description: "Flow atualizado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o flow",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFlow = async () => {
    if (!deleteFlowId) return;

    try {
      await flowService.deleteFlow(deleteFlowId);
      setFlows(prev => prev.filter(flow => flow.id !== deleteFlowId));
      setDeleteFlowId(null);
      toast({
        title: "Sucesso",
        description: "Flow excluído com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o flow",
        variant: "destructive"
      });
    }
  };

  const addNewStage = async (stageName: string) => {
    if (!currentFlow) return;

    const newStage: Stage = {
      id: Date.now(),
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
      const updatedFlow = await flowService.updateFlow(currentFlow.id, {
        stages: [...currentFlow.stages, newStage]
      });
      setFlows(prev => prev.map(flow => 
        flow.id === currentFlow.id ? updatedFlow : flow
      ));
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o estágio",
        variant: "destructive"
      });
    }
  };

  const addNewCard = async (stageId: number, card: CardType) => {
    if (!currentFlow) return;

    try {
      const updatedFlow = await flowService.addCard(currentFlow.id, stageId, card);
      setFlows(prev => prev.map(flow => 
        flow.id === currentFlow.id ? updatedFlow : flow
      ));
      toast({
        title: "Sucesso",
        description: "Cartão adicionado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o cartão",
        variant: "destructive"
      });
    }
  };
  const deleteStage = async (stageId: number) => {
    if (!currentFlow) return;
  
    try {
      await flowService.deleteStage(currentFlow.id, stageId);
      
      // Atualiza o estado local após sucesso da API
      setFlows(prev => prev.map(flow => {
        if (flow.id === currentFlow.id) {
          return {
            ...flow,
            stages: flow.stages.filter(stage => stage.id !== stageId)
          };
        }
        return flow;
      }));
  
      setConfiguringStage(null);
      
      toast({
        title: "Sucesso",
        description: "Etapa excluída com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao excluir etapa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a etapa",
        variant: "destructive"
      });
      
      // Recarrega os dados em caso de erro
      try {
        const refreshedFlows = await flowService.getFlows();
        setFlows(refreshedFlows);
      } catch {
        toast({
          title: "Erro",
          description: "Erro ao atualizar dados. Por favor, recarregue a página.",
          variant: "destructive"
        });
      }
    }
  };

  const updateCard = async (stageId: number, cardId: number, updatedCard: CardType) => {
    if (!currentFlow) return;
  
    try {
      console.log('Atualizando card:', { stageId, cardId, updatedCard }); // Log para debug
  
      // Primeiro atualiza localmente para feedback imediato
      const updatedFlow = {
        ...currentFlow,
        stages: currentFlow.stages.map(stage => {
          if (stage.id === stageId) {
            return {
              ...stage,
              cards: stage.cards.map(card => 
                card.id === cardId ? { ...card, ...updatedCard } : card
              )
            };
          }
          return stage;
        })
      };
  
      // Faz a chamada à API
      const result = await flowService.updateCard(currentFlow.id, stageId, cardId, updatedCard);
      
      // Atualiza o estado com a resposta do servidor
      setFlows(prev => prev.map(flow => 
        flow.id === currentFlow.id ? result : flow
      ));
  
      toast({
        title: "Sucesso",
        description: "Cartão atualizado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao atualizar cartão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o cartão",
        variant: "destructive"
      });
    }
  };

  const deleteCard = async (stageId: number, cardId: number) => {
    if (!currentFlow) return;

    try {
      const updatedFlow = await flowService.deleteCard(currentFlow.id, stageId, cardId);
      setFlows(prev => prev.map(flow => 
        flow.id === currentFlow.id ? updatedFlow : flow
      ));
      toast({
        title: "Sucesso",
        description: "Cartão excluído com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cartão",
        variant: "destructive"
      });
    }
  };

  const moveCard = async (cardId: number, fromStageId: number, toStageId: number) => {
    if (!currentFlow) return;
  
    try {
      // Primeiro, remova o card do stage atual
      const fromStage = currentFlow.stages.find(s => s.id === fromStageId);
      const cardToMove = fromStage?.cards.find(c => c.id === cardId);
      
      if (!fromStage || !cardToMove) return;
  
      // Crie uma cópia do flow com o card removido do stage original e adicionado ao novo stage
      const updatedStages = currentFlow.stages.map(stage => {
        if (stage.id === fromStageId) {
          return {
            ...stage,
            cards: stage.cards.filter(c => c.id !== cardId)
          };
        }
        if (stage.id === toStageId) {
          return {
            ...stage,
            cards: [...stage.cards, { ...cardToMove, stageId: toStageId }]
          };
        }
        return stage;
      });
  
      // Atualize o flow com os stages modificados
      const updatedFlow = await flowService.moveCard(currentFlow.id, cardId, fromStageId, toStageId);
      
      // Atualize o estado local com o resultado do servidor
      setFlows(prev => prev.map(flow => 
        flow.id === currentFlow.id ? updatedFlow : flow
      ));
  
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível mover o cartão",
        variant: "destructive"
      });
  
      // Opcional: recarregue os flows em caso de erro para garantir consistência
      try {
        const refreshedFlows = await flowService.getFlows();
        setFlows(refreshedFlows);
      } catch {
        // Se falhar ao recarregar, pelo menos notificamos o usuário
        toast({
          title: "Erro",
          description: "Erro ao atualizar dados. Por favor, recarregue a página.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showNewFlowButton={selectedFlow === null}
        onNewFlow={() => setIsNewFlowModalOpen(true)}
      />
      <div className="flex justify-center px-2">
        <div className="max-w-[98vw] w-full p-4">
          {isLoading ? (
            <div>Carregando...</div>
          ) : (
            <>
              {selectedFlow && currentFlow ? (
                <div className="space-y-3">
                  <Button
                    onClick={() => setSelectedFlow(null)}
                    className="bg-transparent hover:bg-gray-100 text-gray-700"
                  >
                    ← Voltar ao Dashboard
                  </Button>
                  <KanbanBoard
                    stages={currentFlow.stages}
                    fields={currentFlow.fields}
                    addStage={addNewStage}
                    addCard={addNewCard}
                    updateCard={updateCard}
                    deleteCard={deleteCard}
                    moveCard={moveCard}
                    updateStage={(stageId, updates) =>
                      handleUpdateFlow(currentFlow.id, {
                        stages: currentFlow.stages.map((stage) =>
                          stage.id === stageId ? { ...stage, ...updates } : stage
                        ),
                      })
                    }
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {flows.length === 0 ? (
                    <EmptyState onCreateFlow={() => setIsNewFlowModalOpen(true)} />
                  ) : (
                    <FlowGrid
                      flows={flows}
                      onOpenFlow={setSelectedFlow}
                      onConfigureFlow={handleConfigureFlow}
                      onRenameFlow={setRenamingFlow}
                      onDeleteFlow={setDeleteFlowId}
                    />
                  )}
                </div>
              )}
  
              {/* Modal: Criar Flow */}
              <Dialog open={isNewFlowModalOpen} onOpenChange={setIsNewFlowModalOpen}>
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
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      className="bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300"
                      onClick={() => {
                        setNewFlowName("");
                        setIsNewFlowModalOpen(false);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="bg-black hover:bg-gray-900 text-white"
                      onClick={handleCreateFlow}
                      disabled={!newFlowName.trim()}
                    >
                      Criar Flow
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
  
              {/* Modal: Excluir Flow */}
              <Dialog open={deleteFlowId !== null} onOpenChange={() => setDeleteFlowId(null)}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Excluir Flow</DialogTitle>
                    <DialogDescription>
                      Tem certeza que deseja excluir este flow? Esta ação não pode ser desfeita.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      className="bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300"
                      onClick={() => setDeleteFlowId(null)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleDeleteFlow}
                    >
                      Excluir
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
  
              {/* Modal: Renomear Flow */}
              <Dialog open={renamingFlow !== null} onOpenChange={() => setRenamingFlow(null)}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Renomear Flow</DialogTitle>
                    <DialogDescription>Digite o novo nome para o flow.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <input
                      type="text"
                      value={renamingFlow?.name || ""}
                      onChange={(e) =>
                        setRenamingFlow((prev) =>
                          prev ? { ...prev, name: e.target.value } : null
                        )
                      }
                      placeholder="Novo nome do flow"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                      autoFocus
                    />
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      className="bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300"
                      onClick={() => setRenamingFlow(null)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="bg-black hover:bg-gray-900 text-white"
                      onClick={() => {
                        if (renamingFlow?.id && renamingFlow.name.trim()) {
                          handleUpdateFlow(renamingFlow.id, { name: renamingFlow.name.trim() });
                          setRenamingFlow(null);
                        }
                      }}
                      disabled={!renamingFlow?.name.trim()}
                    >
                      Renomear
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
  
              {/* Modal: Configurar Estágio */}
              {configuringStage && currentFlow && (
  <Dialog open={!!configuringStage} onOpenChange={() => setConfiguringStage(null)}>
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Configurar Estágio: {configuringStage.name}</DialogTitle>
        <DialogDescription>
          Configure os campos e comportamentos deste estágio.
        </DialogDescription>
      </DialogHeader>
      <FlowSettingsModal
  flowId={selectedFlow!}
  stage={configuringStage!} // Certifique-se de que `configuringStage` é válido
  initialFields={configuringStage?.fields || []}
  previousStageFields={getPreviousStageFields(configuringStage.id)}
  availableStages={currentFlow?.stages.filter((s) => s.id !== configuringStage.id) || []}
  onClose={() => setConfiguringStage(null)}
  onDelete={(stageId) => deleteStage(stageId)} // Passando a função corretamente
  onSave={(updates) => {
    handleUpdateFlow(selectedFlow!, {
      stages: currentFlow?.stages.map((stage) =>
        stage.id === configuringStage.id ? { ...stage, ...updates } : stage
      ),
    });
    setConfiguringStage(null);
  }}
/>
    </DialogContent>
  </Dialog>
)}

            </>
          )}
        </div>
      </div>
      </div>
  );
}
  // Exportação do componente
  export default Flow;