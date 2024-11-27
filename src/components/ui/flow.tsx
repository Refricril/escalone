"use client";
import React, { useState, useEffect } from 'react';
import { Plus, X, Settings, Trash2, Pencil, Users } from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import FlowSettingsModal from '@/components/ui/FlowSettingsModal';
import { 
  CardType, 
  Field, 
  Stage, 
  Flow, 
  StageFieldConfig,
  InheritedField 
} from "../../types";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "./use-toast";
import FlowCard from './FlowCard';


const Dashboard: React.FC = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState("");
  const [selectedFlow, setSelectedFlow] = useState<number | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configuringStage, setConfiguringStage] = useState<Stage | null>(null);
  const [previousFields, setPreviousFields] = useState<Field[]>([]);
  const [deleteFlowId, setDeleteFlowId] = useState<number | null>(null);
  const [renamingFlow, setRenamingFlow] = useState<{ id: number; name: string } | null>(null); // Adicione aqui
  const { toast } = useToast();

  const getPreviousStageFields = (stageId: number): Field[] => {
    const currentFlow = flows.find(f => f.id === selectedFlow);
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
  };

  const handleDeleteFlow = (flowId: number) => {
    setDeleteFlowId(flowId);
  };

  const confirmDeleteFlow = () => {
    if (deleteFlowId) {
      setFlows(flows.filter(flow => flow.id !== deleteFlowId));
      toast({
        title: "Fluxo excluído",
        description: "O fluxo foi excluído com sucesso.",
      });
      setDeleteFlowId(null);
    }
  };
