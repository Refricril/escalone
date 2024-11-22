import { NextApiRequest, NextApiResponse } from 'next';
import type { Flow } from '../../../src/types';

// Declarando o tipo para o objeto global
declare global {
  var flows: Flow[];
}

// Inicializando se não existir
if (!global.flows) {
  global.flows = [];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API chamada:', req.method);
  
  const { method, body } = req;

  try {
    switch (method) {
      case 'GET': {
        console.log('Retornando flows:', global.flows);
        res.status(200).json(global.flows);
        break;
      }
      case 'POST': {
        console.log('Criando flow com dados:', body);
        
        if (!body.name) {
          res.status(400).json({ message: 'Nome é obrigatório' });
          return;
        }

        const newFlow: Flow = {
          id: Date.now(),
          name: body.name,
          description: body.description || '',
          cards: body.cards || 0,
          members: body.members || 0,
          stages: body.stages || [],
          fields: body.fields || [],
          createdAt: new Date(),
          updatedAt: new Date(),
          ownerId: body.ownerId || 1
        };

        global.flows.push(newFlow);
        console.log('Flow criado:', newFlow);
        res.status(201).json(newFlow);
        break;
      }
      default: {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Método ${method} não permitido`);
      }
    }
  } catch (error) {
    console.error('Erro no handler de flows:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}