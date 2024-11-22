import { NextApiRequest, NextApiResponse } from 'next';
import type { Flow, Stage, CardType } from '../..//../../../../src/types';

// Usando o mesmo array de flows
declare let flows: Flow[];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;
  const flowId = parseInt(query.id as string);
  const stageId = parseInt(query.stageId as string);

  // Encontra o flow
  const flow = flows.find(f => f.id === flowId);
  if (!flow) {
    res.status(404).json({ message: 'Flow não encontrado' });
    return;
  }

  // Encontra o stage
  const stage = flow.stages.find(s => s.id === stageId);
  if (!stage) {
    res.status(404).json({ message: 'Stage não encontrado' });
    return;
  }

  switch (method) {
    case 'GET': {
      // Retorna todos os cards do stage
      res.status(200).json(stage.cards);
      break;
    }
    case 'POST': {
      // Adiciona um novo card
      const { title, fields } = body;

      if (!title || !fields) {
        res.status(400).json({ message: 'Título e campos são obrigatórios' });
        return;
      }

      const newCard: CardType = {
        id: Date.now(),
        title,
        fields,
        stageId,
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [{
          date: new Date(),
          from: {
            stageId: stageId,
            stageName: stage.name
          },
          to: {
            stageId: stageId,
            stageName: stage.name
          },
          fields: fields
        }]
      };

      // Garanta que o card não existe em nenhum outro stage
      flow.stages.forEach(s => {
        s.cards = s.cards.filter(c => c.id !== newCard.id);
      });

      // Adicione o card ao stage correto
      stage.cards.push(newCard);
      
      // Atualize os contadores e timestamps
      flow.cards = flow.stages.reduce((total, s) => total + s.cards.length, 0);
      flow.updatedAt = new Date();

      // Atualize o array global de flows
      flows = flows.map(f => f.id === flow.id ? flow : f);

      res.status(201).json(flow);
      break;
    }
    case 'PUT': {
      // Atualiza um card existente
      const cardId = parseInt(query.cardId as string);
      const cardIndex = stage.cards.findIndex(c => c.id === cardId);

      if (cardIndex === -1) {
        res.status(404).json({ message: 'Card não encontrado' });
        return;
      }

      const updatedCard = {
        ...stage.cards[cardIndex],
        ...body,
        updatedAt: new Date()
      };

      stage.cards[cardIndex] = updatedCard;
      flow.updatedAt = new Date();

      flows = flows.map(f => f.id === flow.id ? flow : f);

      res.status(200).json(flow);
      break;
    }
    case 'DELETE': {
      // Remove um card
      const cardId = parseInt(query.cardId as string);
      
      stage.cards = stage.cards.filter(c => c.id !== cardId);
      flow.cards = flow.stages.reduce((total, s) => total + s.cards.length, 0);
      flow.updatedAt = new Date();

      flows = flows.map(f => f.id === flow.id ? flow : f);

      res.status(200).json(flow);
      break;
    }
    default: {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Método ${method} não permitido`);
    }
  }
}