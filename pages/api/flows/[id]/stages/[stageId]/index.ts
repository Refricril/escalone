import { NextApiRequest, NextApiResponse } from 'next';
import type { Flow } from '../../../../../../src/types';

declare let flows: Flow[];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const flowId = parseInt(query.id as string);
  const stageId = parseInt(query.stageId as string);

  // Encontra o flow
  const flow = flows.find(f => f.id === flowId);
  if (!flow) {
    return res.status(404).json({ message: 'Flow não encontrado' });
  }

  switch (method) {
    case 'DELETE': {
      // Remove o stage
      const stageIndex = flow.stages.findIndex(s => s.id === stageId);
      if (stageIndex === -1) {
        return res.status(404).json({ message: 'Stage não encontrado' });
      }

      // Remove o stage do array
      flow.stages.splice(stageIndex, 1);
      
      // Atualiza os contadores e timestamps
      flow.updatedAt = new Date();

      // Atualiza o array global de flows
      flows = flows.map(f => f.id === flow.id ? flow : f);

      return res.status(200).json(flow);
    }
    default: {
      res.setHeader('Allow', ['DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  }
}