import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import projetoService from '../services/projetoService';
import funcionarioService from '../services/funcionarioService';
import InputMask from 'react-input-mask';

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

  // Gerar data padrão para novo projeto
  const getDataPadrao = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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
    data_pedido_compra: !isEditMode ? getDataPadrao() : '',
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
      setFormData(projeto);
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let processedValue: any = value;
    if (name === 'valor_orcado' || name === 'valor_venda') {
      processedValue = parseFloat(value) || 0;
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
      if (isEditMode && id) {
        await projetoService.atualizar(parseInt(id), formData);
        alert('Projeto atualizado com sucesso!');
      } else {
        await projetoService.criar(formData);
        alert('Projeto criado com sucesso!');
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
                <label>Valor Orçado (R$)</label>
                <input
                  type="number"
                  name="valor_orcado"
                  placeholder="0,00"
                  className="form-input"
                  value={formData.valor_orcado}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Valor de Venda (R$)</label>
                <input
                  type="number"
                  name="valor_venda"
                  placeholder="0,00"
                  className="form-input"
                  value={formData.valor_venda}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Prazo de Entrega (dias)</label>
                <input
                  type="number"
                  name="prazo_entrega_dias"
                  placeholder="0"
                  className="form-input"
                  value={formData.prazo_entrega_dias}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Data do Pedido de Compra</label>
              <input
                type="datetime-local"
                name="data_pedido_compra"
                className="form-input"
                value={formData.data_pedido_compra ? formData.data_pedido_compra.slice(0, 16) : ''}
                onChange={handleChange}
              />
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
