import React from 'react';
// 1. Verifique estes imports
import { Routes, Route, Link } from 'react-router-dom'; 

// 2. Verifique se os nomes desses arquivos estão corretos na sua pasta 'src'
import DashboardPage from './DashboardPage';
import ContatosViewer from './ContatosViewer';

import './App.css'; 

function App() {
  return (
    <div className="App">
      
      <header className="App-header">
        <h1>Dashboard de Importação</h1>
        <nav className="App-nav">
          {/* 3. Links para navegar */}
          <Link to="/">Upload de Arquivo</Link>
          <Link to="/contatos">Consultar Contatos</Link>
        </nav>
      </header>

      <main className="App-main">
        {/* 4. Onde as páginas irão carregar */}
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/contatos" element={<ContatosViewer />} />
        </Routes>
      </main>

    </div>
  );
}

export default App;