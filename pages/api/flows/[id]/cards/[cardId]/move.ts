import { NextApiRequest, NextApiResponse } from 'next';
import type { Flow, Stage, CardType } from '../..//../../../../src/types';

declare let flows: Flow[];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const flowId = parseInt(req.query.id as string);
    const cardId = parseInt(req.query.cardId as string);
    const { fromStageId, toStageId } = req.body;

    console.log('Tentando mover card:', { flowId, cardId, fromStageId, toStageId });

    // Validações
    if (isNaN(flowId) || isNaN(cardId) || !fromStageId || !toStageId) {
      return res.status(400).json({ message: 'Parâmetros inválidos' });
    }

    // Encontra o flow
    const flow = flows.find(f => Number(f.id) === flowId); // Use Number ou toString conforme necessário
if (!flow) {
  return res.status(404).json({ message: 'Flow não encontrado' });
}

    // Encontra os stages
    const fromStage = flow.stages.find(s => s.id === fromStageId);
    const toStage = flow.stages.find(s => s.id === toStageId);

    if (!fromStage || !toStage) {
      return res.status(404).json({ message: 'Stage não encontrado' });
    }

    // Encontra e remove o card do stage original
    const cardToMove = fromStage.cards.find(c => c.id === cardId);
    if (!cardToMove) {
      return res.status(404).json({ message: 'Card não encontrado' });
    }

    fromStage.cards = fromStage.cards.filter(c => c.id !== cardId);

    // Atualiza o card e adiciona ao novo stage
    const updatedCard = {
      ...cardToMove,
      stageId: toStageId,
      updatedAt: new Date(),
      history: [
        ...(cardToMove.history || []),
        {
          date: new Date(),
          from: {
            stageId: fromStageId,
            stageName: fromStage.name
          },
          to: {
            stageId: toStageId,
            stageName: toStage.name
          },
          fields: { ...cardToMove.fields } // Faz uma cópia dos campos
        }
      ]
    };

    toStage.cards.push(updatedCard);
    flow.updatedAt = new Date();

    // Atualiza o array global de flows
    flows = flows.map(f => f.id === flow.id ? flow : f);

    console.log('Card movido com sucesso');
    res.status(200).json(flow);

  } catch (error) {
    console.error('Erro ao mover card:', error);
    res.status(500).json({ message: 'Erro interno ao mover card' });
  }
}