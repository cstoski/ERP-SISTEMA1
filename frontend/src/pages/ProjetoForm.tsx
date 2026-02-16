import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import projetoService from '../services/projetoService';
import funcionarioService from '../services/funcionarioService';

interface Cliente {
  id: number;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
}

interface Contato {
  id: number;
  nome: string;
  email: string;
  celular: string;
}

interface Tecnico {
  id: number;
  nome: string;
  departamento?: string;
  email?: string;
}

interface Projeto {
  numero: string;
  cliente_id: number;
  nome: string;
  contato_id: number;
  tecnico: string;
  valor_orcado: number;
  valor_venda: number;
  prazo_entrega_dias: number;
  data_pedido_compra?: string;
  status: string;
}

const statusOptions = [
  'Orçando',
  'Orçamento Enviado',
  'Declinado',
  'Em Execução',
  'Aguardando pedido de compra',
  'Teste de Viabilidade',
  'Concluído'
];

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

const ProjetoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [numeroAutomatico, setNumeroAutomatico] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Converter ISO para formato yyyy-MM-dd (input date)
  const formatDataPedidoCompra = (isoValue?: string): string => {
    if (!isoValue) return '';
    const parsed = new Date(isoValue);
    if (Number.isNaN(parsed.getTime())) return '';
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Converter yyyy-MM-dd para ISO datetime (para enviar ao backend)
  const normalizeDataPedidoCompra = (value?: string): string | undefined => {
    if (!value || value === '') return undefined;
    // value já está no formato yyyy-MM-dd do input date
    return `${value}T00:00:00`;
  };

  const [formData, setFormData] = useState<Projeto>({
    numero: '',
    cliente_id: 0,
    nome: '',
    contato_id: 0,
    tecnico: '',
    valor_orcado: 0,
    valor_venda: 0,
    prazo_entrega_dias: 0,
    data_pedido_compra: '',
    status: 'Orçando',
  });

  useEffect(() => {
    carregarEmpresas();
    carregarTecnicos();
    obterProximoNumero();
    if (isEditMode) {
      carregarProjeto();
    }
  }, [id]);

  useEffect(() => {
    if (formData.cliente_id) {
      carregarContatos();
    }
  }, [formData.cliente_id]);

  const carregarEmpresas = async () => {
    try {
      const data = await projetoService.listarClientes();
      setClientes(data);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    }
  };

  const carregarTecnicos = async () => {
    try {
      const data = await funcionarioService.listarTecnicos();
      setTecnicos(data);
    } catch (err) {
      console.error('Erro ao carregar técnicos:', err);
    }
  };

  const carregarContatos = async () => {
    try {
      const data = await projetoService.listarContatosCliente(formData.cliente_id);
      setContatos(data);
    } catch (err) {
      console.error('Erro ao carregar contatos:', err);
    }
  };

  const obterProximoNumero = async () => {
    try {
      const data = await projetoService.obterProximoNumero();
      setNumeroAutomatico(data.numero);
      if (!isEditMode) {
        setFormData(prev => ({ ...prev, numero: data.numero }));
      }
    } catch (err) {
      console.error('Erro ao obter número:', err);
    }
  };

  const carregarProjeto = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const projeto = await projetoService.obter(parseInt(id));
      setFormData({
        ...projeto,
        data_pedido_compra: formatDataPedidoCompra(projeto.data_pedido_compra),
      });
    } catch (err) {
      console.error('Erro ao carregar projeto:', err);
      alert('Erro ao carregar projeto');
      navigate('/projetos');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.numero.trim()) newErrors.numero = 'Número é obrigatório';
    if (!formData.cliente_id) newErrors.cliente_id = 'Cliente é obrigatório';
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.contato_id) newErrors.contato_id = 'Contato é obrigatório';
    if (!formData.tecnico.trim()) newErrors.tecnico = 'Técnico é obrigatório';
    if (!formData.status) newErrors.status = 'Status é obrigatório';

    if (isEditMode && formData.status === 'Em Execução') {
      if (!formData.valor_orcado || formData.valor_orcado <= 0) {
        newErrors.valor_orcado = 'Valor Orçado é obrigatório e deve ser maior que zero';
      }
      if (!formData.valor_venda || formData.valor_venda <= 0) {
        newErrors.valor_venda = 'Valor de Venda é obrigatório e deve ser maior que zero';
      }
      if (!formData.prazo_entrega_dias || formData.prazo_entrega_dias <= 0) {
        newErrors.prazo_entrega_dias = 'Prazo de Entrega é obrigatório e deve ser maior que zero';
      }
      if (!formData.data_pedido_compra) {
        newErrors.data_pedido_compra = 'Data do Pedido de Compra é obrigatória';
      }
    }
    
    // Data do pedido de compra é opcional, validação básica é feita pelo input date

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let processedValue: any = value;
    if (name === 'valor_orcado' || name === 'valor_venda') {
      processedValue = parseNumberBR(value);
    } else if (name === 'cliente_id' || name === 'contato_id' || name === 'prazo_entrega_dias') {
      processedValue = parseInt(value) || 0;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));

    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Enviar apenas campos válidos, excluindo metadados
      const payload: any = {
        numero: formData.numero,
        cliente_id: formData.cliente_id,
        nome: formData.nome,
        contato_id: formData.contato_id,
        tecnico: formData.tecnico,
        valor_orcado: formData.valor_orcado,
        valor_venda: formData.valor_venda,
        prazo_entrega_dias: formData.prazo_entrega_dias,
        status: formData.status,
      };
      
      const dataNormalizada = normalizeDataPedidoCompra(formData.data_pedido_compra);
      if (dataNormalizada) {
        payload.data_pedido_compra = dataNormalizada;
      }

      if (isEditMode && id) {
        await projetoService.atualizar(parseInt(id), payload);
      } else {
        await projetoService.criar(payload);
      }
      navigate('/projetos');
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      const errorMsg = err.response?.data?.detail || 'Erro ao salvar projeto';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="page-header">
        <h2>{isEditMode ? 'Editar Projeto' : 'Novo Projeto'}</h2>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {isEditMode && formData.status === 'Em Execução' &&
              (errors.valor_orcado ||
                errors.valor_venda ||
                errors.prazo_entrega_dias ||
                errors.data_pedido_compra) && (
                <div className="alert alert-warning">
                  Para salvar em "Em Execução", informe Valor Orçado, Valor de Venda,
                  Prazo de Entrega e Data do Pedido de Compra.
                </div>
              )}
            <div className="form-grid">
              <div className="form-group">
                <label>Número do Projeto *</label>
                <div className="numero-group">
                  <input
                    type="text"
                    name="numero"
                    placeholder="Automático ou manual"
                    className={`form-input ${errors.numero ? 'input-error' : ''}`}
                    value={formData.numero}
                    onChange={handleChange}
                  />
                  {!isEditMode && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setFormData(prev => ({ ...prev, numero: numeroAutomatico }))}
                      title="Usar número automático"
                    >
                      Auto
                    </button>
                  )}
                </div>
                {errors.numero && <span className="error-message">{errors.numero}</span>}
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  name="status"
                  className={`form-input ${errors.status ? 'input-error' : ''}`}
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="">Selecione um status</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                {errors.status && <span className="error-message">{errors.status}</span>}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Cliente *</label>
                <select
                  name="cliente_id"
                  className={`form-input ${errors.cliente_id ? 'input-error' : ''}`}
                  value={formData.cliente_id}
                  onChange={handleChange}
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.razao_social}
                    </option>
                  ))}
                </select>
                {errors.cliente_id && <span className="error-message">{errors.cliente_id}</span>}
              </div>

              <div className="form-group">
                <label>Contato *</label>
                <select
                  name="contato_id"
                  className={`form-input ${errors.contato_id ? 'input-error' : ''}`}
                  value={formData.contato_id}
                  onChange={handleChange}
                  disabled={!formData.cliente_id}
                >
                  <option value="">Selecione um contato</option>
                  {contatos.map(contato => (
                    <option key={contato.id} value={contato.id}>
                      {contato.nome}
                    </option>
                  ))}
                </select>
                {errors.contato_id && <span className="error-message">{errors.contato_id}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Nome do Projeto *</label>
              <input
                type="text"
                name="nome"
                placeholder="Digite o nome do projeto"
                className={`form-input ${errors.nome ? 'input-error' : ''}`}
                value={formData.nome}
                onChange={handleChange}
              />
              {errors.nome && <span className="error-message">{errors.nome}</span>}
            </div>

            <div className="form-group">
              <label>Técnico *</label>
              <select
                name="tecnico"
                className={`form-input ${errors.tecnico ? 'input-error' : ''}`}
                value={formData.tecnico}
                onChange={handleChange}
              >
                <option value="">Selecione um técnico</option>
                {tecnicos.map(tecnico => (
                  <option key={tecnico.id} value={tecnico.nome}>
                    {tecnico.nome}
                  </option>
                ))}
              </select>
              {errors.tecnico && <span className="error-message">{errors.tecnico}</span>}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>
                  Valor Orçado (R$)
                  {isEditMode && formData.status === 'Em Execução' && ' *'}
                </label>
                <input
                  type="text"
                  name="valor_orcado"
                  placeholder="0,00"
                  className={`form-input ${errors.valor_orcado ? 'input-error' : ''}`}
                  value={formData.valor_orcado === 0 ? '' : formatNumberBR(formData.valor_orcado)}
                  onChange={handleChange}
                />
                {errors.valor_orcado && <span className="error-message">{errors.valor_orcado}</span>}
              </div>

              <div className="form-group">
                <label>
                  Valor de Venda (R$)
                  {isEditMode && formData.status === 'Em Execução' && ' *'}
                </label>
                <input
                  type="text"
                  name="valor_venda"
                  placeholder="0,00"
                  className={`form-input ${errors.valor_venda ? 'input-error' : ''}`}
                  value={formData.valor_venda === 0 ? '' : formatNumberBR(formData.valor_venda)}
                  onChange={handleChange}
                />
                {errors.valor_venda && <span className="error-message">{errors.valor_venda}</span>}
              </div>

              <div className="form-group">
                <label>
                  Prazo de Entrega (dias)
                  {isEditMode && formData.status === 'Em Execução' && ' *'}
                </label>
                <input
                  type="number"
                  name="prazo_entrega_dias"
                  placeholder="0"
                  className={`form-input ${errors.prazo_entrega_dias ? 'input-error' : ''}`}
                  value={formData.prazo_entrega_dias}
                  onChange={handleChange}
                  min="0"
                />
                {errors.prazo_entrega_dias && (
                  <span className="error-message">{errors.prazo_entrega_dias}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>
                Data do Pedido de Compra
                {isEditMode && formData.status === 'Em Execução' && ' *'}
              </label>
              <input
                type="date"
                name="data_pedido_compra"
                className={`form-input ${errors.data_pedido_compra ? 'input-error' : ''}`}
                value={formData.data_pedido_compra || ''}
                onChange={handleChange}
              />
              {errors.data_pedido_compra && (
                <span className="error-message">{errors.data_pedido_compra}</span>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Salvando...' : isEditMode ? 'Atualizar' : 'Criar'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/projetos')}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjetoForm;
