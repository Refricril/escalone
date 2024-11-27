"use client"

import React, { useState, useEffect } from 'react';
import { Plus, Settings } from 'lucide-react';
import type { KanbanBoardProps, CardType, Field, Stage, DateStatus, CardHistory, StageRef } from '@/types/index';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import Card  from '@/components/ui/Card';
import NewCardForm from '../new-card-form';
import FlowSettingsModal from '@/components/ui/FlowSettingsModal';
import { Button } from '@/components/ui/button';
import { FieldValue, Comment, CardHistory } from '@/types/index';

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  stages,
  fields,
  addStage,
  addCard,
  updateCard,
  deleteCard,
  moveCard,
  updateStage,
  configureStage,
  onCardClick
}) => {
  const [newStageName, setNewStageName] = useState("");
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [configuringStage, setConfiguringStage] = useState<Stage | null>(null);
  const [addingCard, setAddingCard] = useState<{ stageId: number } | null>(null);
  const [localStages, setLocalStages] = useState(stages);

  useEffect(() => {
    setLocalStages(stages);
  }, [stages]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const fromStageId = Number(source.droppableId);
    const toStageId = Number(destination.droppableId);
    const cardId = Number(draggableId);

    if (fromStageId === toStageId && source.index === destination.index) return;

    const fromStage = localStages.find((s: { id: number; }) => s.id === fromStageId);
    const toStage = localStages.find((s: { id: number; }) => s.id === toStageId);
    const movingCard = fromStage?.cards.find((c: { id: number; }) => c.id === cardId);

    if (!fromStage || !toStage || !movingCard) {
      console.error('Estágios ou cartão não encontrado:', { fromStageId, toStageId });
      return;
    }

    const isAllowed = fromStage.allowedMoves 
      ? fromStage.allowedMoves.includes(toStageId)
      : true;

    if (!isAllowed) {
      alert(`Não é permitido mover cartões de "${fromStage.name}" para "${toStage.name}"`);
      return;
    }

    const fromRef: StageRef = {
      stageId: fromStageId,
      stageName: fromStage.name
    };

    const toRef: StageRef = {
      stageId: toStageId,
      stageName: toStage.name
    };

    const historyEntry: CardHistory = {
      date: new Date(),
      from: fromRef,
      to: toRef,
      fields: { ...movingCard.fields }
    };

    const updatedCard: CardType = {
      ...movingCard,
      stageId: toStageId,
      history: [...(movingCard.history || []), historyEntry]
    };

    const updatedStages = localStages.map((stage: { id: number; cards: any[]; }) => {
      if (stage.id === fromStageId) {
        return {
          ...stage,
          cards: stage.cards.filter((card: { id: number; }) => card.id !== cardId)
        };
      }
      if (stage.id === toStageId) {
        return {
          ...stage,
          cards: [...stage.cards, updatedCard]
        };
      }
      return stage;
    });

    setLocalStages(updatedStages);

    if (moveCard) {
      try {
        moveCard(cardId, fromStageId, toStageId);
      } catch (error) {
        console.error('Erro ao mover cartão:', error);
        setLocalStages(stages);
        alert('Erro ao mover o cartão. A operação foi revertida.');
      }
    }
  };

  const handleAddStage = () => {
    if (newStageName.trim()) {
      addStage(newStageName);
      setNewStageName("");
    }
  };

  const handleAddNewCard = (stageId: number) => {
    setAddingCard({ stageId });
  };

  const handleEditCard = (card: CardType) => {
    setEditingCard(card);
    if (onCardClick) {
      onCardClick(card);
    }
  };

  const handleConfigureStage = (stage: Stage) => {
    setConfiguringStage(stage);
  };

  const handleSaveStageConfig = (stageId: number, updates: Partial<Stage>) => {
    if (updateStage) {
      const updatedStages = localStages.map((stage: { id: number; }) => {
        if (stage.id === stageId) {
          return { ...stage, ...updates };
        }
        return stage;
      });
      setLocalStages(updatedStages);

      try {
        updateStage(stageId, updates);
      } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        setLocalStages(stages);
        alert('Erro ao salvar as configurações. As alterações foram revertidas.');
      }
    }
    setConfiguringStage(null);
  };

  const handleDeleteCard = async (stageId: number, cardId: number) => {
    if (deleteCard) {
      const confirmDelete = window.confirm('Tem certeza que deseja excluir este cartão?');
      if (!confirmDelete) return;

      const updatedStages = localStages.map((stage: { id: number; cards: any[]; }) => {
        if (stage.id === stageId) {
          return {
            ...stage,
            cards: stage.cards.filter((card: { id: number; }) => card.id !== cardId)
          };
        }
        return stage;
      });
      setLocalStages(updatedStages);

      try {
        await deleteCard(stageId, cardId);
      } catch (error) {
        console.error('Erro ao excluir cartão:', error);
        setLocalStages(stages);
        alert('Erro ao excluir o cartão. A operação foi revertida.');
      }
    }
  };

  const getPreviousFields = (currentStageId: number): Field[] => {
    const currentStage = localStages.find((s: { id: number; }) => s.id === currentStageId);
    if (!currentStage) return [];

    return localStages
      .filter((s: { order: number; }) => 
        typeof s.order === 'number' && 
        typeof currentStage.order === 'number' && 
        s.order < currentStage.order
      )
      .flatMap((s: { fields: any; }) => s.fields || []);
  };

  return (
    <div className="p-2">
      <div className="flex items-center mb-4">
        <input
          type="text"
          value={newStageName}
          onChange={(e) => setNewStageName(e.target.value)}
          placeholder="Nome da nova etapa"
          className="px-3 py-2 border rounded-lg mr-2 focus:ring-2 focus:ring-black focus:border-transparent w-64 bg-white"
        />
        <Button 
          onClick={handleAddStage}
          variant="black"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nova Etapa
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {localStages.map((stage: { id: React.Key | null | undefined; name: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; limit: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; cards: any[]; fields: any; }, index: number) => (
            <Droppable droppableId={String(stage.id)} key={stage.id}>
              {(provided, snapshot) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-shrink-0 w-72 rounded-lg p-3 ${
                    snapshot.isDraggingOver ? 'bg-gray-200' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-semibold">{stage.name}</h3>
                      {stage.limit && (
                        <span className="text-xs text-gray-500">
                          ({stage.cards?.length || 0}/{stage.limit})
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleConfigureStage(stage)}
                      className="hover:bg-gray-200 rounded-full h-8 w-8 p-0"
                      title="Configurar etapa"
                    >
                      <Settings className="w-4 h-4 text-gray-600" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 mb-3 min-h-[100px] max-h-[calc(100vh-180px)] overflow-y-auto">
                    {stage.cards?.map((card: { id: any; title?: string; fields?: Record<string, FieldValue>; stageId?: string; createdAt?: Date; updatedAt?: Date; assignedTo?: string[] | undefined; priority?: "high" | "low" | "medium" | undefined; tags?: string[] | undefined; dueDate?: Date | undefined; comments?: Comment[] | undefined; history?: CardHistory[] | undefined; attachments?: { id: string; name: string; url: string; type: string; size: number; uploadedAt: Date; uploadedBy: string; }[] | undefined; watchers?: string[] | undefined; status?: "active" | "archived" | "deleted" | undefined; metadata?: Record<string, any> | undefined; }, cardIndex: number) => (
                      <Draggable 
                        key={card.id} 
                        draggableId={String(card.id)} 
                        index={cardIndex}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={snapshot.isDragging ? 'opacity-50' : ''}
                          >
                            <Card
                              card={card}
                              fields={[
                                ...fields,
                                ...(stage.fields || [])
                              ]}
                              onEdit={() => handleEditCard(card)}
                              onDelete={() => handleDeleteCard(stage.id, card.id)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>

                  {index === 0 && (
                    <Button
                      variant="black"
                      className="w-full"
                      onClick={() => handleAddNewCard(stage.id)}
                    >
                      + Adicionar Cartão
                    </Button>
                  )}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {addingCard && (
        <Dialog open={true} onOpenChange={() => setAddingCard(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Cartão</DialogTitle>
            </DialogHeader>
            <NewCardForm
              fields={[
                ...fields,
                ...(localStages.find((s: { id: number; }) => s.id === addingCard.stageId)?.fields || [])
              ]}
              previousFields={getPreviousFields(addingCard.stageId)}
              stageId={addingCard.stageId}
              onSubmit={(cardData) => {
                addCard(addingCard.stageId, {
                  ...cardData,
                  id: Date.now(),
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  history: []
                });
                setAddingCard(null);
              }}
              onClose={() => setAddingCard(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {editingCard && (
        <Dialog open={true} onOpenChange={() => setEditingCard(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Cartão</DialogTitle>
            </DialogHeader>
            <NewCardForm
              fields={[
                ...fields,
                ...(localStages.find((s: { id: any; }) => s.id === editingCard.stageId)?.fields || [])
              ]}
              previousFields={getPreviousFields(editingCard.stageId)}
              stageId={editingCard.stageId}
              initialData={editingCard}
              onSubmit={(cardData) => {
                updateCard(editingCard.stageId, editingCard.id, {
                  ...editingCard,
                  ...cardData,
                  updatedAt: new Date()
                });
                setEditingCard(null);
              }}
              onClose={() => setEditingCard(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {configuringStage && (
        <Dialog open={true} onOpenChange={() => setConfiguringStage(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurar Etapa: {configuringStage.name}</DialogTitle>
            </DialogHeader>
            <FlowSettingsModal
              flowId={configuringStage.id}
              stage={configuringStage}
              initialFields={configuringStage.fields || []}
              previousStageFields={stages
                .filter((s: { order: number; }) => typeof s.order === 'number' &&
                  typeof configuringStage.order === 'number' &&
                  s.order < configuringStage.order
                )
                .flatMap((s: { fields: any; }) => s.fields || [])}
              availableStages={stages.filter((s: { id: any; }) => s.id !== configuringStage.id)}
              onClose={() => setConfiguringStage(null)}
              onSave={(updates) => handleSaveStageConfig(configuringStage.id, updates)} onDelete={function (stageId: string): void {
                throw new Error('Function not implemented.');
              } }            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default KanbanBoard;