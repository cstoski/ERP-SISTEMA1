import axios from 'axios';

const API_URL = '/api/contatos';

export interface Contato {
  id: number;
  pessoa_juridica_id: number;
  nome: string;
  departamento?: string;
  telefone_fixo?: string;
  celular?: string;
  email?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface ContatoCreate {
  pessoa_juridica_id: number;
  nome: string;
  departamento?: string;
  telefone_fixo?: string;
  celular?: string;
  email?: string;
}

export interface ContatoUpdate extends Partial<ContatoCreate> {}

export const contatoService = {
  listarTodos() {
    return axios.get<Contato[]>(API_URL);
  },
  listar(pessoa_juridica_id: number) {
    return axios.get<Contato[]>(`${API_URL}/pessoa/${pessoa_juridica_id}`);
  },
  obter(id: number) {
    return axios.get<Contato>(`${API_URL}/${id}`);
  },
  criar(contato: ContatoCreate) {
    return axios.post<Contato>(API_URL, contato);
  },
  atualizar(id: number, contato: ContatoUpdate) {
    return axios.put<Contato>(`${API_URL}/${id}`, contato);
  },
  deletar(id: number) {
    return axios.delete(`${API_URL}/${id}`);
  },
  exportarExcel() {
    return axios.get(`${API_URL}/export/excel`, { responseType: 'blob' });
  },
  importarExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_URL}/import/excel`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};