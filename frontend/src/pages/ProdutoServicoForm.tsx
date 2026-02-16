import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import produtoServicoService, { ProdutoServico, ProdutoServicoFornecedor } from '../services/produtoServicoService';
import { pessoaJuridicaService, PessoaJuridica } from '../services/pessoaJuridicaService';

interface FormData {
  codigo_interno: string;
  tipo: string;
  unidade_medida: string;
  descricao: string;
  codigo_fabricante: string;
  nome_fabricante: string;
  preco_unitario: number;
  ncm_lcp: string;
  fornecedores: ProdutoServicoFornecedor[];
}

const unidadeOptions = ['UN', 'PÇ', 'CX', 'KG', 'M', 'M²', 'M³', 'L', 'HR', 'SERV', 'KIT', 'PAR'];
const tipoOptions = ['Produto', 'Serviço'];

const calcularPrecoComImpostos = (precoUnitario: number, icms: number, ipi: number, pis: number, cofins: number, iss: number) => {
  // No Brasil, para compras de fornecedores:
  // - ICMS, PIS, COFINS, ISS são "por dentro" (já embutidos no preço do fornecedor)
  // - IPI é "por fora" (adicionado ao preço)
  // Portanto, o preço com impostos = Preço Base + IPI
  const precoBase = Number(precoUnitario) || 0;
  const ipiPercent = Number(ipi) || 0;
  const ipiValor = ipiPercent / 100;
  const precoComImpostos = precoBase * (1 + ipiValor);
  return precoComImpostos;
};

