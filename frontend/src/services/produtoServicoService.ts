import api from './api';

export interface ProdutoServicoFornecedor {
  id?: number;
  fornecedor_id: number;
  codigo_fornecedor: string;
  preco_unitario: number;
  prazo_entrega_dias: number;
  icms: number;
  ipi: number;
  pis: number;
  cofins: number;
  iss: number;
  fornecedor?: {
    id: number;
    razao_social: string;
    nome_fantasia?: string;
    tipo?: string;
  };
}

export interface ProdutoServico {
  id: number;
  codigo_interno: string;
  tipo: string;
  unidade_medida: string;
  descricao: string;
  codigo_fabricante?: string;
  nome_fabricante?: string;
  preco_unitario: number;
  ncm?: string;
  lcp?: string;
  fornecedores: ProdutoServicoFornecedor[];
  criado_em: string;
  atualizado_em?: string;
}

export interface ProdutoServicoCreate {
  tipo: string;
  unidade_medida: string;
  descricao: string;
  codigo_fabricante?: string;
  nome_fabricante?: string;
  preco_unitario: number;
  ncm?: string;
  lcp?: string;
  fornecedores: ProdutoServicoFornecedor[];
}

export const produtoServicoService = {
  listar: () => {
    console.log('[produtoServicoService] listar() chamado');
    return api.get<ProdutoServico[]>('/api/produtos-servicos');
  },
  obter: (id: number) => api.get<ProdutoServico>(`/api/produtos-servicos/${id}`),
  criar: (data: ProdutoServicoCreate) => api.post<ProdutoServico>('/api/produtos-servicos', data),
  atualizar: (id: number, data: Partial<ProdutoServicoCreate>) =>
    api.put<ProdutoServico>(`/api/produtos-servicos/${id}`, data),
  deletar: (id: number) => api.delete(`/api/produtos-servicos/${id}`),
};

export default produtoServicoService;
