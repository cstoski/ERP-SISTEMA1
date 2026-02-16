import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import produtoServicoService, { ProdutoServico } from '../services/produtoServicoService';
import * as XLSX from 'xlsx';

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
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleView = (id: number) => {
    navigate(`/produtos-servicos/detalhes/${id}`);
  };

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

  const exportarProdutos = () => {
    // Prepara dados para exportação sem fornecedores
    const dadosExportacao = produtos.map(({
      id,
      criado_em,
      atualizado_em,
      fornecedores,
      ...rest
    }) => ({
      ...rest
    }));

    // Cria worksheet
    const worksheet = XLSX.utils.json_to_sheet(dadosExportacao);
    
    // Define largura das colunas
    worksheet['!cols'] = [
      { wch: 12 }, // codigo_interno
      { wch: 12 }, // tipo
      { wch: 25 }, // descricao
      { wch: 12 }, // unidade_medida
      { wch: 15 }, // codigo_fabricante
      { wch: 20 }, // nome_fabricante
      { wch: 15 }, // ncm_lcp
      { wch: 15 }, // preco_unitario
    ];

    // Cria workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos');

    // Gera arquivo
    XLSX.writeFile(workbook, `produtos-servicos-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const importarProdutos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const dadosImportados = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (!Array.isArray(dadosImportados) || dadosImportados.length === 0) {
          alert('Arquivo inválido ou vazio. Certifique-se que é um arquivo Excel válido.');
          return;
        }

        // Carrega produtos existentes para verificar duplicatas
        const responseProdutos = await produtoServicoService.listar();
        const produtosExistentes = responseProdutos.data;

        // Importa cada produto
        let importados = 0;
        let duplicados = 0;
        const listaErros: { linha: number; produto: string; motivo: string }[] = [];

        for (let index = 0; index < dadosImportados.length; index++) {
          const produto = dadosImportados[index];
          try {
            // Verifica se já existe um produto com o mesmo fabricante e código
            const jaExiste = produtosExistentes.some(
              (p) =>
                p.codigo_fabricante === (produto.codigo_fabricante || undefined) &&
                p.nome_fabricante === (produto.nome_fabricante || undefined) &&
                (produto.codigo_fabricante || produto.nome_fabricante) // Só verifica se tem pelo menos um dos dois
            );

            if (jaExiste) {
              console.warn(
                `Produto duplicado ignorado: ${produto.nome_fabricante || ''} (${produto.codigo_fabricante || ''})`
              );
              duplicados++;
              continue;
            }

            // Prepara dados para criação
            const dadosCriacao = {
              tipo: produto.tipo || 'Produto',
              unidade_medida: produto.unidade_medida || 'UN',
              descricao: produto.descricao || '',
              codigo_fabricante: produto.codigo_fabricante || undefined,
              nome_fabricante: produto.nome_fabricante || undefined,
              ncm_lcp: produto.ncm_lcp || undefined,
              preco_unitario: parseFloat(produto.preco_unitario) || 0,
              fornecedores: [],
            };

            await produtoServicoService.criar(dadosCriacao);
            importados++;
          } catch (err: any) {
            const nomeProduto =
              produto.nome_fabricante || produto.codigo_fabricante || produto.descricao || 'Sem nome';
            const mensagemErro =
              err?.response?.data?.detail ||
              err?.message ||
              'Erro desconhecido';
            listaErros.push({
              linha: index + 2, // +2 para considerar o header do Excel
              produto: nomeProduto,
              motivo: mensagemErro,
            });
            console.error(`Erro ao importar produto (linha ${index + 2}):`, err);
          }
        }

        // Monta mensagem de resumo
        let mensagemResumida = `Importação concluída!`;
        mensagemResumida += `\n✓ Importados: ${importados}`;
        if (duplicados > 0) mensagemResumida += `\n⊘ Duplicados: ${duplicados}`;
        if (listaErros.length > 0) {
          mensagemResumida += `\n✗ Erros: ${listaErros.length}`;
          mensagemResumida += `\n\nDetalhes dos erros:`;
          listaErros.slice(0, 5).forEach((err) => {
            mensagemResumida += `\n• Linha ${err.linha} - ${err.produto}: ${err.motivo}`;
          });
          if (listaErros.length > 5) {
            mensagemResumida += `\n\n... e mais ${listaErros.length - 5} erro(s)`;
          }
        }

        alert(mensagemResumida);

        // Recarrega a lista
        carregar();
      } catch (err) {
        console.error('Erro ao processar arquivo:', err);
        alert('Erro ao processar o arquivo. Verifique se é um arquivo Excel válido.');
      }
    };

    reader.readAsArrayBuffer(file);

    // Limpa o input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filtrados = produtos.filter(produto => {
    const termo = searchTerm.toLowerCase();
    return (
      produto.codigo_interno.toLowerCase().includes(termo) ||
      produto.codigo_fabricante?.toLowerCase().includes(termo) ||
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
          <button className="btn btn-secondary" onClick={exportarProdutos} title="Exportar produtos em Excel">
            📥 Exportar Excel
          </button>
          <label className="btn btn-secondary" style={{ cursor: 'pointer', marginBottom: 0 }}>
            📤 Importar Excel
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={importarProdutos}
              style={{ display: 'none' }}
            />
          </label>
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
                placeholder="Código, código fabricante, descrição ou tipo"
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
                    <th style={{ width: '120px' }}>Código</th>
                    <th style={{ width: '180px' }}>Código Fabricante</th>
                    <th>Nome Fabricante</th>
                    <th>Descrição</th>
                    <th style={{ width: '80px' }}>Unidade</th>
                    <th style={{ width: '110px' }}>Preço Médio</th>
                    <th style={{ width: '120px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(produto => (
                    <tr key={produto.id}>
                      <td>{produto.codigo_interno}</td>
                      <td>{produto.codigo_fabricante || '-'}</td>
                      <td>{produto.nome_fabricante || '-'}</td>
                      <td>{produto.descricao}</td>
                      <td>{produto.unidade_medida}</td>
                      <td>{formatCurrency(produto.preco_unitario || 0)}</td>
                      <td>
                        <div className="actions">
                          <button className="btn-action" title="Visualizar" onClick={() => handleView(produto.id)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          </button>
                          <button className="btn-action" title="Editar" onClick={() => handleEdit(produto.id)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </button>
                          <button className="btn-action" title="Excluir" onClick={() => handleDelete(produto)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtrados.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center">
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
