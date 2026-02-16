import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import DashboardCard from '../components/DashboardCard';
import dashboardService, { DashboardStats } from '../services/dashboardService';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.obterEstatisticas();
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Configuração do gráfico de faturamento vs despesas
  const faturamentoDespesasData = stats
    ? {
        labels: stats.faturamentoPorMes.map((item) => item.mes),
        datasets: [
          {
            label: 'Faturamento',
            data: stats.faturamentoPorMes.map((item) => item.valor),
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderColor: 'rgba(30, 41, 59, 1)',
            borderWidth: 1,
          },
          {
            label: 'Despesas',
            data: stats.despesasPorMes.map((item) => item.valor),
            backgroundColor: 'rgba(220, 38, 38, 0.8)',
            borderColor: 'rgba(220, 38, 38, 1)',
            borderWidth: 1,
          },
        ],
      }
    : null;

  // Configuração do gráfico de projetos por status
  const projetosPorStatusData = stats
    ? {
        labels: Object.keys(stats.projetosPorStatus),
        datasets: [
          {
            label: 'Projetos',
            data: Object.values(stats.projetosPorStatus),
            backgroundColor: [
              'rgba(30, 41, 59, 0.8)',
              'rgba(5, 150, 105, 0.8)',
              'rgba(8, 145, 178, 0.8)',
              'rgba(217, 119, 6, 0.8)',
              'rgba(220, 38, 38, 0.8)',
              'rgba(100, 116, 139, 0.8)',
            ],
            borderColor: [
              'rgba(30, 41, 59, 1)',
              'rgba(5, 150, 105, 1)',
              'rgba(8, 145, 178, 1)',
              'rgba(217, 119, 6, 1)',
              'rgba(220, 38, 38, 1)',
              'rgba(100, 116, 139, 1)',
            ],
            borderWidth: 1,
          },
        ],
      }
    : null;

  // Configuração do gráfico de evolução do faturamento
  const evolucaoFaturamentoData = stats
    ? {
        labels: stats.faturamentoPorMes.map((item) => item.mes),
        datasets: [
          {
            label: 'Faturamento Mensal',
            data: stats.faturamentoPorMes.map((item) => item.valor),
            fill: true,
            backgroundColor: 'rgba(30, 41, 59, 0.1)',
            borderColor: 'rgba(30, 41, 59, 1)',
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: 'rgba(30, 41, 59, 1)',
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right' as const,
      },
    },
  };

  if (error) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger" role="alert">
          {error}
          <button onClick={carregarEstatisticas} className="btn btn-sm btn-danger ms-3">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Page Heading */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
        <div>
          <button onClick={carregarEstatisticas} className="btn btn-sm btn-secondary me-2">
            <i className="fas fa-sync-alt"></i> Atualizar
          </button>
          <Link to="/projetos" className="btn btn-sm btn-primary shadow-sm">
            <i className="fas fa-folder-open fa-sm text-white-50"></i> Ver Projetos
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="row mb-4">
        <div className="dashboard-card-5 mb-4">
          <DashboardCard
            title="Total de Projetos"
            value={stats?.totalProjetos || 0}
            icon="fas fa-folder"
            color="primary"
            subtitle="Todos os projetos"
            loading={loading}
          />
        </div>

        <div className="dashboard-card-5 mb-4">
          <DashboardCard
            title="Projetos Ativos"
            value={stats?.projetosAtivos || 0}
            icon="fas fa-tasks"
            color="success"
            subtitle="Em andamento"
            loading={loading}
          />
        </div>

        <div className="dashboard-card-5 mb-4">
          <DashboardCard
            title="Faturamento Total"
            value={stats ? formatCurrency(stats.faturamentoTotal) : 'R$ 0,00'}
            icon="fas fa-dollar-sign"
            color="info"
            subtitle={stats ? `Mês atual: ${formatCurrency(stats.faturamentoMesAtual)}` : ''}
            loading={loading}
          />
        </div>

        <div className="dashboard-card-5 mb-4">
          <DashboardCard
            title="Margem de Lucro"
            value={stats ? formatPercent(stats.margemLucro) : '0%'}
            icon="fas fa-chart-line"
            color={stats && stats.margemLucro >= 20 ? 'success' : 'warning'}
            subtitle="Faturamento - Despesas"
            loading={loading}
          />
        </div>

        <div className="dashboard-card-5 mb-4">
          <DashboardCard
            title="Projetos Pendentes"
            value={stats?.projetosPendentes || 0}
            icon="fas fa-clock"
            color="warning"
            subtitle="Aguardando aprovação"
            loading={loading}
          />
        </div>

        <div className="dashboard-card-5 mb-4">
          <DashboardCard
            title="Projetos Concluídos"
            value={stats?.projetosConcluidos || 0}
            icon="fas fa-check-circle"
            color="success"
            subtitle="Finalizados"
            loading={loading}
          />
        </div>

        <div className="dashboard-card-5 mb-4">
          <DashboardCard
            title="Despesas Totais"
            value={stats ? formatCurrency(stats.despesasTotal) : 'R$ 0,00'}
            icon="fas fa-receipt"
            color="danger"
            subtitle={stats ? `Mês atual: ${formatCurrency(stats.despesasMesAtual)}` : ''}
            loading={loading}
          />
        </div>

        <div className="dashboard-card-5 mb-4">
          <DashboardCard
            title="Resultado"
            value={
              stats
                ? formatCurrency(stats.faturamentoTotal - stats.despesasTotal)
                : 'R$ 0,00'
            }
            icon="fas fa-balance-scale"
            color={
              stats && stats.faturamentoTotal - stats.despesasTotal >= 0 ? 'success' : 'danger'
            }
            subtitle="Lucro/Prejuízo"
            loading={loading}
          />
        </div>
      </div>

      {/* Charts Row */}
      {!loading && stats && (
        <>
          <div className="row mb-4">
            {/* Faturamento vs Despesas Chart */}
            <div className="dashboard-chart-col">
              <div className="card shadow h-100">
                <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                  <h6 className="m-0 font-weight-bold text-primary">
                    Faturamento vs Despesas (Últimos 6 Meses)
                  </h6>
                </div>
                <div className="card-body">
                  <div style={{ height: '400px' }}>
                    {faturamentoDespesasData && (
                      <Bar data={faturamentoDespesasData} options={chartOptions} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Projetos por Status Chart */}
            <div className="dashboard-chart-col">
              <div className="card shadow h-100">
                <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                  <h6 className="m-0 font-weight-bold text-primary">Projetos por Status</h6>
                </div>
                <div className="card-body">
                  <div style={{ height: '400px' }}>
                    {projetosPorStatusData && (
                      <Doughnut data={projetosPorStatusData} options={doughnutOptions} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            {/* Evolução do Faturamento */}
            <div className="dashboard-chart-col">
              <div className="card shadow h-100">
                <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                  <h6 className="m-0 font-weight-bold text-primary">
                    Evolução do Faturamento
                  </h6>
                </div>
                <div className="card-body">
                  <div style={{ height: '400px' }}>
                    {evolucaoFaturamentoData && (
                      <Line data={evolucaoFaturamentoData} options={chartOptions} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Projetos por Técnico */}
            <div className="dashboard-chart-col">
              <div className="card shadow h-100">
                <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                  <h6 className="m-0 font-weight-bold text-primary">Projetos por Técnico</h6>
                </div>
                <div className="card-body">
                  <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table className="table table-sm table-hover">
                      <thead className="thead-light">
                        <tr>
                          <th>Técnico</th>
                          <th className="text-right">Projetos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.projetosPorTecnico.map((item, index) => (
                          <tr key={index}>
                            <td>{item.tecnico}</td>
                            <td className="text-right">
                              <span className="badge badge-primary badge-pill">{item.total}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {loading && (
        <div className="row">
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Carregando...</span>
            </div>
            <p className="mt-3 text-muted">Carregando dados do dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
