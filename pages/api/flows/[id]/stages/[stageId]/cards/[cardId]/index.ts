import { NextApiRequest, NextApiResponse } from 'next';
import type { Flow, CardType } from '../../../../../../../../src/types';

declare let flows: Flow[];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method, query, body } = req;
    const flowId = parseInt(query.id as string);
    const stageId = parseInt(query.stageId as string);
    const cardId = parseInt(query.cardId as string);

    console.log('Chamada da API:', { method, flowId, stageId, cardId, body });

    // Validações
    if (isNaN(flowId) || isNaN(stageId) || isNaN(cardId)) {
      return res.status(400).json({ message: 'IDs inválidos' });
    }

    // Encontra o flow
    const flow = flows.find(f => f.id === flowId);
    if (!flow) {
      return res.status(404).json({ message: 'Flow não encontrado' });
    }

    // Encontra o stage
    const stage = flow.stages.find(s => s.id === stageId);
    if (!stage) {
      return res.status(404).json({ message: 'Stage não encontrado' });
    }

    // Encontra o card
    const cardIndex = stage.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      return res.status(404).json({ message: 'Card não encontrado' });
    }

    switch (method) {
      case 'PUT': {
        // Atualiza o card
        const updatedCard = {
          ...stage.cards[cardIndex],
          ...body,
          updatedAt: new Date()
        };

        stage.cards[cardIndex] = updatedCard;
        flow.updatedAt = new Date();

        // Atualiza o flow global
        flows = flows.map(f => f.id === flowId ? flow : f);

        console.log('Card atualizado com sucesso');
        return res.status(200).json(flow);
      }

      case 'DELETE': {
        // Remove o card
        stage.cards.splice(cardIndex, 1);
        flow.updatedAt = new Date();

        // Atualiza o flow global
        flows = flows.map(f => f.id === flowId ? flow : f);

        console.log('Card removido com sucesso');
        return res.status(200).json(flow);
      }

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).json({ message: `Método ${method} não permitido` });
    }
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}