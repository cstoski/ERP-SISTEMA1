import api from './api';

export interface PessoaJuridica {
  id: number;
  razao_social: string;
  nome_fantasia?: string;
  sigla: string;
  tipo: string;
  cnpj: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  endereco?: string;
  complemento?: string;
  cidade: string;
  estado: string;
  cep?: string;
  pais: string;
  criado_em: string;
  atualizado_em: string;
}

export interface PessoaJuridicaCreate {
  razao_social: string;
  nome_fantasia?: string;
  sigla: string;
  tipo: string;
  cnpj: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  endereco?: string;
  complemento?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  pais?: string;
}

export const pessoaJuridicaService = {
  listar: () => api.get<PessoaJuridica[]>('/api/pessoas-juridicas'),
  obter: (id: number) => api.get<PessoaJuridica>(`/api/pessoas-juridicas/${id}`),
  criar: (data: PessoaJuridicaCreate) => api.post<PessoaJuridica>('/api/pessoas-juridicas', data),
  atualizar: (id: number, data: Partial<PessoaJuridicaCreate>) => api.put<PessoaJuridica>(`/api/pessoas-juridicas/${id}`, data),
  deletar: (id: number) => api.delete(`/api/pessoas-juridicas/${id}`),
};
