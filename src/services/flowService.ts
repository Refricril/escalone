import axios from 'axios';

// Função para buscar todos os fluxos
export const getFlows = async () => {
  try {
    const response = await axios.get('/api/flows');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar fluxos:', error);
    throw error;
  }
};

// Função para criar um novo fluxo
export const createFlow = async (name: string) => {
  try {
    const response = await axios.post('/api/flows', { name });
    return response.data;
  } catch (error) {
    console.error('Erro ao criar fluxo:', error);
    throw error;
  }
};

// Função para deletar um fluxo
export const deleteFlow = async (id: string) => {
  try {
    await axios.delete(`/api/flows?id=${id}`);
  } catch (error) {
    console.error('Erro ao deletar fluxo:', error);
    throw error;
  }
};
