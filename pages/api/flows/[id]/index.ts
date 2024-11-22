import { NextApiRequest, NextApiResponse } from 'next';
import type { Flow } from '../../../../src/types';

// Usando a mesma variável flows do outro arquivo
declare let flows: Flow[];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;
  const flowId = parseInt(query.id as string);

  // Encontra o flow
  const flowIndex = flows.findIndex(f => f.id === flowId);
  if (flowIndex === -1) {
    res.status(404).json({ message: 'Flow não encontrado' });
    return;
  }

  switch (method) {
    case 'GET': {
      // Retorna o flow específico
      res.status(200).json(flows[flowIndex]);
      break;
    }
    
    case 'PUT': {
      // Atualiza o flow
      const updatedFlow = {
        ...flows[flowIndex],
        ...body,
        updatedAt: new Date()
      };

      flows[flowIndex] = updatedFlow;
      res.status(200).json(updatedFlow);
      break;
    }
    
    case 'DELETE': {
      console.log(`Excluindo o fluxo com ID ${flowId}`);
      flows = flows.filter(f => f.id !== flowId);
      res.status(204).end();
      break;
    }
    
    default: {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Método ${method} não permitido`);
    }
  }
}