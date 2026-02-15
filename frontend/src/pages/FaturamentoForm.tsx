import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import projetoService from '../services/projetoService';
import funcionarioService from '../services/funcionarioService';
import faturamentoService from '../services/faturamentoService';

interface FaturamentoData {
  projeto_id: number;
  tecnico_id: number;
  valor_faturado: string;
  data_faturamento: string;
  observacoes: string;
}

const FaturamentoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;

  const [projetos, setProjetos] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FaturamentoData>({
    projeto_id: 0,
    tecnico_id: 0,
    valor_faturado: '',
    data_faturamento: '',
    observacoes: '',
  });

  useEffect(() => {
    carregarDadosIniciais();
    if (isEditMode) {
      carregarFaturamento();
    } else {
      setFormData(prev => ({ ...prev, data_faturamento: new Date().toISOString().slice(0, 10) }));
    }
  }, [id, isEditMode]);

  const carregarDadosIniciais = async () => {
    try {
      const [projs, tecs] = await Promise.all([
        projetoService.listarTodos(),
        funcionarioService.listarTecnicos(),
      ]);
      setProjetos(projs);
      setTecnicos(tecs);
    } catch (err) {
      console.error(err);
      alert("Falha ao carregar projetos e técnicos.");
    }
  };

  const carregarFaturamento = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const faturamento = await faturamentoService.obter(parseInt(id));
      
      let dataFormatada = '';
      if (faturamento.data_faturamento) {
        const date = new Date(faturamento.data_faturamento);
        if (!isNaN(date.getTime())) {
          dataFormatada = date.toISOString().slice(0, 10);
        }
      }

      setFormData({
        projeto_id: faturamento.projeto_id,
        tecnico_id: faturamento.tecnico_id,
        valor_faturado: faturamento.valor_faturado ? String(faturamento.valor_faturado).replace('.', ',') : '',
        data_faturamento: dataFormatada,
        observacoes: faturamento.observacoes || '',
      });
    } catch (err) {
      console.error('Erro ao carregar faturamento:', err);
      alert('Erro ao carregar o faturamento para edição.');
      navigate('/faturamentos');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.projeto_id) newErrors.projeto_id = 'Projeto é obrigatório';
    if (!formData.tecnico_id) newErrors.tecnico_id = 'Técnico é obrigatório';
    if (!formData.valor_faturado) newErrors.valor_faturado = 'Valor é obrigatório';
    if (!formData.data_faturamento) newErrors.data_faturamento = 'Data é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let processedValue: any = value;
    if (name === 'projeto_id' || name === 'tecnico_id') {
        processedValue = Number(value);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        valor_faturado: Number(formData.valor_faturado.replace(/\./g, '').replace(',', '.')) || 0,
        data_faturamento: new Date(formData.data_faturamento).toISOString(),
      };

      if (isEditMode && id) {
        await faturamentoService.atualizar(parseInt(id), payload);
      } else {
        await faturamentoService.criar(payload);
      }

      navigate('/faturamentos');
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      const message = err?.response?.data?.detail || err?.response?.data?.mensagem || err?.message || 'Erro ao salvar faturamento';
      alert(String(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="page-header">
        <h2>{isEditMode ? 'Editar Faturamento' : 'Novo Faturamento'}</h2>
      </div>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Projeto *</label>
                <select 
                    name="projeto_id"
                    className={`form-input ${errors.projeto_id ? 'input-error' : ''}`}
                    value={formData.projeto_id} 
                    onChange={handleChange} 
                    disabled={loading}
                >
                  <option value="">Selecione um projeto</option>
                  {projetos.map(p => <option key={p.id} value={p.id}>{p.numero} - {p.nome}</option>)}
                </select>
                {errors.projeto_id && <span className="error-message">{errors.projeto_id}</span>}
              </div>
              <div className="form-group">
                <label>Técnico *</label>
                <select 
                    name="tecnico_id"
                    className={`form-input ${errors.tecnico_id ? 'input-error' : ''}`}
                    value={formData.tecnico_id} 
                    onChange={handleChange} 
                    disabled={loading}
                >
                  <option value="">Selecione um técnico</option>
                  {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
                {errors.tecnico_id && <span className="error-message">{errors.tecnico_id}</span>}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Valor Faturado *</label>
                <input 
                    name="valor_faturado"
                    className={`form-input ${errors.valor_faturado ? 'input-error' : ''}`}
                    value={formData.valor_faturado} 
                    onChange={handleChange} 
                    placeholder="0,00" 
                    disabled={loading} 
                />
                {errors.valor_faturado && <span className="error-message">{errors.valor_faturado}</span>}
              </div>
              <div className="form-group">
                <label>Data de Faturamento *</label>
                <input 
                    type="date" 
                    name="data_faturamento"
                    className={`form-input ${errors.data_faturamento ? 'input-error' : ''}`}
                    value={formData.data_faturamento} 
                    onChange={handleChange} 
                    disabled={loading} 
                />
                {errors.data_faturamento && <span className="error-message">{errors.data_faturamento}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Observações</label>
              <textarea 
                name="observacoes"
                className="form-input"
                style={{ minHeight: 120 }} 
                value={formData.observacoes} 
                onChange={handleChange} 
                disabled={loading} 
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Salvando...' : isEditMode ? 'Atualizar' : 'Salvar'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/faturamentos')}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FaturamentoForm;