import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './pages/Home';
import PessoasJuridicas from './pages/PessoasJuridicas';
import PessoaJuridicaForm from './pages/PessoaJuridicaForm'; // Importa a nova página
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <Router>
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pessoas-juridicas" element={<PessoasJuridicas />} />
            <Route path="/pessoas-juridicas/nova" element={<PessoaJuridicaForm />} />
            <Route path="/pessoas-juridicas/editar/:id" element={<PessoaJuridicaForm />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
    </Router>
  );
};

export default App;