import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import despesaProjetoService, { DespesaProjetoCreate } from '../services/despesaProjetoService';
import { projetoService } from '../services/projetoService';
import { pessoaJuridicaService, PessoaJuridica } from '../services/pessoaJuridicaService';
import { funcionarioService } from '../services/funcionarioService';

interface Projeto {
  id: number;
  numero: string;
  nome: string;
  status: string;
}

interface Funcionario {
  id: number;
  nome: string;
}

const DespesaProjetoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [fornecedores, setFornecedores] = useState<PessoaJuridica[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<DespesaProjetoCreate>({
    projeto_id: 0,
    fornecedor_id: 0,
    tecnico_responsavel_id: 0,
    status: 'Rascunho',
    data_pedido: new Date().toISOString().split('T')[0],
    previsao_entrega: '',
    prazo_entrega_dias: 0,
    condicao_pagamento: '',
    tipo_frete: 'CIF',
    valor_frete: 0,
    observacoes: '',
  });

  useEffect(() => {
    carregarDados();
    if (isEditMode) {
      carregarDespesa();
    }
  }, [id]);

  const carregarDados = async () => {
    try {
      const [projetos, fornecedoresRes, funcionarios] = await Promise.all([
        projetoService.listarTodos(),
        pessoaJuridicaService.listar(),
        funcionarioService.listarTodos(),
      ]);

      setProjetos(projetos);
      // Filtra apenas fornecedores
      setFornecedores(fornecedoresRes.data.filter((p: PessoaJuridica) => p.tipo === 'Fornecedor'));
      setFuncionarios(funcionarios);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      alert('Erro ao carregar dados necessários.');
    }
  };

  const carregarDespesa = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await despesaProjetoService.obter(Number(id));
      const despesa = response.data;
      
      setFormData({
        projeto_id: despesa.projeto_id,
        fornecedor_id: despesa.fornecedor_id,
        tecnico_responsavel_id: despesa.tecnico_responsavel_id,
        status: despesa.status,
        data_pedido: despesa.data_pedido,
        previsao_entrega: despesa.previsao_entrega || '',
        prazo_entrega_dias: despesa.prazo_entrega_dias || 0,
        condicao_pagamento: despesa.condicao_pagamento || '',
        tipo_frete: despesa.tipo_frete || 'CIF',
        valor_frete: despesa.valor_frete,
        observacoes: despesa.observacoes || '',
      });
    } catch (err) {
      console.error('Erro ao carregar despesa:', err);
      alert('Erro ao carregar despesa.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.projeto_id || !formData.fornecedor_id || !formData.tecnico_responsavel_id) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Limpa campos vazios antes de enviar
    const dadosLimpos = {
      ...formData,
      previsao_entrega: formData.previsao_entrega || undefined,
      prazo_entrega_dias: formData.prazo_entrega_dias || undefined,
      condicao_pagamento: formData.condicao_pagamento || undefined,
      tipo_frete: formData.tipo_frete || undefined,
      observacoes: formData.observacoes || undefined,
    };

    console.log('[DEBUG] Dados a serem enviados:', dadosLimpos);

    try {
      setLoading(true);
      if (isEditMode) {
        await despesaProjetoService.atualizar(Number(id), dadosLimpos);
        alert('Despesa atualizada com sucesso!');
      } else {
        await despesaProjetoService.criar(dadosLimpos);
        alert('Despesa criada com sucesso!');
      }
      navigate('/despesas-projetos');
    } catch (err: any) {
      console.error('Erro ao salvar despesa:', err);
      const errorMsg = err?.response?.data?.detail || 'Erro ao salvar despesa.';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let processedValue: any = value;
    
    if (name.includes('_id') || name === 'prazo_entrega_dias' || name === 'valor_frete') {
      // Campos numéricos
      processedValue = value === '' ? 0 : Number(value);
    } else if (name === 'previsao_entrega' || name === 'data_pedido') {
      // Campos de data
      processedValue = value || '';
    } else {
      // Campos de texto
      processedValue = value;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  return (
    <div>
      <div className="page-header">
        <h2>{isEditMode ? 'Editar' : 'Nova'} Despesa de Projeto</h2>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label required">Projeto</label>
                <select
                  name="projeto_id"
                  className="form-input"
                  value={formData.projeto_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione um projeto</option>
                  {projetos.map(projeto => (
                    <option key={projeto.id} value={projeto.id}>
                      {projeto.numero} - {projeto.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Fornecedor</label>
                <select
                  name="fornecedor_id"
                  className="form-input"
                  value={formData.fornecedor_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione um fornecedor</option>
                  {fornecedores.map(fornecedor => (
                    <option key={fornecedor.id} value={fornecedor.id}>
                      {fornecedor.razao_social}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Técnico Responsável</label>
                <select
                  name="tecnico_responsavel_id"
                  className="form-input"
                  value={formData.tecnico_responsavel_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione um técnico</option>
                  {funcionarios.map(funcionario => (
                    <option key={funcionario.id} value={funcionario.id}>
                      {funcionario.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Status</label>
                <select
                  name="status"
                  className="form-input"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Rascunho">Rascunho</option>
                  <option value="Enviado">Enviado</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Parcialmente Entregue">Parcialmente Entregue</option>
                  <option value="Entregue">Entregue</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Data do Pedido</label>
                <input
                  type="date"
                  name="data_pedido"
                  className="form-input"
                  value={formData.data_pedido}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Previsão de Entrega</label>
                <input
                  type="date"
                  name="previsao_entrega"
                  className="form-input"
                  value={formData.previsao_entrega}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prazo de Entrega (dias)</label>
                <input
                  type="number"
                  name="prazo_entrega_dias"
                  className="form-input"
                  value={formData.prazo_entrega_dias}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Condição de Pagamento</label>
                <input
                  type="text"
                  name="condicao_pagamento"
                  className="form-input"
                  placeholder="Ex: 30/60/90 dias"
                  value={formData.condicao_pagamento}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tipo de Frete</label>
                <select
                  name="tipo_frete"
                  className="form-input"
                  value={formData.tipo_frete}
                  onChange={handleChange}
                >
                  <option value="">Selecione</option>
                  <option value="CIF">CIF (Vendedor Paga)</option>
                  <option value="FOB">FOB (Comprador Paga)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Valor do Frete (R$)</label>
                <input
                  type="number"
                  name="valor_frete"
                  className="form-input"
                  value={formData.valor_frete}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Observações</label>
                <textarea
                  name="observacoes"
                  className="form-input"
                  rows={4}
                  value={formData.observacoes}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/despesas-projetos')}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DespesaProjetoForm;
