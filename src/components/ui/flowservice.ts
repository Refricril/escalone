// /services/flowService.ts

import type { Flow, CardType, FieldValue, Stage, Field, DateStatus, Comment, CardHistory, StageRef } from "../../types";

export const flowService = {
  async getFlows(): Promise<Flow[]> {
    try {
      const response = await fetch('/api/flows');
      if (!response.ok) throw new Error('Erro ao buscar flows');
      return response.json();
    } catch (error) {
      console.error('getFlows error:', error);
      throw error;
    }
  },

  async createFlow(flowData: Partial<Flow>): Promise<Flow> {
    try {
      const response = await fetch('/api/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flowData)
      });
      if (!response.ok) throw new Error('Erro ao criar flow');
      return response.json();
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
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Erro ao atualizar flow');
      return response.json();
    } catch (error) {
      console.error('updateFlow error:', error);
      throw error;
    }
  },

  async deleteFlow(flowId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/flows/${flowId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erro ao deletar flow');
      return true;
    } catch (error) {
      console.error('deleteFlow error:', error);
      throw error;
    }
  },

  async addCard(flowId: string, stageId: string, card: CardType): Promise<Flow> {
    try {
      const response = await fetch(`/api/flows/${flowId}/stages/${stageId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(card)
      });
      if (!response.ok) throw new Error('Erro ao adicionar cartão');
      return response.json();
    } catch (error) {
      console.error('addCard error:', error);
      throw error;
    }
  },

  async updateCard(flowId: string, stageId: string, cardId: string, updates: Partial<CardType>): Promise<Flow> {
    try {
      console.log('Enviando atualização do card:', { flowId, stageId, cardId, updates });
      
      const response = await fetch(`/api/flows/${flowId}/stages/${stageId}/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          stageId,
          updatedAt: new Date()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro na resposta:', errorData);
        throw new Error('Erro ao atualizar cartão');
      }

      const updatedFlow = await response.json();
      console.log('Flow atualizado:', updatedFlow);
      return updatedFlow;
    } catch (error) {
      console.error('updateCard error:', error);
      throw error;
    }
  },

  async deleteCard(flowId: string, stageId: string, cardId: string): Promise<Flow> {
    try {
      const response = await fetch(`/api/flows/${flowId}/stages/${stageId}/cards/${cardId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erro ao deletar cartão');
      return response.json();
    } catch (error) {
      console.error('deleteCard error:', error);
      throw error;
    }
  },

  async moveCard(flowId: string, cardId: string, fromStageId: string, toStageId: string): Promise<Flow> {
    try {
      console.log('Movendo card:', { flowId, cardId, fromStageId, toStageId });

      const response = await fetch(`/api/flows/${flowId}/cards/${cardId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromStageId,
          toStageId,
          updatedAt: new Date()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro na resposta:', errorData);
        throw new Error('Erro ao mover cartão');
      }

      const updatedFlow = await response.json();
      console.log('Flow atualizado após mover card:', updatedFlow);
      return updatedFlow;
    } catch (error) {
      console.error('moveCard error:', error);
      throw error;
    }
  },

  async deleteStage(flowId: string, stageId: string): Promise<Flow> {
    try {
      const response = await fetch(`/api/flows/${flowId}/stages/${stageId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao excluir a etapa no servidor.');
      }
      return response.json();
    } catch (error) {
      console.error('deleteStage error:', error);
      throw error;
    }
  },

  async getFlow(flowId: string): Promise<Flow> {
    try {
      const response = await fetch(`/api/flows/${flowId}`);
      if (!response.ok) throw new Error('Erro ao buscar flow');
      return response.json();
    } catch (error) {
      console.error('getFlow error:', error);
      throw error;
    }
  }
};

export default flowService;