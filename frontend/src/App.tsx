import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import PessoasJuridicas from './pages/PessoasJuridicas';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <h1>ERP Sistema</h1>
          <div>
            <Link to="/">Home</Link>
            <Link to="/pessoas-juridicas">Pessoas Jurídicas</Link>
          </div>
        </nav>
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pessoas-juridicas" element={<PessoasJuridicas />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
