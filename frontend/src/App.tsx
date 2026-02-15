import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Login from './pages/authentication/Login';
import Signup from './pages/authentication/Signup';
import ResetSenha from './pages/ResetSenha';
import RequireAuth from './components/RequireAuth';
import PessoasJuridicas from './pages/PessoasJuridicas';
import PessoaJuridicaForm from './pages/PessoaJuridicaForm';
import Contatos from './pages/Contatos';
import ContatoForm from './pages/ContatoForm';
import Funcionarios from './pages/Funcionarios';
import FuncionarioForm from './pages/FuncionarioForm';
import Projetos from './pages/Projetos';
import ProjetoForm from './pages/ProjetoForm';
import Faturamentos from './pages/Faturamentos';
import FaturamentoForm from './pages/FaturamentoForm';
import Cronogramas from './pages/Cronogramas';
import ProdutosServicos from './pages/ProdutosServicos';
import ProdutoServicoForm from './pages/ProdutoServicoForm';
import AlterarSenha from './pages/AlterarSenha';
import GerenciamentoUsuarios from './pages/GerenciamentoUsuarios';
import NotFound from './pages/NotFound';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/reset-senha';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const stored = localStorage.getItem('sidebar_collapsed');
    return stored === 'true';
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <ErrorBoundary>
      <div className="app-container">
        {!isAuthPage && <Sidebar isCollapsed={isSidebarCollapsed} />}
        <main className="main-content" style={isAuthPage ? { width: '100%' } : {}}>
          {!isAuthPage && (
            <Header isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={handleToggleSidebar} />
          )}
          <div className="page-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-senha" element={<ResetSenha />} />
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <Home />
                  </RequireAuth>
                }
              />
              <Route
                path="/pessoas-juridicas"
                element={
                  <RequireAuth>
                    <PessoasJuridicas />
                  </RequireAuth>
                }
              />
              <Route
                path="/pessoas-juridicas/nova"
                element={
                  <RequireAuth>
                    <PessoaJuridicaForm />
                  </RequireAuth>
                }
              />
              <Route
                path="/pessoas-juridicas/editar/:id"
                element={
                  <RequireAuth>
                    <PessoaJuridicaForm />
                  </RequireAuth>
                }
              />
              <Route
                path="/contatos"
                element={
                  <RequireAuth>
                    <Contatos />
                  </RequireAuth>
                }
              />
              <Route
                path="/contatos/novo"
                element={
                  <RequireAuth>
                    <ContatoForm />
                  </RequireAuth>
                }
              />
              <Route
                path="/contatos/editar/:id"
                element={
                  <RequireAuth>
                    <ContatoForm />
                  </RequireAuth>
                }
              />
              <Route
                path="/funcionarios"
                element={
                  <RequireAuth>
                    <Funcionarios />
                  </RequireAuth>
                }
              />
              <Route
                path="/funcionarios/novo"
                element={
                  <RequireAuth>
                    <FuncionarioForm />
                  </RequireAuth>
                }
              />
              <Route
                path="/funcionarios/editar/:id"
                element={
                  <RequireAuth>
                    <FuncionarioForm />
                  </RequireAuth>
                }
              />
              <Route
                path="/projetos"
                element={
                  <RequireAuth>
                    <Projetos />
                  </RequireAuth>
                }
              />
              <Route
                path="/projetos/novo"
                element={
                  <RequireAuth>
                    <ProjetoForm />
                  </RequireAuth>
                }
              />
              <Route
                path="/projetos/editar/:id"
                element={
                  <RequireAuth>
                    <ProjetoForm />
                  </RequireAuth>
                }
              />
              <Route
                path="/produtos-servicos"
                element={
                  <RequireAuth>
                    <ProdutosServicos />
                  </RequireAuth>
                }
              />
              <Route
                path="/produtos-servicos/novo"
                element={
                  <RequireAuth>
                    <ProdutoServicoForm />
                  </RequireAuth>
                }
              />
              <Route
                path="/produtos-servicos/editar/:id"
                element={
                  <RequireAuth>
                    <ProdutoServicoForm />
                  </RequireAuth>
                }
              />
              <Route
                path="/faturamentos"
                element={
                  <RequireAuth>
                    <Faturamentos />
                  </RequireAuth>
                }
              />
              <Route
                path="/faturamentos/novo"
                element={
                  <RequireAuth>
                    <FaturamentoForm />
                  </RequireAuth>
                }
              />
              <Route
                path="/faturamentos/editar/:id"
                element={
                  <RequireAuth>
                    <FaturamentoForm />
                  </RequireAuth>
                }
              />
              <Route
                path="/cronogramas"
                element={
                  <RequireAuth>
                    <Cronogramas />
                  </RequireAuth>
                }
              />
              <Route
                path="/alterar-senha"
                element={
                  <RequireAuth>
                    <AlterarSenha />
                  </RequireAuth>
                }
              />
              <Route
                path="/usuarios"
                element={
                  <RequireAuth>
                    <GerenciamentoUsuarios />
                  </RequireAuth>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          {!isAuthPage && <Footer />}
        </main>
      </div>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;