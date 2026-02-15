import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
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
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Header />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Home />} />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </main>
      </div>
    </Router>
  );
};

export default App;