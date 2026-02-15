import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import produtoServicoService, { ProdutoServico } from '../services/produtoServicoService';

const formatCurrency = (value: number) => {
  if (Number.isNaN(value)) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const ProdutosServicos: React.FC = () => {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<ProdutoServico[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const carregar = async () => {
    try {
      console.log('[ProdutosServicos] Iniciando carregamento...');
      setLoading(true);
      console.log('[ProdutosServicos] Chamando produtoServicoService.listar()...');
      const response = await produtoServicoService.listar();
      console.log('[ProdutosServicos] Resposta recebida:', response.data);
      setProdutos(response.data);
      setError(null);
    } catch (err) {
      console.error('[ProdutosServicos] Erro ao carregar produtos/serviços:', err);
      setError('Não foi possível carregar os produtos/serviços.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[ProdutosServicos] useEffect executado - montando componente');
    carregar();
  }, []);

  const handleEdit = (id: number) => {
    navigate(`/produtos-servicos/editar/${id}`);
  };

  const handleDelete = async (produto: ProdutoServico) => {
    if (!window.confirm(`Deseja excluir "${produto.descricao}"?`)) return;
    try {
      await produtoServicoService.deletar(produto.id);
      setProdutos(prev => prev.filter(item => item.id !== produto.id));
    } catch (err) {
      console.error('Erro ao excluir:', err);
      alert('Não foi possível excluir o registro.');
    }
  };

  const filtrados = produtos.filter(produto => {
    const termo = searchTerm.toLowerCase();
    return (
      produto.codigo_interno.toLowerCase().includes(termo) ||
      produto.descricao.toLowerCase().includes(termo) ||
      produto.tipo.toLowerCase().includes(termo)
    );
  });

  return (
    <div>
      <div className="page-header">
        <h2>Produtos e Serviços</h2>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/produtos-servicos/novo')}>
            Novo
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header filter-header">
          <div className="filters-container">
            <div className="filter-item">
              <label>Buscar</label>
              <input
                type="text"
                className="form-input"
                placeholder="Código, descrição ou tipo"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="card-body">
          {loading && <p>Carregando...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && !error && (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Tipo</th>
                    <th>Descrição</th>
                    <th>Unidade</th>
                    <th>Preço Unitário</th>
                    <th>Fornecedores</th>
                    <th>NCM</th>
                    <th>LCP</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(produto => (
                    <tr key={produto.id}>
                      <td>{produto.codigo_interno}</td>
                      <td>{produto.tipo}</td>
                      <td>{produto.descricao}</td>
                      <td>{produto.unidade_medida}</td>
                      <td>{formatCurrency(produto.preco_unitario || 0)}</td>
                      <td>{produto.fornecedores?.length || 0}</td>
                      <td>{produto.ncm || '-'}</td>
                      <td>{produto.lcp || '-'}</td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(produto.id)}>
                            Editar
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(produto)}>
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtrados.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center">
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProdutosServicos;
