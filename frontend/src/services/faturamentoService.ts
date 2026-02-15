import api from './api';

export interface Faturamento {
  id: number;
  projeto_id: number;
  tecnico_id: number;
  valor_faturado: number;
  data_faturamento?: string;
  observacoes?: string;
  criado_em?: string;
  atualizado_em?: string;
}

const API_URL = '/api/faturamentos';

const listarPorProjeto = async (projetoId: number) => {
  const res = await api.get(`${API_URL}/projeto/${projetoId}`);
  return res.data as Faturamento[];
};

const obter = async (id: number) => {
  const res = await api.get(`${API_URL}/${id}`);
  return res.data as Faturamento;
};

const listarTodos = async () => {
  const res = await api.get(`${API_URL}/`);
  return res.data as Faturamento[];
};

const criar = async (payload: Partial<Faturamento>) => {
  const res = await api.post(`${API_URL}/`, payload);
  return res.data as Faturamento;
};

const exportarExcel = async () => {
  const res = await api.get(`${API_URL}/export/excel`, { responseType: 'blob' });
  return res.data;
};

const importarExcel = async (file: File) => {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post(`${API_URL}/import/excel`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data;
};

const atualizar = async (id: number, payload: Partial<Faturamento>) => {
  const res = await api.put(`${API_URL}/${id}`, payload);
  return res.data as Faturamento;
};

const deletar = async (id: number) => {
  const res = await api.delete(`${API_URL}/${id}`);
  return res.data;
};


export default { listarPorProjeto, obter, listarTodos, criar, atualizar, deletar, exportarExcel, importarExcel};