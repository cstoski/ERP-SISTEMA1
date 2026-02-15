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
  ncm: string;
  lcp: string;
  fornecedores: ProdutoServicoFornecedor[];
}

const unidadeOptions = ['UN', 'PÇ', 'CX', 'KG', 'M', 'M²', 'M³', 'L', 'HR', 'SERV', 'KIT', 'PAR'];
const tipoOptions = ['Produto', 'Serviço'];

const ProdutoServicoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;

  const [fornecedores, setFornecedores] = useState<PessoaJuridica[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    codigo_interno: '',
    tipo: 'Produto',
    unidade_medida: 'UN',
    descricao: '',
    codigo_fabricante: '',
    nome_fabricante: '',
    preco_unitario: 0,
    ncm: '',
    lcp: '',
    fornecedores: [],
  });

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
        ncm: produto.ncm || '',
        lcp: produto.lcp || '',
        fornecedores: produto.fornecedores || [],
      });
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
    let processedValue: any = value;

    if (name === 'preco_unitario') {
      processedValue = parseFloat(value) || 0;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
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
      processedValue = parseFloat(value) || 0;
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
        preco_unitario: formData.preco_unitario,
        ncm: formData.ncm || undefined,
        lcp: formData.lcp || undefined,
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
            <div className="form-grid">
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
            </div>

            <div className="form-grid">
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

              <div className="form-group">
                <label>Preço Unitário (R$)</label>
                <input
                  type="number"
                  name="preco_unitario"
                  className="form-input"
                  value={formData.preco_unitario}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

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

            <div className="form-grid">
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
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>NCM</label>
                <input
                  type="text"
                  name="ncm"
                  className="form-input"
                  value={formData.ncm}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>LCP</label>
                <input
                  type="text"
                  name="lcp"
                  className="form-input"
                  value={formData.lcp}
                  onChange={handleChange}
                />
              </div>
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

              {formData.fornecedores.map((fornecedor, index) => (
                <div key={index} className="card nested-card">
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
                          type="number"
                          className={`form-input ${
                            errors[`fornecedores.${index}.preco_unitario`] ? 'input-error' : ''
                          }`}
                          value={fornecedor.preco_unitario}
                          onChange={e => handleFornecedorChange(index, 'preco_unitario', e.target.value)}
                          step="0.01"
                          min="0"
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

                    <div className="form-grid">
                      <div className="form-group">
                        <label>ICMS (%)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={fornecedor.icms}
                          onChange={e => handleFornecedorChange(index, 'icms', e.target.value)}
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>IPI (%)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={fornecedor.ipi}
                          onChange={e => handleFornecedorChange(index, 'ipi', e.target.value)}
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>PIS (%)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={fornecedor.pis}
                          onChange={e => handleFornecedorChange(index, 'pis', e.target.value)}
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>COFINS (%)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={fornecedor.cofins}
                          onChange={e => handleFornecedorChange(index, 'cofins', e.target.value)}
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>ISS (%)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={fornecedor.iss}
                          onChange={e => handleFornecedorChange(index, 'iss', e.target.value)}
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div className="form-group fornecedor-actions">
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => removeFornecedor(index)}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
