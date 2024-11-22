// pages/api/stages/[stageId].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

type ResponseData = {
  success?: boolean;
  message?: string;
  error?: string;
  deletedId?: string | string[];
};

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ 
      success: false, 
      error: 'Método não permitido' 
    });
  }

  try {
    const { stageId } = req.query;

    if (!stageId || Array.isArray(stageId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'ID do estágio inválido' 
      });
    }

    // Primeiro tenta deletar os cartões
    try {
      await prisma.card.deleteMany({
        where: {
          stageId: stageId
        }
      });
    } catch (error) {
      console.log('Erro ao deletar cartões, continuando com a deleção do estágio');
    }

    // Tenta deletar o estágio
    const deletedStage = await prisma.stage.delete({
      where: {
        id: stageId
      }
    });

    if (!deletedStage) {
      return res.status(404).json({
        success: false,
        error: 'Estágio não encontrado'
      });
    }

    return res.status(200).json({ 
      success: true,
      message: 'Estágio excluído com sucesso',
      deletedId: stageId
    });

  } catch (error) {
    console.error('Erro detalhado ao excluir estágio:', error);
    
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao excluir estágio'
    });
  } finally {
    await prisma.$disconnect();
  }
}