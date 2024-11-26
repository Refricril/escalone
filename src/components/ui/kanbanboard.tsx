"use client"

import React, { useState, useEffect } from 'react';
import { Plus, Settings } from 'lucide-react';
import type { KanbanBoardProps, CardType, Field, Stage, DateStatus, CardHistory, StageRef } from "../../types";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Card from './card';
import NewCardForm from '../new-card-form';
import FlowSettingsModal from "@/components/ui/FlowSettingsModal";
import { Button } from '@/components/ui/button';

function KanbanBoard({
  stages = [], 
  fields = [], 
  addStage,
  addCard,
  updateCard,
  deleteCard,
  moveCard,
  updateStage,
  configureStage,
  onCardClick,
  currentFlow,
}: KanbanBoardProps) {
  const [newStageName, setNewStageName] = useState("");
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [configuringStage, setConfiguringStage] = useState<Stage | null>(null);
  const [addingCard, setAddingCard] = useState<{ stageId: string } | null>(null);
  const [localStages, setLocalStages] = useState<Stage[]>(stages || []);

  // Debug logs para monitorar mudanças nos stages
  useEffect(() => {
    if (stages) {
      console.log('Stages recebidos:', stages);
      const stagesString = JSON.stringify(stages);
      const localStagesString = JSON.stringify(localStages);
      
      if (stagesString !== localStagesString) {
        console.log('Atualizando localStages');
        setLocalStages(stages);
      }
    }
  }, [stages]);

  const handleAddStage = () => {
    console.log('Tentando adicionar nova etapa');
    
    if (!newStageName.trim()) {
      alert("O nome da etapa não pode estar vazio.");
      return;
    }

    const newStage: Stage = {
      id: String(Date.now()),
      name: newStageName.trim(),
      cards: [],
      order: (localStages?.length || 0) + 1,
      fields: [],
      limit: undefined,
      allowedMoves: [],
    };

    console.log('Nova etapa criada:', newStage);

    setLocalStages((prevStages) => (prevStages ? [...prevStages, newStage] : [newStage]));
    setNewStageName("");

    if (addStage) {
      try {
        addStage(newStage.name);
      } catch (error) {
        console.error("Erro ao adicionar etapa:", error);
        alert("Não foi possível adicionar a etapa. Por favor, tente novamente.");
      }
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    console.log('Tentando deletar etapa:', stageId);
    
    const confirmDelete = window.confirm(
      'Tem certeza que deseja excluir esta etapa? Todos os cartões associados serão removidos.'
    );
    if (!confirmDelete) return;
  
    try {
      const response = await fetch(`/api/stages/${stageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'Falha ao excluir o estágio'
        }));
        throw new Error(errorData.error || 'Falha ao excluir o estágio');
      }
  
      setLocalStages(prevStages => prevStages.filter(stage => stage.id !== stageId));
      console.log('Etapa deletada com sucesso');
      
    } catch (error: any) {
      console.error('Erro ao excluir etapa:', error);
      alert('Não foi possível excluir a etapa. Por favor, tente novamente.');
    }
  };

  const handleDragEnd = (result: DropResult) => {
    console.log('Drag finalizado:', result);
    
    const { source, destination, draggableId } = result;
  
    if (!destination) return;
    
    const fromStageId = source.droppableId;
    const toStageId = destination.droppableId;
    const cardId = draggableId;

    if (fromStageId === toStageId && source.index === destination.index) return;

    const fromStage = localStages.find(s => s.id === fromStageId);
    const toStage = localStages.find(s => s.id === toStageId);
    const movingCard = fromStage?.cards.find(c => c.id === cardId);

    if (!fromStage || !toStage || !movingCard) {
      console.error('Stages or card not found:', { fromStageId, toStageId, cardId });
      return;
    }

    const isAllowed = fromStage.allowedMoves 
      ? fromStage.allowedMoves.includes(toStageId)
      : true;

    if (!isAllowed) {
      alert(`Moving cards from "${fromStage.name}" to "${toStage.name}" is not allowed`);
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

    console.log('Cartão atualizado após movimento:', updatedCard);

    const updatedStages = localStages.map(stage => {
      if (stage.id === fromStageId) {
        return {
          ...stage,
          cards: stage.cards.filter(card => card.id !== cardId)
        };
      }
      if (stage.id === toStageId) {
        const newCards = [...stage.cards];
        newCards.splice(destination.index, 0, updatedCard);
        return {
          ...stage,
          cards: newCards
        };
      }
      return stage;
    });

    setLocalStages(updatedStages);
    console.log('Stages atualizados após movimento:', updatedStages);

    if (moveCard) {
      Promise.resolve(moveCard(cardId, fromStageId, toStageId))
        .catch((error: unknown) => {
          console.error('Error moving card:', error);
          setLocalStages(stages);
          alert('Error moving the card. The operation was reverted.');
        });
    }
  };
  const handleAddNewCard = (stageId: string) => {
    console.log('Iniciando adição de cartão no stage:', stageId);
    setAddingCard({ stageId });
  };

  const handleEditCard = (card: CardType) => {
    console.log('Editando cartão:', card);
    setEditingCard(card);
    if (onCardClick) {
      onCardClick(card);
    }
  };

  const handleConfigureStage = (stage: Stage) => {
    console.log('Configurando stage:', stage);
    setConfiguringStage(stage);
  };

  const handleSaveStageConfig = (stageId: string, updates: Partial<Stage>) => {
    console.log('Salvando configurações do stage:', { stageId, updates });
    
    if (updateStage) {
      const updatedStages = localStages.map(stage => {
        if (stage.id === stageId) {
          return { ...stage, ...updates };
        }
        return stage;
      });
      setLocalStages(updatedStages);

      try {
        updateStage(stageId, updates);
      } catch (error) {
        console.error('Error saving settings:', error);
        setLocalStages(stages);
        alert('Error saving settings. Changes have been reverted.');
      }
    }
    setConfiguringStage(null);
  };

  const handleDeleteCard = async (stageId: string, cardId: string) => {
    console.log('Tentando deletar cartão:', { stageId, cardId });
    
    if (deleteCard) {
      const confirmDelete = window.confirm('Are you sure you want to delete this card?');
      if (!confirmDelete) return;
  
      const updatedStages = localStages.map(stage => {
        if (stage.id === stageId) {
          return {
            ...stage,
            cards: stage.cards.filter(card => card.id !== cardId)
          };
        }
        return stage;
      });
      
      // Atualização otimista
      setLocalStages(updatedStages);
      console.log('Stages atualizados após deleção:', updatedStages);
  
      try {
        await deleteCard(stageId, cardId);
      } catch (error) {
        console.error('Error deleting card:', error);
        setLocalStages(stages);
        alert('Error deleting the card. The operation was reverted.');
      }
    }
  };

  const getPreviousFields = (currentStageId: string): Field[] => {
    const currentStage = localStages.find(s => s.id === currentStageId);
    if (!currentStage) return [];

    return localStages
      .filter(s => 
        typeof s.order === 'number' && 
        typeof currentStage.order === 'number' && 
        s.order < currentStage.order
      )
      .flatMap(s => s.fields || []);
  };

  const ensureArray = (possibleArray: any): any[] => {
    if (Array.isArray(possibleArray)) {
      return possibleArray;
    }
    return [];
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
          {(localStages || []).map((stage, index) => {
            console.log(`Renderizando stage ${stage.name}:`, stage);
            return (
              <Droppable droppableId={stage.id.toString()} key={stage.id}>
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
                      {console.log(`Cards do stage ${stage.name}:`, stage.cards)}
                      {stage.cards && stage.cards.length > 0 ? (
                        stage.cards.map((card, cardIndex) => {
                          console.log('Renderizando cartão:', card);
                          return (
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
                                  className={`mb-2 ${snapshot.isDragging ? 'opacity-50' : ''}`}
                                >
                                  <Card
                                    card={card}
                                    fields={ensureArray(fields).concat(ensureArray(stage.fields))}
                                    onEdit={() => handleEditCard(card)}
                                    onDelete={() => handleDeleteCard(stage.id, card.id)}
                                  />
                                </div>
                              )}
                            </Draggable>
                          );
                        })
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          Nenhum cartão nesta etapa
                        </div>
                      )}
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
            );
          })}
        </div>
      </DragDropContext>
      {addingCard && (
        <Dialog open={true} onOpenChange={() => setAddingCard(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Cartão</DialogTitle>
              <DialogDescription>
                Adicione um novo cartão preenchendo as informações necessárias
              </DialogDescription>
            </DialogHeader>
            <NewCardForm
              fields={ensureArray(fields).concat(
                ensureArray(localStages.find(s => s.id === addingCard.stageId)?.fields)
              )}
              previousFields={getPreviousFields(addingCard.stageId)}
              stageId={addingCard.stageId}
              onSubmit={(cardData) => {
                if (addCard) {
                  addCard(addingCard.stageId, {
                    ...cardData,
                    id: String(Date.now()),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    history: []
                  });
                }
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
        <DialogDescription>
          Modifique as informações do cartão conforme necessário
        </DialogDescription>
      </DialogHeader>
      <NewCardForm
        fields={ensureArray(fields).concat(
          ensureArray(localStages.find(s => s.id === editingCard.stageId)?.fields)
        )}
        previousFields={getPreviousFields(editingCard.stageId)}
        stageId={editingCard.stageId}
        initialData={editingCard}
        onSubmit={(cardData) => {
          if (updateCard) {  // Verifica se updateCard existe
            updateCard(editingCard.stageId, editingCard.id, {
              ...editingCard,
              ...cardData,
              updatedAt: new Date()
            });
          }
          setEditingCard(null);
        }}
        onClose={() => setEditingCard(null)}
      />
    </DialogContent>
  </Dialog>
)}

{configuringStage && (
        <Dialog open={true} onOpenChange={() => setConfiguringStage(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Configurar Etapa: {configuringStage.name}</DialogTitle>
              <DialogDescription>
                Configure os campos e comportamentos desta etapa do fluxo
              </DialogDescription>
            </DialogHeader>
            <FlowSettingsModal
              flowId={configuringStage.id}
              stage={configuringStage}
              initialFields={configuringStage.fields || []}
              previousStageFields={stages
                .filter(s => 
                  typeof s.order === 'number' && 
                  typeof configuringStage.order === 'number' && 
                  s.order < configuringStage.order
                )
                .flatMap(s => s.fields || [])}
              availableStages={stages.filter(s => s.id !== configuringStage.id)}
              onClose={() => setConfiguringStage(null)}
              onSave={(updates) => handleSaveStageConfig(configuringStage.id, updates)}
              onDelete={handleDeleteStage}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default KanbanBoard;