const handleRenameFlow = (flowId: number, newName: string) => {
  if (newName.trim()) {
    setFlows(flows.map(flow => 
      flow.id === flowId
        ? { ...flow, name: newName.trim(), updatedAt: new Date() }
        : flow
    ));
    setRenamingFlow(null);
    toast({
      title: "Fluxo renomeado",
      description: "O nome do fluxo foi atualizado com sucesso.",
    });
  }
};
  const cancelDeleteFlow = () => {
    setDeleteFlowId(null);
  };

  const addNewFlow = () => {
    if (newFlowName.trim()) {
      const newId = Math.max(0, ...flows.map(f => f.id)) + 1;
      const newFlow: Flow = {
        id: newId,
        name: newFlowName,
        cards: 0,
        members: 0,
        stages: [],
        fields: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: 1,
        description: ''
      };
      setFlows([...flows, newFlow]);
      setNewFlowName("");
      setIsModalOpen(false);
      toast({
        title: "Fluxo criado",
        description: "O novo fluxo foi criado com sucesso.",
      });
    }
  };

  const openFlow = (flowId: number) => {
    setSelectedFlow(flowId);
  };

  const handleConfigureStage = (stageId: number) => {
    const currentFlow = flows.find(f => f.id === selectedFlow);
    if (!currentFlow) return;

    const stage = currentFlow.stages.find(s => s.id === stageId);
    if (!stage) return;

    const previousFields = getPreviousStageFields(stageId);
    setConfiguringStage(stage);
    setPreviousFields(previousFields);
    setIsConfigModalOpen(true);
  };

  const handleSaveStageConfig = (stageId: number, updates: Partial<Stage>) => {
    if (!selectedFlow) return;

    setFlows(flows.map(flow => {
      if (flow.id === selectedFlow) {
        return {
          ...flow,
          stages: flow.stages.map(stage => 
            stage.id === stageId
              ? {
                  ...stage,
                  ...updates,
                  fields: updates.fields?.map(field => ({
                    ...field,
                    sourceStage: stage.id
                  })),
                  fieldConfig: {
                    ...stage.fieldConfig,
                    ...updates.fieldConfig
                  }
                }
              : stage
          )
        };
      }
      
      return flow;
    }));

    setIsConfigModalOpen(false);
    setConfiguringStage(null);
    toast({
      title: "Configurações salvas",
      description: "As configurações da etapa foram atualizadas com sucesso.",
    });
  };

  const addNewStage = (stageName: string) => {
    if (selectedFlow === null) return;
    
    setFlows(flows.map(flow =>
      flow.id === selectedFlow
        ? {
            ...flow,
            stages: [
              ...flow.stages,
              {
                id: Date.now(),
                name: stageName,
                cards: [],
                order: flow.stages.length,
                fieldConfig: {
                  inheritFields: true,
                  requiredFields: [],
                  hiddenFields: []
                }
              }
            ]
          }
        : flow
    ));

    toast({
      title: "Etapa criada",
      description: "Nova etapa adicionada com sucesso.",
    });
  };

  const addNewCard = (stageId: number, card: CardType) => {
    if (selectedFlow === null) return;

    const currentFlow = flows.find(f => f.id === selectedFlow);
    const stage = currentFlow?.stages.find(s => s.id === stageId);

    if (!stage) return;

    const requiredFields = stage.fieldConfig?.requiredFields || [];
    const missingFields = requiredFields.filter(
      fieldName => !card.fields[fieldName]
    );

    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: `Campos faltando: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setFlows(flows.map(flow => {
      if (flow.id === selectedFlow) {
        const updatedFlow = {
          ...flow,
          cards: flow.cards + 1,
          stages: flow.stages.map(stage =>
            stage.id === stageId
              ? { ...stage, cards: [...stage.cards, card] }
              : stage
          )
        };
        return updatedFlow;
      }
      return flow;
    }));

    toast({
      title: "Cartão criado",
      description: "Novo cartão adicionado com sucesso.",
    });
  };

  const updateCard = (stageId: number, cardId: number, updatedCard: CardType) => {
    if (selectedFlow === null) return;

    const currentFlow = flows.find(f => f.id === selectedFlow);
    const stage = currentFlow?.stages.find(s => s.id === stageId);

    if (!stage) return;

    const requiredFields = stage.fieldConfig?.requiredFields || [];
    const missingFields = requiredFields.filter(
      fieldName => !updatedCard.fields[fieldName]
    );

    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: `Campos faltando: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setFlows(flows.map(flow => {
      if (flow.id === selectedFlow) {
        return {
          ...flow,
          stages: flow.stages.map(stage =>
            stage.id === stageId
              ? {
                  ...stage,
                  cards: stage.cards.map(card =>
                    card.id === cardId ? updatedCard : card
                  )
                }
              : stage
          )
        };
      }
      return flow;
    }));

    toast({
      title: "Cartão atualizado",
      description: "Cartão atualizado com sucesso.",
    });
  };

  const deleteCard = (stageId: number, cardId: number) => {
    if (selectedFlow === null) return;

    setFlows(flows.map(flow => {
      if (flow.id === selectedFlow) {
        return {
          ...flow,
          cards: flow.cards - 1,
          stages: flow.stages.map(stage =>
            stage.id === stageId
              ? { ...stage, cards: stage.cards.filter(card => card.id !== cardId) }
              : stage
          )
        };
      }
      return flow;
    }));

    toast({
      title: "Cartão excluído",
      description: "Cartão removido com sucesso.",
    });
  };

  const moveCard = (cardId: number, fromStageId: number, toStageId: number) => {
    if (selectedFlow === null) return;

    const currentFlow = flows.find(f => f.id === selectedFlow);
    if (!currentFlow) return;

    const fromStage = currentFlow.stages.find(s => s.id === fromStageId);
    const toStage = currentFlow.stages.find(s => s.id === toStageId);
    const cardToMove = fromStage?.cards.find(c => c.id === cardId);

    if (!fromStage || !toStage || !cardToMove) {
      console.error('Estágio ou cartão não encontrado');
      return;
    }

    if (fromStage.allowedMoves && !fromStage.allowedMoves.includes(toStageId)) {
      toast({
        title: "Movimento não permitido",
        description: "Não é possível mover o cartão para este estágio.",
        variant: "destructive",
      });
      return;
    }

    const requiredFields = toStage.fieldConfig?.requiredFields || [];
    const missingFields = requiredFields.filter(
      fieldName => !cardToMove.fields[fieldName]
    );

    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: `Preencha os campos: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setFlows(flows.map(flow => {
      if (flow.id === selectedFlow) {
        return {
          ...flow,
          stages: flow.stages.map(stage => {
            if (stage.id === fromStageId) {
              return {
                ...stage,
                cards: stage.cards.filter(card => card.id !== cardId)
              };
            }
            if (stage.id === toStageId) {
              return {
                ...stage,
                cards: [...stage.cards, { ...cardToMove, stageId: toStageId }]
              };
            }
            return stage;
          })
        };
      }
      return flow;
    }));
  };

  const currentFlow = flows.find(flow => flow.id === selectedFlow);

  return (
    <div className="flex justify-center px-2">
      <div className="max-w-[98vw] w-full p-4">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Escalone</h1>
          <nav className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Dashboard</a>
            <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Fluxos</a>
            <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Organizações</a>
          </nav>
        </header>
  
        {selectedFlow && currentFlow ? (
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
              addCard={addNewCard}
              updateCard={updateCard}
              deleteCard={deleteCard}
              moveCard={moveCard}
              updateStage={handleSaveStageConfig}
              configureStage={handleConfigureStage}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`w-full flex ${flows.length === 0 ? 'justify-center items-center min-h-[80vh]' : 'flex-col'}`}>
              {flows.length === 0 ? (
                <div className="text-center">
                  <p className="text-gray-500 mb-4">Você ainda não tem nenhum fluxo criado.</p>
                  <Button
                    variant="black"
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Plus className="h-5 w-5" /> Criar primeiro fluxo
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Seus Fluxos</h2>
                    <Button 
                      onClick={() => setIsModalOpen(true)} 
                      variant="black"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-5 w-5" /> Novo Fluxo
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 w-full">
  {flows.map(flow => (
    <div
      key={flow.id}
      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div 
        onClick={() => openFlow(flow.id)}
        className="p-4 cursor-pointer"
      >
        <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">
          {flow.name}
        </h3>
        <p className="text-gray-500 text-sm">
          {flow.cards} cartões • {flow.stages?.length || 0} etapas
        </p>
      </div>
      
      {/* Botões de Ação */}
      <div className="border-t flex justify-end p-2 bg-gray-50 gap-2">
        {/* Botão de Configuração */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (flow.stages && flow.stages.length > 0) {
              handleConfigureStage(flow.stages[0].id);
            } else {
              toast({
                title: "Sem etapas",
                description: "Este fluxo não possui etapas configuradas.",
                variant: "destructive",
              });
            }
          }}
          className="hover:bg-gray-100"
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* Botão de Renomear */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setRenamingFlow({ id: flow.id, name: flow.name });
          }}
          className="hover:bg-gray-100 text-blue-600"
        >
          <Pencil className="h-4 w-4" />
        </Button>

        {/* Botão de Excluir */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteFlow(flow.id);
          }}
          className="hover:bg-red-50 text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ))}
</div>

                </>
              )}
            </div>
          </div>
        )}
  
         {/* Modal para excluir fluxo */}
<Dialog open={deleteFlowId !== null} onOpenChange={cancelDeleteFlow}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Excluir Fluxo</DialogTitle>
      <DialogDescription>
        Tem certeza que deseja excluir este fluxo? Esta ação não pode ser desfeita.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter className="gap-2 sm:gap-0">
      <Button variant="outline" onClick={cancelDeleteFlow}>
        Cancelar
      </Button>
      <Button variant="destructive" onClick={confirmDeleteFlow}>
        Excluir
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Modal para renomear fluxo */}
<Dialog open={renamingFlow !== null} onOpenChange={() => setRenamingFlow(null)}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Renomear Fluxo</DialogTitle>
      <DialogDescription>
        Digite o novo nome para o fluxo.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <input 
        type="text" 
        value={renamingFlow?.name || ''}
        onChange={(e) => setRenamingFlow(renamingFlow ? { ...renamingFlow, name: e.target.value } : null)}
        placeholder="Novo nome do fluxo"
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white"
        autoFocus
      />
    </div>
    <DialogFooter className="gap-2 sm:gap-0">
      <Button variant="outline" onClick={() => setRenamingFlow(null)}>
        Cancelar
      </Button>
      <Button 
        variant="black" 
        onClick={() => renamingFlow && handleRenameFlow(renamingFlow.id, renamingFlow.name)}
        disabled={!renamingFlow?.name.trim()}
      >
        Renomear
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Modal para criar novo fluxo */}
<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle className="text-gray-900">Novo Fluxo</DialogTitle>
      <DialogDescription className="text-gray-500">
        Crie um novo fluxo de trabalho para sua equipe.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <input 
        type="text" 
        value={newFlowName}
        onChange={(e) => setNewFlowName(e.target.value)}
        placeholder="Nome do fluxo"
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900"
        autoFocus
      />
    </div>
    <DialogFooter className="gap-2 sm:gap-0">
      <Button 
        variant="outline" 
        onClick={() => setIsModalOpen(false)}
        className="bg-white text-gray-900 hover:bg-gray-100"
      >
        Cancelar
      </Button>
      <Button 
        variant="black" 
        onClick={addNewFlow}
        disabled={!newFlowName.trim()}
      >
        Criar Fluxo
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Modal de configurações de etapa */}
{isConfigModalOpen && configuringStage && (
  <FlowSettingsModal
    flowId={selectedFlow!}
    stage={configuringStage}
    initialFields={configuringStage.fields || []}
    previousStageFields={previousFields}
    availableStages={currentFlow?.stages.filter(s => s.id !== configuringStage.id) || []}
    onClose={() => setIsConfigModalOpen(false)}
    onSave={(updates) => handleSaveStageConfig(configuringStage.id, updates)}
  />
)}

        </div>
      </div>
    );
  };
  
  export default Dashboard;