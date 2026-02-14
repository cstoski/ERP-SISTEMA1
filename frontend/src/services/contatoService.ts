import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/contatos';

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

export const contatoService = {
  listarTodos() {
    return axios.get<Contato[]>(API_URL);
  },
  listar(pessoa_juridica_id: number) {
    return axios.get<Contato[]>(`${API_URL}/pessoa/${pessoa_juridica_id}`);
  },
  criar(contato: ContatoCreate) {
    return axios.post<Contato>(API_URL, contato);
  },
  atualizar(id: number, contato: Partial<ContatoCreate>) {
    return axios.put<Contato>(`${API_URL}/${id}`, contato);
  },
  deletar(id: number) {
    return axios.delete(`${API_URL}/${id}`);
  },
};