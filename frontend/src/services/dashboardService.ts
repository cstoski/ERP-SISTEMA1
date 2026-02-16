import api from './api';
import { projetoService } from './projetoService';
import faturamentoService from './faturamentoService';
import despesaProjetoService from './despesaProjetoService';

export interface DashboardStats {
  totalProjetos: number;
  projetosAtivos: number;
  projetosPendentes: number;
  projetosConcluidos: number;
  faturamentoTotal: number;
  faturamentoMesAtual: number;
  despesasTotal: number;
  despesasMesAtual: number;
  margemLucro: number;
  projetosPorStatus: { [key: string]: number };
  faturamentoPorMes: { mes: string; valor: number }[];
  despesasPorMes: { mes: string; valor: number }[];
  projetosPorTecnico: { tecnico: string; total: number }[];
}

const dashboardService = {
  async obterEstatisticas(): Promise<DashboardStats> {
    try {
      // Buscar dados em paralelo
      const [projetos, faturamentos, despesasResponse] = await Promise.all([
        projetoService.listarTodos(),
        faturamentoService.listarTodos(),
        despesaProjetoService.listar(),
      ]);

      const despesas = despesasResponse.data;

      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();

      // Calcular estatísticas de projetos
      const totalProjetos = projetos.length;
      const projetosAtivos = projetos.filter(
        (p) => p.status === 'Em andamento' || p.status === 'Aguardando pedido de compra'
      ).length;
      const projetosPendentes = projetos.filter(
        (p) => p.status === 'Orçando' || p.status === 'Orçamento Enviado'
      ).length;
      const projetosConcluidos = projetos.filter((p) => p.status === 'Concluído').length;

      // Projetos por status
      const projetosPorStatus: { [key: string]: number } = {};
      projetos.forEach((projeto) => {
        if (!projetosPorStatus[projeto.status]) {
          projetosPorStatus[projeto.status] = 0;
        }
        projetosPorStatus[projeto.status]++;
      });

      // Calcular faturamento
      const faturamentoTotal = faturamentos.reduce((sum, f) => sum + (f.valor_faturado || 0), 0);
      const faturamentoMesAtual = faturamentos
        .filter((f) => {
          if (!f.data_faturamento) return false;
          const data = new Date(f.data_faturamento);
          return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
        })
        .reduce((sum, f) => sum + (f.valor_faturado || 0), 0);

      // Calcular despesas (valor do frete das despesas do projeto)
      const despesasTotal = despesas.reduce((sum, d) => sum + (d.valor_frete || 0), 0);
      const despesasMesAtual = despesas
        .filter((d) => {
          if (!d.data_pedido) return false;
          const data = new Date(d.data_pedido);
          return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
        })
        .reduce((sum, d) => sum + (d.valor_frete || 0), 0);

      // Calcular margem de lucro
      const margemLucro =
        faturamentoTotal > 0 ? ((faturamentoTotal - despesasTotal) / faturamentoTotal) * 100 : 0;

      // Faturamento por mês (últimos 6 meses)
      const faturamentoPorMes = calcularPorMes(faturamentos, 'data_faturamento', 'valor_faturado', 6);
      
      // Despesas por mês (últimos 6 meses)
      const despesasPorMes = calcularPorMes(despesas, 'data_pedido', 'valor_frete', 6);

      // Projetos por técnico
      const projetosPorTecnicoMap: { [key: string]: number } = {};
      projetos.forEach((projeto) => {
        const tecnico = projeto.tecnico || 'Não atribuído';
        if (!projetosPorTecnicoMap[tecnico]) {
          projetosPorTecnicoMap[tecnico] = 0;
        }
        projetosPorTecnicoMap[tecnico]++;
      });

      const projetosPorTecnico = Object.entries(projetosPorTecnicoMap)
        .map(([tecnico, total]) => ({ tecnico, total }))
        .sort((a, b) => b.total - a.total);

      return {
        totalProjetos,
        projetosAtivos,
        projetosPendentes,
        projetosConcluidos,
        faturamentoTotal,
        faturamentoMesAtual,
        despesasTotal,
        despesasMesAtual,
        margemLucro,
        projetosPorStatus,
        faturamentoPorMes,
        despesasPorMes,
        projetosPorTecnico,
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas do dashboard:', error);
      throw error;
    }
  },
};

// Função auxiliar para calcular valores por mês
function calcularPorMes(
  items: any[],
  campoData: string,
  campoValor: string,
  meses: number
): { mes: string; valor: number }[] {
  const resultado: { mes: string; valor: number }[] = [];
  const hoje = new Date();

  for (let i = meses - 1; i >= 0; i--) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const mes = data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    
    const valorMes = items
      .filter((item) => {
        if (!item[campoData]) return false;
        const itemData = new Date(item[campoData]);
        return (
          itemData.getMonth() === data.getMonth() &&
          itemData.getFullYear() === data.getFullYear()
        );
      })
      .reduce((sum, item) => sum + (item[campoValor] || 0), 0);

    resultado.push({ mes, valor: valorMes });
  }

  return resultado;
}

export default dashboardService;
