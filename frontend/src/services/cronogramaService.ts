import api from './api';

interface Cronograma {
  id: number;
  projeto_id: number;
  projeto_numero: string;
  projeto_nome: string;
  cliente_nome: string;
  tecnico: string;
  percentual_conclusao: number;
  observacoes?: string;
  atualizado_em: string;
  prazo_status: string;
  dias_restantes?: number;
  prazo_entrega_dias: number;
  data_pedido_compra?: string;
}

interface CronogramaUpdate {
  percentual_conclusao?: number;
  observacoes?: string;
}

interface Historico {
  id: number;
  percentual_conclusao: number;
  observacoes?: string;
  criado_em: string;
  criado_por?: string;
}

const API_URL = '/api/cronogramas';

export const cronogramaService = {
  listarTodos: async (): Promise<Cronograma[]> => {
    const response = await api.get(`${API_URL}/`);
    return response.data;
  },

  obterPorId: async (id: number): Promise<Cronograma> => {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
  },

  obterPorProjeto: async (projetoId: number): Promise<any> => {
    const response = await api.get(`${API_URL}/projeto/${projetoId}`);
    return response.data;
  },

  atualizar: async (id: number, data: CronogramaUpdate): Promise<Cronograma> => {
    const response = await api.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  obterHistorico: async (id: number): Promise<any[]> => {
    const response = await api.get(`${API_URL}/${id}/historico`);
    return response.data;
  }
};

export type { Cronograma, CronogramaUpdate, Historico };
