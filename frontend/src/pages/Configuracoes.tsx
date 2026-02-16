import React, { useEffect, useState } from 'react';
import templatesService, { TemplatesResponse } from '../services/templatesService';

const Configuracoes: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [status, setStatus] = useState<TemplatesResponse | null>(null);

  const [files, setFiles] = useState({
    proposta_completa: null as File | null,
    proposta_simplificada: null as File | null,
    relatorio_visita: null as File | null,
    planilha_proposta: null as File | null,
  });

  useEffect(() => {
    carregarStatus();
  }, []);

  const carregarStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await templatesService.listar();
      setStatus(data);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Erro ao carregar status dos templates';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (key: keyof typeof files, file: File | null) => {
    setFiles(prev => ({ ...prev, [key]: file }));
  };

  const handleUpload = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      (Object.keys(files) as (keyof typeof files)[]).forEach((key) => {
        const file = files[key];
        if (file) {
          formData.append(key, file);
        }
      });

      await templatesService.upload(formData);
      setSuccess('Templates atualizados com sucesso.');
      setFiles({
        proposta_completa: null,
        proposta_simplificada: null,
        relatorio_visita: null,
        planilha_proposta: null,
      });
      await carregarStatus();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Erro ao enviar templates';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const fileStatus = status?.files || {};
  const formatDateTime = (isoValue?: string | null) => {
    if (!isoValue) return 'N/A';
    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('pt-BR');
  };

  const handleDownload = async (key: keyof typeof fileStatus) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/templates/${key}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Erro ao baixar template');
      }
      const blob = await res.blob();
      const filename = fileStatus[key]?.filename || 'template';
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.message || 'Erro ao baixar template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="page-header">
        <h2>Configuracoes</h2>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card" style={{ padding: '1rem' }}>
        <h4>Templates de Documentos</h4>
        <p style={{ marginBottom: '1rem' }}>
          Carregue os arquivos padrao usados na criacao de projetos. Somente administradores.
        </p>
        {status?.path && (
          <p style={{ marginBottom: '1rem' }}>
            <strong>Diretorio base:</strong> {status.path}
          </p>
        )}

        <div className="form-grid single-column">
          <div className="form-group">
            <label>Proposta Completa</label>
            <input
              type="file"
              accept=".docx"
              onChange={(e) => handleFileChange('proposta_completa', e.target.files?.[0] || null)}
            />
            <small>
              {fileStatus.proposta_completa?.filename} - Status: {fileStatus.proposta_completa?.exists ? 'OK' : 'Nao encontrado'} | Atualizado: {formatDateTime(fileStatus.proposta_completa?.updated_at)}
            </small>
            {fileStatus.proposta_completa?.exists && (
              <button
                className="btn btn-link"
                type="button"
                onClick={() => handleDownload('proposta_completa')}
              >
                Baixar
              </button>
            )}
          </div>

          <div className="form-group">
            <label>Proposta Simplificada</label>
            <input
              type="file"
              accept=".docx"
              onChange={(e) => handleFileChange('proposta_simplificada', e.target.files?.[0] || null)}
            />
            <small>
              {fileStatus.proposta_simplificada?.filename} - Status: {fileStatus.proposta_simplificada?.exists ? 'OK' : 'Nao encontrado'} | Atualizado: {formatDateTime(fileStatus.proposta_simplificada?.updated_at)}
            </small>
            {fileStatus.proposta_simplificada?.exists && (
              <button
                className="btn btn-link"
                type="button"
                onClick={() => handleDownload('proposta_simplificada')}
              >
                Baixar
              </button>
            )}
          </div>

          <div className="form-group">
            <label>Relatorio de Visita</label>
            <input
              type="file"
              accept=".docx"
              onChange={(e) => handleFileChange('relatorio_visita', e.target.files?.[0] || null)}
            />
            <small>
              {fileStatus.relatorio_visita?.filename} - Status: {fileStatus.relatorio_visita?.exists ? 'OK' : 'Nao encontrado'} | Atualizado: {formatDateTime(fileStatus.relatorio_visita?.updated_at)}
            </small>
            {fileStatus.relatorio_visita?.exists && (
              <button
                className="btn btn-link"
                type="button"
                onClick={() => handleDownload('relatorio_visita')}
              >
                Baixar
              </button>
            )}
          </div>

          <div className="form-group">
            <label>Planilha Proposta</label>
            <input
              type="file"
              accept=".xlsm"
              onChange={(e) => handleFileChange('planilha_proposta', e.target.files?.[0] || null)}
            />
            <small>
              {fileStatus.planilha_proposta?.filename} - Status: {fileStatus.planilha_proposta?.exists ? 'OK' : 'Nao encontrado'} | Atualizado: {formatDateTime(fileStatus.planilha_proposta?.updated_at)}
            </small>
            {fileStatus.planilha_proposta?.exists && (
              <button
                className="btn btn-link"
                type="button"
                onClick={() => handleDownload('planilha_proposta')}
              >
                Baixar
              </button>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleUpload} disabled={loading}>
            {loading ? 'Enviando...' : 'Salvar Templates'}
          </button>
          <button className="btn btn-secondary" onClick={carregarStatus} disabled={loading}>
            Recarregar Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
