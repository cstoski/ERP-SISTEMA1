import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import produtoServicoService, { ProdutoServico, ProdutoServicoFornecedor, ProdutoServicoHistoricoPreco } from '../services/produtoServicoService';
import Modal from '../components/Modal';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const formatCurrency = (value: number) => {
  if (Number.isNaN(value)) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const formatPercent = (value: number) => {
  if (value === null || value === undefined || isNaN(value)) return '0.00%';
  return `${Number(value).toFixed(2)}%`;
};

const calcularPrecoComImpostos = (precoUnitario: number, _icms: number, ipi: number, _pis: number, _cofins: number, _iss: number) => {
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

const calcularDetalhamentoImpostos = (precoUnitario: number, icms: number, ipi: number, pis: number, cofins: number, iss: number) => {
  // Garantir que todos os valores são números
  const precoBase = Number(precoUnitario) || 0;
  const icmsPercent = Number(icms) || 0;
  const ipiPercent = Number(ipi) || 0;
  const pisPercent = Number(pis) || 0;
  const cofinsPercent = Number(cofins) || 0;
  const issPercent = Number(iss) || 0;
  
  // IPI é "por fora" (adiciona ao preço base)
  const valorIPI = precoBase * (ipiPercent / 100);
  
  // Preço com IPI (base de cálculo para impostos por dentro caso sejam aplicados sobre o total)
  const precoComIPI = precoBase + valorIPI;
  
  // Impostos "por dentro" (já embutidos no preço) - calculados sobre o preço BASE do fornecedor
  const valorICMS = precoBase * (icmsPercent / 100);
  const valorPIS = precoBase * (pisPercent / 100);
  const valorCOFINS = precoBase * (cofinsPercent / 100);
  const valorISS = precoBase * (issPercent / 100);
  
  // Total de impostos por dentro
  const totalImpostosPorDentro = valorICMS + valorPIS + valorCOFINS + valorISS;
  
  // Valor líquido (preço sem os impostos embutidos)
  const valorLiquido = precoBase - totalImpostosPorDentro;
  
  // Preço final a pagar ao fornecedor
  const precoFinal = precoComIPI;
  
  return {
    precoBase: precoBase,
    valorLiquido,
    valorICMS,
    valorPIS,
    valorCOFINS,
    valorISS,
    totalImpostosPorDentro,
    valorIPI,
    precoFinal
  };
};

const ProdutoServicoDetalhes: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [produto, setProduto] = useState<ProdutoServico | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<ProdutoServicoFornecedor | null>(null);
  const [historicoPrecos, setHistoricoPrecos] = useState<ProdutoServicoHistoricoPreco[]>([]);
  const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState<boolean>(false);
  const [isGraficoModalOpen, setIsGraficoModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const carregar = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await produtoServicoService.obter(parseInt(id));
        setProduto(response.data);
        
        // Buscar histórico de preços
        try {
          const historicoResponse = await produtoServicoService.obterHistoricoPrecos(parseInt(id));
          console.log('Histórico de preços carregado:', historicoResponse.data);
          setHistoricoPrecos(historicoResponse.data);
        } catch (err) {
          console.log('Erro ao carregar histórico de preços:', err);
          setHistoricoPrecos([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar produto/serviço:', err);
        setError('Não foi possível carregar o produto/serviço.');
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [id]);

  if (loading) {
    return (
      <div className="form-container">
        <p>Carregando...</p>
      </div>
    );
  }

  if (error || !produto) {
    return (
      <div className="form-container">
        <p className="error-message">{error || 'Produto não encontrado'}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/produtos-servicos')}>
          Voltar
        </button>
      </div>
    );
  }

  // Calcular estatísticas de preços dos fornecedores (baseado em preço com impostos)
  const calcularEstatisticasPrecos = () => {
    if (!produto.fornecedores || produto.fornecedores.length === 0) {
      return { medio: 0, minimo: 0, maximo: 0 };
    }
    
    const precosComImpostos = produto.fornecedores.map(f => {
      const preco = calcularPrecoComImpostos(
        Number(f.preco_unitario) || 0,
        Number(f.icms) || 0,
        Number(f.ipi) || 0,
        Number(f.pis) || 0,
        Number(f.cofins) || 0,
        Number(f.iss) || 0
      );
      return preco;
    });
    
    const total = precosComImpostos.reduce((sum, preco) => sum + preco, 0);
    return {
      medio: total / precosComImpostos.length,
      minimo: Math.min(...precosComImpostos),
      maximo: Math.max(...precosComImpostos),
    };
  };

  const estatisticas = calcularEstatisticasPrecos();

  return (
    <div className="form-container">
      <div className="page-header">
        <h2>Detalhes do Produto/Serviço</h2>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate(`/produtos-servicos/editar/${id}`)}>
            Editar
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/produtos-servicos')}>
            Voltar
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h3>Informações Gerais</h3>
          
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="form-group">
              <label>Código Interno</label>
              <div className="detail-value">{produto.codigo_interno}</div>
            </div>
            <div className="form-group">
              <label>Tipo</label>
              <div className="detail-value">{produto.tipo}</div>
            </div>
            <div className="form-group">
              <label>Unidade de Medida</label>
              <div className="detail-value">{produto.unidade_medida}</div>
            </div>
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <div className="detail-value">{produto.descricao}</div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="form-group">
              <label>Código do Fabricante</label>
              <div className="detail-value">{produto.codigo_fabricante || '-'}</div>
            </div>
            <div className="form-group">
              <label>Nome do Fabricante</label>
              <div className="detail-value">{produto.nome_fabricante || '-'}</div>
            </div>
            <div className="form-group">
              <label>NCM / LCP</label>
              <div className="detail-value">
                {produto.ncm_lcp || '-'}
              </div>
            </div>
          </div>

          <h3 style={{ marginTop: '2rem' }}>Fornecedores</h3>
          
          {produto.fornecedores && produto.fornecedores.length > 0 && (
            <div style={{ 
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              color: 'white',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, color: 'white', fontSize: '0.95rem' }}>
                  📊 Análise de Preços
                </h4>
                {historicoPrecos.length > 0 && (
                  <button
                    onClick={() => setIsHistoricoModalOpen(true)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      hover: {},
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
                  >
                    Ver Detalhes
                  </button>
                )}
              </div>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: historicoPrecos.length > 0 ? '1fr 1fr 2fr' : '1fr 1fr',
                gap: '0.5rem'
              }}>
                {/* Caixa Preço Médio */}
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.15)', 
                  padding: '0.5rem', 
                  borderRadius: '0.5rem',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ fontSize: '0.65rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                    Preço Médio
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                    {formatCurrency(estatisticas.medio)}
                  </div>
                </div>

                {/* Caixa Variação */}
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.15)', 
                  padding: '0.5rem', 
                  borderRadius: '0.5rem',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ fontSize: '0.65rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                    Variação
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                    {formatCurrency(estatisticas.maximo - estatisticas.minimo)}
                  </div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.85, marginTop: '0.15rem' }}>
                    ({estatisticas.minimo > 0 ? ((estatisticas.maximo - estatisticas.minimo) / estatisticas.minimo * 100).toFixed(1) : 0}%)
                  </div>
                </div>
                
                {/* Gráfico de Histórico de Preços */}
                {historicoPrecos.length > 0 ? (
                  <div 
                    onClick={() => setIsGraficoModalOpen(true)}
                    style={{
                      background: '#f8f9fa',
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '200px',
                      cursor: 'pointer'
                    }}>
                    <Line
                      data={{
                        labels: historicoPrecos.map(h => new Date(h.registrado_em).toLocaleDateString('pt-BR')),
                        datasets: [
                          {
                            label: 'Preço Médio',
                            data: historicoPrecos.map(h => h.preco_medio),
                            borderColor: '#1e5631',
                            backgroundColor: 'rgba(30, 86, 49, 0.1)',
                            tension: 0.3,
                            borderWidth: 2,
                            fill: false,
                          },
                          {
                            label: 'Preço Mínimo',
                            data: historicoPrecos.map(h => h.preco_minimo),
                            borderColor: '#cc9600',
                            backgroundColor: 'rgba(204, 150, 0, 0.1)',
                            tension: 0.3,
                            borderWidth: 1,
                            borderDash: [5, 5],
                            fill: false,
                          },
                          {
                            label: 'Preço Máximo',
                            data: historicoPrecos.map(h => h.preco_maximo),
                            borderColor: '#721c24',
                            backgroundColor: 'rgba(114, 28, 36, 0.1)',
                            tension: 0.3,
                            borderWidth: 1,
                            borderDash: [5, 5],
                            fill: false,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: {
                            labels: { color: '#495057', font: { size: 10 } },
                            display: true,
                            position: 'top',
                          },
                          title: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: false,
                            ticks: { color: '#495057', font: { size: 8 } },
                            grid: { color: 'rgba(0, 0, 0, 0.05)' },
                          },
                          x: {
                            ticks: { color: '#495057', font: { size: 8 } },
                            grid: { color: 'rgba(0, 0, 0, 0.05)' },
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    color: '#6c757d',
                    fontSize: '0.75rem'
                  }}>
                    Sem histórico ainda
                  </div>
                )}
              </div>
            </div>
          )}

          {produto.fornecedores && produto.fornecedores.length > 0 ? (
            <div className="table-responsive">
              <style>{`
                .table-compact td,
                .table-compact th {
                  padding: 0.4rem !important;
                  vertical-align: middle !important;
                }
              `}</style>
              <table className="table table-compact" style={{ fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Fornecedor</th>
                    <th>Código</th>
                    <th>Preço Unit.</th>
                    <th>Prazo</th>
                    <th>Preço c/ Impostos</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produto.fornecedores.map((fornecedor, index) => {
                    const precoFornecedor = Number(fornecedor.preco_unitario) || 0;
                    const isMaisBarato = precoFornecedor === estatisticas.minimo && produto.fornecedores!.length > 1;
                    const isMaisCaro = precoFornecedor === estatisticas.maximo && produto.fornecedores!.length > 1;
                    
                    return (
                    <tr key={index} style={{ 
                      background: isMaisBarato ? '#d4edda' : isMaisCaro ? '#f8d7da' : undefined 
                    }}>
                      <td>
                        <strong>
                          {fornecedor.fornecedor?.nome_fantasia || fornecedor.fornecedor?.razao_social || `Fornecedor ${index + 1}`}
                        </strong>
                      </td>
                      <td>{fornecedor.codigo_fornecedor}</td>
                      <td>
                        {formatCurrency(fornecedor.preco_unitario)}
                      </td>
                      <td>{fornecedor.prazo_entrega_dias} dias</td>
                      <td>
                        <strong style={{ color: '#e74a3b' }}>
                          {formatCurrency(calcularPrecoComImpostos(
                            fornecedor.preco_unitario,
                            fornecedor.icms,
                            fornecedor.ipi,
                            fornecedor.pis,
                            fornecedor.cofins,
                            fornecedor.iss
                          ))}
                        </strong>
                      </td>
                      <td>
                        <button 
                          className="btn-action" 
                          title="Ver detalhamento de impostos"
                          onClick={() => {
                            setFornecedorSelecionado(fornecedor);
                            setIsModalOpen(true);
                          }}
                          style={{ background: '#3b82f6', color: 'white' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="3" y1="9" x2="21" y2="9"></line>
                            <line x1="9" y1="21" x2="9" y2="9"></line>
                          </svg>
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-state">Nenhum fornecedor cadastrado.</p>
          )}
        </div>
      </div>

      {/* Modal de Detalhamento de Impostos */}
      {isModalOpen && fornecedorSelecionado && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setFornecedorSelecionado(null);
          }}
          title="Detalhamento de Impostos"
        >
          {(() => {
            const detalhamento = calcularDetalhamentoImpostos(
              fornecedorSelecionado.preco_unitario,
              fornecedorSelecionado.icms,
              fornecedorSelecionado.ipi,
              fornecedorSelecionado.pis,
              fornecedorSelecionado.cofins,
              fornecedorSelecionado.iss
            );

            return (
              <div style={{ padding: '1rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>
                  {fornecedorSelecionado.fornecedor?.nome_fantasia || 
                   fornecedorSelecionado.fornecedor?.razao_social || 
                   'Fornecedor'}
                </h4>

                <div style={{ 
                  background: '#f8f9fc', 
                  padding: '1rem', 
                  borderRadius: '0.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>Preço Base (do fornecedor):</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 600, color: '#1e293b' }}>{formatCurrency(detalhamento.precoBase)}</div>
                  </div>
                </div>

                <h5 style={{ marginBottom: '0.75rem', color: '#5a5c69' }}>Impostos Embutidos (Por Dentro)</h5>
                <div style={{ 
                  background: '#fff3cd', 
                  padding: '1rem', 
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  borderLeft: '4px solid #ffc107'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>ICMS ({formatPercent(fornecedorSelecionado.icms)}):</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{formatCurrency(detalhamento.valorICMS)}</div>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>PIS ({formatPercent(fornecedorSelecionado.pis)}):</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{formatCurrency(detalhamento.valorPIS)}</div>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>COFINS ({formatPercent(fornecedorSelecionado.cofins)}):</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{formatCurrency(detalhamento.valorCOFINS)}</div>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>ISS ({formatPercent(fornecedorSelecionado.iss)}):</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{formatCurrency(detalhamento.valorISS)}</div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '2px solid #ffc107',
                    fontWeight: 700
                  }}>
                    <span>Total Impostos Por Dentro:</span>
                    <span style={{ color: '#dc3545' }}>{formatCurrency(detalhamento.totalImpostosPorDentro)}</span>
                  </div>
                </div>

                <div style={{ 
                  background: '#d1ecf1', 
                  padding: '1rem', 
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  borderLeft: '4px solid #17a2b8'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 600 }}>
                    <span>Valor Líquido (sem impostos):</span>
                    <span style={{ color: '#17a2b8' }}>{formatCurrency(detalhamento.valorLiquido)}</span>
                  </div>
                </div>

                <h5 style={{ marginBottom: '0.75rem', color: '#5a5c69' }}>Imposto Adicional (Por Fora)</h5>
                <div style={{ 
                  background: '#f8d7da', 
                  padding: '1rem', 
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  borderLeft: '4px solid #dc3545'
                }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>IPI ({formatPercent(fornecedorSelecionado.ipi)}):</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{formatCurrency(detalhamento.valorIPI)}</div>
                  </div>
                </div>

                <div style={{ 
                  background: '#d4edda', 
                  padding: '1.25rem', 
                  borderRadius: '0.5rem',
                  borderLeft: '4px solid #28a745'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '1.25rem',
                    fontWeight: 700
                  }}>
                    <span>PREÇO FINAL A PAGAR:</span>
                    <span style={{ color: '#28a745' }}>{formatCurrency(detalhamento.precoFinal)}</span>
                  </div>
                </div>

                <div style={{ 
                  marginTop: '1rem', 
                  padding: '0.75rem', 
                  background: '#e9ecef', 
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  color: '#6c757d'
                }}>
                  <strong>Nota:</strong> ICMS, PIS, COFINS e ISS já estão embutidos no preço do fornecedor (impostos "por dentro"). 
                  O IPI é adicionado ao preço (imposto "por fora").
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Modal de Histórico de Preços */}
      {isHistoricoModalOpen && (
        <Modal isOpen={isHistoricoModalOpen} onClose={() => setIsHistoricoModalOpen(false)}>
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Histórico de Preços</h3>
            
            {historicoPrecos.length > 0 ? (
              <div className="table-responsive">
                <style>{`
                  .table-compact td,
                  .table-compact th {
                    padding: 0.4rem !important;
                    vertical-align: middle !important;
                  }
                `}</style>
                <table className="table table-compact" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Preço Médio</th>
                      <th>Preço Mínimo</th>
                      <th>Preço Máximo</th>
                      <th>Variação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicoPrecos.map((h, idx) => (
                      <tr key={idx}>
                        <td>{new Date(h.registrado_em).toLocaleDateString('pt-BR')} {new Date(h.registrado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>{formatCurrency(h.preco_medio)}</td>
                        <td>{formatCurrency(h.preco_minimo)}</td>
                        <td>{formatCurrency(h.preco_maximo)}</td>
                        <td>{formatCurrency(h.preco_maximo - h.preco_minimo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#6c757d' }}>Nenhum registro de histórico ainda.</p>
            )}
          </div>
        </Modal>
      )}

      {/* Modal Gráfico Maior */}
      {isGraficoModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '2rem',
            minWidth: '90vw',
            minHeight: '90vh',
            maxWidth: '95vw',
            maxHeight: '95vh',
            overflow: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Histórico de Preços - Gráfico Completo</h3>
              <button
                onClick={() => setIsGraficoModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6c757d',
                  padding: 0
                }}>
                ✕
              </button>
            </div>
            <div style={{
              background: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              minHeight: 'calc(90vh - 200px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Line
                data={{
                  labels: historicoPrecos.map(h => new Date(h.registrado_em).toLocaleDateString('pt-BR')),
                  datasets: [
                    {
                      label: 'Preço Médio',
                      data: historicoPrecos.map(h => h.preco_medio),
                      borderColor: '#1e5631',
                      backgroundColor: 'rgba(30, 86, 49, 0.1)',
                      tension: 0.3,
                      borderWidth: 2,
                      fill: false,
                    },
                    {
                      label: 'Preço Mínimo',
                      data: historicoPrecos.map(h => h.preco_minimo),
                      borderColor: '#cc9600',
                      backgroundColor: 'rgba(204, 150, 0, 0.1)',
                      tension: 0.3,
                      borderWidth: 1,
                      borderDash: [5, 5],
                      fill: false,
                    },
                    {
                      label: 'Preço Máximo',
                      data: historicoPrecos.map(h => h.preco_maximo),
                      borderColor: '#721c24',
                      backgroundColor: 'rgba(114, 28, 36, 0.1)',
                      tension: 0.3,
                      borderWidth: 1,
                      borderDash: [5, 5],
                      fill: false,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: { color: '#495057', font: { size: 14 } },
                      display: true,
                      position: 'top',
                    },
                    title: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      ticks: { color: '#495057', font: { size: 12 } },
                      grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    },
                    x: {
                      ticks: { color: '#495057', font: { size: 12 } },
                      grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProdutoServicoDetalhes;
