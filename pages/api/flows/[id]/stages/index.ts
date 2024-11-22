import { NextApiRequest, NextApiResponse } from 'next';
import type { Flow, Stage } from '../../../../../src/types';

// Usando o mesmo array de flows
declare let flows: Flow[];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;
  const flowId = parseInt(query.id as string);

  // Encontra o flow
  const flow = flows.find(f => f.id === flowId);
  if (!flow) {
    res.status(404).json({ message: 'Flow não encontrado' });
    return;
  }

  switch (method) {
    case 'GET': {
      // Retorna todos os stages do flow
      res.status(200).json(flow.stages);
      break;
    }
    case 'POST': {
      // Cria um novo stage
      const { name } = body;

      if (!name) {
        res.status(400).json({ message: 'Nome é obrigatório' });
        return;
      }

      const newStage: Stage = {
        id: Date.now(),
        name,
        cards: [],
        order: flow.stages.length + 1,
        fields: [],
        fieldConfig: {
          inheritFields: false,
          requiredFields: [],
          hiddenFields: [],
        }
      };

      flow.stages.push(newStage);
      flow.updatedAt = new Date();

      res.status(201).json(newStage);
      break;
    }
    default: {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Método ${method} não permitido`);
    }
  }
}