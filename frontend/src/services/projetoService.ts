import api from './api';

interface Projeto {
  id: number;
  numero: string;
  cliente_id: number;
  nome: string;
  contato_id: number;
  tecnico: string;
  valor_orcado: number;
  valor_venda: number;
  prazo_entrega_dias: number;
  data_pedido_compra?: string;
  status: string;
  criado_em: string;
  atualizado_em: string;
}

interface ProjetoCreate {
  numero: string;
  cliente_id: number;
  nome: string;
  contato_id: number;
  tecnico: string;
  valor_orcado: number;
  valor_venda: number;
  prazo_entrega_dias: number;
  data_pedido_compra?: string;
  status: string;
}

interface ProjetoUpdate {
  numero?: string;
  cliente_id?: number;
  nome?: string;
  contato_id?: number;
  tecnico?: string;
  valor_orcado?: number;
  valor_venda?: number;
  prazo_entrega_dias?: number;
  data_pedido_compra?: string;
  status?: string;
}

const API_URL = '/api/projetos';

export const projetoService = {
  listarTodos: async (): Promise<Projeto[]> => {
    const response = await api.get(`${API_URL}/`);
    return response.data;
  },

  obter: async (id: number): Promise<Projeto> => {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
  },

  criar: async (projeto: ProjetoCreate): Promise<Projeto> => {
    const response = await api.post(`${API_URL}/`, projeto);
    return response.data;
  },

  atualizar: async (id: number, projeto: ProjetoUpdate): Promise<Projeto> => {
    const response = await api.put(`${API_URL}/${id}`, projeto);
    return response.data;
  },

  deletar: async (id: number): Promise<Projeto> => {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
  },

  obterProximoNumero: async (): Promise<{ numero: string }> => {
    const response = await api.get(`${API_URL}/proximo-numero`);
    return response.data;
  },

  listarClientes: async (): Promise<any[]> => {
    const response = await api.get(`${API_URL}/clientes`);
    return response.data;
  },

  listarContatosCliente: async (clienteId: number): Promise<any[]> => {
    const response = await api.get(`${API_URL}/cliente/${clienteId}/contatos`);
    return response.data;
  },

  exportarExcel: async (): Promise<Blob> => {
    const response = await api.get(`${API_URL}/export/excel`, {
      responseType: 'blob',
    });
    return response.data;
  },

  importarExcel: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`${API_URL}/import/excel`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default projetoService;