import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; // Importa os novos estilos
import Home from './pages/Home';
import PessoasJuridicas from './pages/PessoasJuridicas';
import Contatos from './pages/Contatos';
import Menu from './pages/Menu';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="app-container d-flex flex-column min-vh-100">
        <Header />
        <div className="sidebar">
          <Menu />
        </div>
        <main className="content-wrapper flex-grow-1 py-4">
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pessoas-juridicas" element={<PessoasJuridicas />} />
              <Route path="/contatos" element={<Contatos />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;