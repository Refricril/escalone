// /services/flowService.ts

import type { 
  Flow, 
  CardType, 
  Stage, 
  Field, 
  DateStatus, 
  Comment, 
  CardHistory, 
  StageRef, 
  FieldValue, 
  FlowSettings,
  StageFieldConfig 
} from "../../types";

export const flowService = {
  async getFlows(): Promise<Flow[]> {
    try {
      const response = await fetch('/api/flows');
      if (!response.ok) {
        throw new Error(`Erro ao buscar flows: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('getFlows error:', error);
      throw error;
    }
  },

  async getFlow(flowId: string): Promise<Flow> {
    try {
      const response = await fetch(`/api/flows/${flowId}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar flow: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('getFlow error:', error);
      throw error;
    }
  },

  async createFlow(flowData: Partial<Flow>): Promise<Flow> {
    try {
      const newFlow = {
        ...flowData,
        id: String(Date.now()),
        cards: 0,
        members: 0,
        stages: [],
        fields: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          requireComments: false,
          allowCardDelete: true,
          autoAssignment: false,
          notifyOnChange: true,
          defaultDueDateDays: 7
        } as FlowSettings
      };

      const response = await fetch('/api/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFlow),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao criar flow: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('createFlow error:', error);
      throw error;
    }
  },

  async updateFlow(flowId: string, updates: Partial<Flow>): Promise<Flow> {
    try {
      const response = await fetch(`/api/flows/${flowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          updatedAt: new Date()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao atualizar flow: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('updateFlow error:', error);
      throw error;
    }
  },

  async deleteFlow(flowId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/flows/${flowId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao deletar flow: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('deleteFlow error:', error);
      throw error;
    }
  },

  async addCard(flowId: string, stageId: string, card: Partial<CardType>): Promise<Flow> {
    try {
      const newCard = {
        ...card,
        id: String(Date.now()),
        stageId: String(stageId),
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [],
        title: card.title || '',
        fields: card.fields || {},
      };

      const response = await fetch(`/api/flows/${flowId}/stages/${stageId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCard),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao adicionar cartão');
      }

      return await response.json();
    } catch (error) {
      console.error('addCard error:', error);
      throw error;
    }
  },

  async updateCard(flowId: string, stageId: string, cardId: string, updates: Partial<CardType>): Promise<Flow> {
    try {
      const response = await fetch(`/api/flows/${flowId}/stages/${stageId}/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          updatedAt: new Date()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar cartão');
      }

      return await response.json();
    } catch (error) {
      console.error('updateCard error:', error);
      throw error;
    }
  },

  async deleteCard(flowId: string, stageId: string, cardId: string): Promise<Flow> {
    try {
      const response = await fetch(`/api/flows/${flowId}/stages/${stageId}/cards/${cardId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao deletar cartão');
      }

      return await response.json();
    } catch (error) {
      console.error('deleteCard error:', error);
      throw error;
    }
  },

  async moveCard(flowId: string, cardId: string, fromStageId: string, toStageId: string): Promise<Flow> {
    try {
      const response = await fetch(`/api/flows/${flowId}/cards/${cardId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromStageId,
          toStageId,
          updatedAt: new Date(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao mover cartão');
      }

      return await response.json();
    } catch (error) {
      console.error('moveCard error:', error);
      throw error;
    }
  },

  async addComment(flowId: string, cardId: string, comment: Partial<Comment>): Promise<Flow> {
    try {
      const response = await fetch(`/api/flows/${flowId}/cards/${cardId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...comment,
          id: String(Date.now()),
          createdAt: new Date(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao adicionar comentário');
      }

      return await response.json();
    } catch (error) {
      console.error('addComment error:', error);
      throw error;
    }
  },

  async updateStage(flowId: string, stageId: string, updates: Partial<Stage>): Promise<Flow> {
    try {
      const response = await fetch(`/api/flows/${flowId}/stages/${stageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar estágio');
      }

      return await response.json();
    } catch (error) {
      console.error('updateStage error:', error);
      throw error;
    }
  },

  async deleteStage(flowId: string, stageId: string): Promise<Flow> {
    try {
      const response = await fetch(`/api/flows/${flowId}/stages/${stageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao excluir estágio');
      }

      return await response.json();
    } catch (error) {
      console.error('deleteStage error:', error);
      throw error;
    }
  },
};

export default flowService;