const formatCurrency = (value: number) => {
  if (Number.isNaN(value)) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

// Funções para lidar com números no formato brasileiro (vírgula como decimal)
const parseNumberBR = (value: string): number => {
  if (!value || value.trim() === '') return 0;
  // Remove espaços e substitui vírgula por ponto
  const normalized = value.trim().replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
};

const formatNumberBR = (value: number): string => {
  if (isNaN(value)) return '0';
  return value.toString().replace('.', ',');
};

const ProdutoServicoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;

  const [fornecedores, setFornecedores] = useState<PessoaJuridica[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estados para os valores de display dos campos numéricos (mantém vírgula durante digitação)
  const [fornecedorDisplayValues, setFornecedorDisplayValues] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    codigo_interno: '',
    tipo: 'Produto',
    unidade_medida: 'UN',
    descricao: '',
    codigo_fabricante: '',
    nome_fabricante: '',
    preco_unitario: 0,
    ncm_lcp: '',
    fornecedores: [],
  });

  // Calcular preço médio dos fornecedores
  const calcularPrecoMedio = () => {
    if (formData.fornecedores.length === 0) return 0;
    const total = formData.fornecedores.reduce((sum, forn) => sum + (Number(forn.preco_unitario) || 0), 0);
    return total / formData.fornecedores.length;
  };

  const precoMedio = calcularPrecoMedio();

  const carregarFornecedores = async () => {
    try {
      const response = await pessoaJuridicaService.listar();
      const lista = response.data.filter(p => p.tipo === 'Fornecedor');
      setFornecedores(lista);
    } catch (err) {
      console.error('Erro ao carregar fornecedores:', err);
    }
  };

  const carregarProduto = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await produtoServicoService.obter(parseInt(id));
      const produto = response.data as ProdutoServico;
      setFormData({
        codigo_interno: produto.codigo_interno,
        tipo: produto.tipo,
        unidade_medida: produto.unidade_medida,
        descricao: produto.descricao,
        codigo_fabricante: produto.codigo_fabricante || '',
        nome_fabricante: produto.nome_fabricante || '',
        preco_unitario: produto.preco_unitario || 0,
        ncm_lcp: produto.ncm_lcp || '',
        fornecedores: produto.fornecedores || [],
      });
      
      // Definir valores de display dos fornecedores
      const displayVals: Record<string, string> = {};
      (produto.fornecedores || []).forEach((forn, idx) => {
        displayVals[`${idx}.preco_unitario`] = formatNumberBR(forn.preco_unitario || 0);
        displayVals[`${idx}.icms`] = formatNumberBR(forn.icms || 0);
        displayVals[`${idx}.ipi`] = formatNumberBR(forn.ipi || 0);
        displayVals[`${idx}.pis`] = formatNumberBR(forn.pis || 0);
        displayVals[`${idx}.cofins`] = formatNumberBR(forn.cofins || 0);
        displayVals[`${idx}.iss`] = formatNumberBR(forn.iss || 0);
      });
      setFornecedorDisplayValues(displayVals);
    } catch (err) {
      console.error('Erro ao carregar produto/serviço:', err);
      alert('Erro ao carregar produto/serviço');
      navigate('/produtos-servicos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFornecedores();
    if (isEditMode) {
      carregarProduto();
    }
  }, [id]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.tipo) newErrors.tipo = 'Tipo é obrigatório';
    if (!formData.unidade_medida) newErrors.unidade_medida = 'Unidade de Medida é obrigatória';
    if (!formData.descricao.trim()) newErrors.descricao = 'Descrição é obrigatória';

    formData.fornecedores.forEach((fornecedor, index) => {
      if (!fornecedor.fornecedor_id) {
        newErrors[`fornecedores.${index}.fornecedor_id`] = 'Fornecedor é obrigatório';
      }
      if (!fornecedor.codigo_fornecedor?.trim()) {
        newErrors[`fornecedores.${index}.codigo_fornecedor`] = 'Código no Fornecedor é obrigatório';
      }
      if (!fornecedor.preco_unitario || fornecedor.preco_unitario <= 0) {
        newErrors[`fornecedores.${index}.preco_unitario`] = 'Preço Unitário deve ser maior que zero';
      }
      if (!fornecedor.prazo_entrega_dias || fornecedor.prazo_entrega_dias <= 0) {
        newErrors[`fornecedores.${index}.prazo_entrega_dias`] = 'Prazo de Entrega deve ser maior que zero';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleFornecedorChange = (
    index: number,
    field: keyof ProdutoServicoFornecedor,
    value: string
  ) => {
    let processedValue: any = value;
    if (field === 'fornecedor_id' || field === 'prazo_entrega_dias') {
      processedValue = parseInt(value) || 0;
    }
    if (
      field === 'preco_unitario' ||
      field === 'icms' ||
      field === 'ipi' ||
      field === 'pis' ||
      field === 'cofins' ||
      field === 'iss'
    ) {
      // Atualizar valor de display
      setFornecedorDisplayValues(prev => ({
        ...prev,
        [`${index}.${field}`]: value,
      }));
      processedValue = parseNumberBR(value);
    }

    setFormData(prev => {
      const updated = [...prev.fornecedores];
      updated[index] = {
        ...updated[index],
        [field]: processedValue,
      };
      return { ...prev, fornecedores: updated };
    });

    const errorKey = `fornecedores.${index}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: '',
      }));
    }
  };

  const addFornecedor = () => {
    const newIndex = formData.fornecedores.length;
    
    // Inicializar valores de display para o novo fornecedor
    setFornecedorDisplayValues(prev => ({
      ...prev,
      [`${newIndex}.preco_unitario`]: '',
      [`${newIndex}.icms`]: '',
      [`${newIndex}.ipi`]: '',
      [`${newIndex}.pis`]: '',
      [`${newIndex}.cofins`]: '',
      [`${newIndex}.iss`]: '',
    }));
    
    setFormData(prev => ({
      ...prev,
      fornecedores: [
        ...prev.fornecedores,
        {
          fornecedor_id: 0,
          codigo_fornecedor: '',
          preco_unitario: 0,
          prazo_entrega_dias: 0,
          icms: 0,
          ipi: 0,
          pis: 0,
          cofins: 0,
          iss: 0,
        },
      ],
    }));
  };

  const removeFornecedor = (index: number) => {
    // Remover valores de display do fornecedor
    setFornecedorDisplayValues(prev => {
      const updated = { ...prev };
      delete updated[`${index}.preco_unitario`];
      delete updated[`${index}.icms`];
      delete updated[`${index}.ipi`];
      delete updated[`${index}.pis`];
      delete updated[`${index}.cofins`];
      delete updated[`${index}.iss`];
      
      // Reindexar os fornecedores seguintes
      const reindexed: Record<string, string> = {};
      Object.keys(updated).forEach(key => {
        const [idx, field] = key.split('.');
        const currentIdx = parseInt(idx);
        if (currentIdx > index) {
          reindexed[`${currentIdx - 1}.${field}`] = updated[key];
        } else {
          reindexed[key] = updated[key];
        }
      });
      return reindexed;
    });
    
    setFormData(prev => ({
      ...prev,
      fornecedores: prev.fornecedores.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const payload = {
        tipo: formData.tipo,
        unidade_medida: formData.unidade_medida,
        descricao: formData.descricao,
        codigo_fabricante: formData.codigo_fabricante || undefined,
        nome_fabricante: formData.nome_fabricante || undefined,
        preco_unitario: precoMedio,
        ncm_lcp: formData.ncm_lcp || undefined,
        fornecedores: formData.fornecedores,
      };

      if (isEditMode && id) {
        await produtoServicoService.atualizar(parseInt(id), payload);
      } else {
        await produtoServicoService.criar(payload);
      }
      navigate('/produtos-servicos');
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar produto/serviço');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="page-header">
        <h2>{isEditMode ? 'Editar Produto/Serviço' : 'Novo Produto/Serviço'}</h2>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Row 1: Código Interno, Tipo, Unidade de Medida (3 colunas) */}
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="form-group">
                <label>Código Interno</label>
                <input
                  type="text"
                  name="codigo_interno"
                  className="form-input"
                  value={formData.codigo_interno || 'Gerado automaticamente'}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Tipo *</label>
                <select
                  name="tipo"
                  className={`form-input ${errors.tipo ? 'input-error' : ''}`}
                  value={formData.tipo}
                  onChange={handleChange}
                >
                  {tipoOptions.map(tipo => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
                {errors.tipo && <span className="error-message">{errors.tipo}</span>}
              </div>

              <div className="form-group">
                <label>Unidade de Medida *</label>
                <select
                  name="unidade_medida"
                  className={`form-input ${errors.unidade_medida ? 'input-error' : ''}`}
                  value={formData.unidade_medida}
                  onChange={handleChange}
                >
                  {unidadeOptions.map(unidade => (
                    <option key={unidade} value={unidade}>
                      {unidade}
                    </option>
                  ))}
                </select>
                {errors.unidade_medida && (
                  <span className="error-message">{errors.unidade_medida}</span>
                )}
              </div>
            </div>

            {/* Row 2: Descrição (full width) */}
            <div className="form-group">
              <label>Descrição *</label>
              <input
                type="text"
                name="descricao"
                className={`form-input ${errors.descricao ? 'input-error' : ''}`}
                value={formData.descricao}
                onChange={handleChange}
              />
              {errors.descricao && <span className="error-message">{errors.descricao}</span>}
            </div>

            {/* Row 3: Código Fabricante, Nome Fabricante, NCM/LCP (3 colunas) */}
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="form-group">
                <label>Código do Fabricante</label>
                <input
                  type="text"
                  name="codigo_fabricante"
                  className="form-input"
                  value={formData.codigo_fabricante}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Nome do Fabricante</label>
                <input
                  type="text"
                  name="nome_fabricante"
                  className="form-input"
                  value={formData.nome_fabricante}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>NCM / LCP</label>
                <input
                  type="text"
                  name="ncm_lcp"
                  className="form-input"
                  placeholder="Ex: 12345678/123"
                  value={formData.ncm_lcp}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Preço Unitário Médio */}
            <div className="form-group">
              <label>Preço Unitário Médio (R$)</label>
              <input
                type="text"
                className="form-input"
                value={precoMedio > 0 ? formatCurrency(precoMedio) : 'Calculado automaticamente'}
                disabled
                style={{ background: '#e9ecef', cursor: 'not-allowed' }}
              />
              <small style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                Média calculada automaticamente dos preços dos fornecedores
              </small>
            </div>

            <div className="form-group">
              <div className="section-header">
                <h3>Fornecedores</h3>
                <button type="button" className="btn btn-secondary" onClick={addFornecedor}>
                  Adicionar Fornecedor
                </button>
              </div>

              {formData.fornecedores.length === 0 && (
                <p className="empty-state">Nenhum fornecedor adicionado.</p>
              )}

              {formData.fornecedores.map((fornecedor, index) => {
                const fornecedorSelecionado = fornecedores.find(f => f.id === Number(fornecedor.fornecedor_id));
                const nomeFornecedor = fornecedorSelecionado 
                  ? (fornecedorSelecionado.nome_fantasia || fornecedorSelecionado.razao_social)
                  : `Fornecedor #${index + 1}`;
                
                return (
                <div key={index} className="card nested-card" style={{ marginBottom: '1.5rem' }}>
                  <div className="card-header" style={{ 
                    background: '#f8f9fc', 
                    borderBottom: '1px solid #e3e6f0',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#5a5c69' }}>
                      {nomeFornecedor}
                    </h4>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => removeFornecedor(index)}
                      title="Remover fornecedor"
                    >
                      Remover
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Fornecedor *</label>
                        <select
                          className={`form-input ${
                            errors[`fornecedores.${index}.fornecedor_id`] ? 'input-error' : ''
                          }`}
                          value={fornecedor.fornecedor_id}
                          onChange={e => handleFornecedorChange(index, 'fornecedor_id', e.target.value)}
                        >
                          <option value="">Selecione</option>
                          {fornecedores.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.nome_fantasia || item.razao_social}
                            </option>
                          ))}
                        </select>
                        {errors[`fornecedores.${index}.fornecedor_id`] && (
                          <span className="error-message">
                            {errors[`fornecedores.${index}.fornecedor_id`]}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Código no Fornecedor *</label>
                        <input
                          type="text"
                          className={`form-input ${
                            errors[`fornecedores.${index}.codigo_fornecedor`] ? 'input-error' : ''
                          }`}
                          value={fornecedor.codigo_fornecedor}
                          onChange={e => handleFornecedorChange(index, 'codigo_fornecedor', e.target.value)}
                        />
                        {errors[`fornecedores.${index}.codigo_fornecedor`] && (
                          <span className="error-message">
                            {errors[`fornecedores.${index}.codigo_fornecedor`]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>Preço Unitário *</label>
                        <input
                          type="text"
                          className={`form-input ${
                            errors[`fornecedores.${index}.preco_unitario`] ? 'input-error' : ''
                          }`}
                          value={fornecedorDisplayValues[`${index}.preco_unitario`] || ''}
                          onChange={e => handleFornecedorChange(index, 'preco_unitario', e.target.value)}
                          placeholder="0,00"
                        />
                        {errors[`fornecedores.${index}.preco_unitario`] && (
                          <span className="error-message">
                            {errors[`fornecedores.${index}.preco_unitario`]}
                          </span>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Prazo de Entrega (dias) *</label>
                        <input
                          type="number"
                          className={`form-input ${
                            errors[`fornecedores.${index}.prazo_entrega_dias`] ? 'input-error' : ''
                          }`}
                          value={fornecedor.prazo_entrega_dias}
                          onChange={e => handleFornecedorChange(index, 'prazo_entrega_dias', e.target.value)}
                          min="0"
                        />
                        {errors[`fornecedores.${index}.prazo_entrega_dias`] && (
                          <span className="error-message">
                            {errors[`fornecedores.${index}.prazo_entrega_dias`]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                      <div className="form-group">
                        <label>ICMS (%)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={fornecedorDisplayValues[`${index}.icms`] || ''}
                          onChange={e => handleFornecedorChange(index, 'icms', e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                      <div className="form-group">
                        <label>IPI (%)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={fornecedorDisplayValues[`${index}.ipi`] || ''}
                          onChange={e => handleFornecedorChange(index, 'ipi', e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                      <div className="form-group">
                        <label>PIS (%)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={fornecedorDisplayValues[`${index}.pis`] || ''}
                          onChange={e => handleFornecedorChange(index, 'pis', e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                      <div className="form-group">
                        <label>COFINS (%)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={fornecedorDisplayValues[`${index}.cofins`] || ''}
                          onChange={e => handleFornecedorChange(index, 'cofins', e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                      <div className="form-group">
                        <label>ISS (%)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={fornecedorDisplayValues[`${index}.iss`] || ''}
                          onChange={e => handleFornecedorChange(index, 'iss', e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                    </div>

                    {fornecedor.preco_unitario > 0 && (
                      <div style={{ 
                        marginTop: '1rem', 
                        padding: '0.75rem', 
                        background: '#f0f9ff', 
                        borderLeft: '4px solid #3b82f6',
                        borderRadius: '0.25rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 600, color: '#1e40af' }}>Preço com IPI (por fora):</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e74a3b' }}>
                            {formatCurrency(calcularPrecoComImpostos(
                              fornecedor.preco_unitario,
                              fornecedor.icms,
                              fornecedor.ipi,
                              fornecedor.pis,
                              fornecedor.cofins,
                              fornecedor.iss
                            ))}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                          IPI adicionado: {(Number(fornecedor.ipi) || 0).toFixed(2)}% • ICMS, PIS, COFINS, ISS já inclusos no preço base
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          <strong>Impostos por dentro:</strong> ICMS {formatCurrency(Number(fornecedor.preco_unitario) * ((Number(fornecedor.icms) || 0) / 100))} • 
                          PIS {formatCurrency(Number(fornecedor.preco_unitario) * ((Number(fornecedor.pis) || 0) / 100))} • 
                          COFINS {formatCurrency(Number(fornecedor.preco_unitario) * ((Number(fornecedor.cofins) || 0) / 100))} • 
                          ISS {formatCurrency(Number(fornecedor.preco_unitario) * ((Number(fornecedor.iss) || 0) / 100))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Salvando...' : isEditMode ? 'Atualizar' : 'Criar'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/produtos-servicos')}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProdutoServicoForm;
