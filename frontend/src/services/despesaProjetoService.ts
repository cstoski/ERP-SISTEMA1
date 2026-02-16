import api from './api';

export interface DespesaProjeto {
  id: number;
  numero_despesa: string;
  projeto_id: number;
  fornecedor_id: number;
  tecnico_responsavel_id: number;
  status: string;
  data_pedido: string;
  previsao_entrega?: string;
  prazo_entrega_dias?: number;
  condicao_pagamento?: string;
  tipo_frete?: string;
  valor_frete: number;
  observacoes?: string;
  criado_em: string;
  atualizado_em?: string;
  projeto?: {
    id: number;
    numero: string;
    nome: string;
  };
  fornecedor?: {
    id: number;
    razao_social: string;
    sigla: string;
  };
  tecnico_responsavel?: {
    id: number;
    nome: string;
  };
}

export interface DespesaProjetoCreate {
  projeto_id: number;
  fornecedor_id: number;
  tecnico_responsavel_id: number;
  status: string;
  data_pedido: string;
  previsao_entrega?: string;
  prazo_entrega_dias?: number;
  condicao_pagamento?: string;
  tipo_frete?: string;
  valor_frete: number;
  observacoes?: string;
}

export const despesaProjetoService = {
  listar: () => api.get<DespesaProjeto[]>('/api/despesas-projetos'),
  obter: (id: number) => api.get<DespesaProjeto>(`/api/despesas-projetos/${id}`),
  criar: (data: DespesaProjetoCreate) => api.post<DespesaProjeto>('/api/despesas-projetos', data),
  atualizar: (id: number, data: Partial<DespesaProjetoCreate>) =>
    api.put<DespesaProjeto>(`/api/despesas-projetos/${id}`, data),
  deletar: (id: number) => api.delete(`/api/despesas-projetos/${id}`),
};

export default despesaProjetoService;
