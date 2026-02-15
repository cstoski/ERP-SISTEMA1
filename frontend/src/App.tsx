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
              <Route path="/pessoas-juridicas" element={<PessoasJuridicas />} />
              <Route path="/pessoas-juridicas/nova" element={<PessoaJuridicaForm />} />
              <Route path="/pessoas-juridicas/editar/:id" element={<PessoaJuridicaForm />} />
              <Route path="/contatos" element={<Contatos />} />
              <Route path="/contatos/novo" element={<ContatoForm />} />
              <Route path="/contatos/editar/:id" element={<ContatoForm />} />
              <Route path="/funcionarios" element={<Funcionarios />} />
              <Route path="/funcionarios/novo" element={<FuncionarioForm />} />
              <Route path="/funcionarios/editar/:id" element={<FuncionarioForm />} />
              <Route path="/projetos" element={<Projetos />} />
              <Route path="/projetos/novo" element={<ProjetoForm />} />
              <Route path="/projetos/editar/:id" element={<ProjetoForm />} />
              <Route path="/faturamentos" element={<Faturamentos />} />
              <Route path="/faturamentos/novo" element={<FaturamentoForm />} />
              <Route path="/faturamentos/editar/:id" element={<FaturamentoForm />} />
              <Route path="/alterar-senha" element={<AlterarSenha />} />
              <Route path="/usuarios" element={<GerenciamentoUsuarios />} />
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