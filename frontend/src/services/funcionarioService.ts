import axios from 'axios';

interface Funcionario {
  id: number;
  nome: string;
  departamento?: string;
  telefone_fixo?: string;
  celular?: string;
  email?: string;
  criado_em: string;
  atualizado_em: string;
}

interface FuncionarioCreate {
  nome: string;
  departamento?: string;
  telefone_fixo?: string;
  celular?: string;
  email?: string;
}

interface FuncionarioUpdate {
  nome?: string;
  departamento?: string;
  telefone_fixo?: string;
  celular?: string;
  email?: string;
}

const API_URL = '/api/funcionarios';

export const funcionarioService = {
  listarTodos: async (): Promise<Funcionario[]> => {
    const response = await axios.get(`${API_URL}/`);
    return response.data;
  },

  obter: async (id: number): Promise<Funcionario> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  criar: async (funcionario: FuncionarioCreate): Promise<Funcionario> => {
    const response = await axios.post(`${API_URL}/`, funcionario);
    return response.data;
  },

  atualizar: async (id: number, funcionario: FuncionarioUpdate): Promise<Funcionario> => {
    const response = await axios.put(`${API_URL}/${id}`, funcionario);
    return response.data;
  },

  deletar: async (id: number): Promise<Funcionario> => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },

  listarTecnicos: async (): Promise<any[]> => {
    const response = await axios.get(`${API_URL}/tecnicos`);
    return response.data;
  },

  exportarExcel: async (): Promise<Blob> => {
    const response = await axios.get(`${API_URL}/export/excel`, {
      responseType: 'blob',
    });
    return response.data;
  },

  importarExcel: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_URL}/import/excel`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default funcionarioService;
