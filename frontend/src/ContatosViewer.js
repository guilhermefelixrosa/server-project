import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API URL (do Render ou localhost)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ESTADO INICIAL DO FORMULÁRIO (ATUALIZADO)
const initialFormState = {
  Nome: '',
  email: '',
  password: '',
  manager: ''
};

function ContatosViewer() {
  const [contatos, setContatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [newContato, setNewContato] = useState(initialFormState);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/contatos`);
        setContatos(response.data);
        setError(null);
      } catch (err) {
        setError('Erro ao buscar contatos.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchData();
  }, [refreshTrigger]); 

  // Função para lidar com mudanças no formulário
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewContato(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Função de envio do formulário
  const handleAddSubmit = async (e) => {
    e.preventDefault(); 
    
    // Validação ATUALIZADA
    if (!newContato.Nome || !newContato.email || !newContato.password) {
      alert('Por favor, preencha Nome, email e password.');
      return;
    }
    
    try {
      await axios.post(`${API_URL}/api/contatos`, newContato);
      setNewContato(initialFormState);
      setRefreshTrigger(prev => prev + 1); 
    } catch (err) {
      console.error('Erro ao adicionar contato:', err);
      alert('Não foi possível adicionar o contato.');
    }
  };

  // Função de deletar
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este contato?')) {
      try {
        await axios.delete(`${API_URL}/api/contatos/${id}`);
        setRefreshTrigger(prev => prev + 1); 
      } catch (err) {
        console.error('Erro ao deletar registro:', err);
        alert('Não foi possível excluir o registro.');
      }
    }
  };

  // Lógica de filtro
  const filteredData = contatos.filter((contato) => {
    return Object.values(contato).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) return <p>Carregando contatos...</p>;
  if (error) return <p>{error}</p>;

  // Detecta cabeçalhos dinamicamente
  const headers = contatos.length > 0 ? Object.keys(contatos[0]) : [];
  const filteredHeaders = headers.filter(h => h !== '_id' && h !== '__v');

  return (
    <div className="dataviewer-container">
      
      {/* --- FORMULÁRIO DE ADIÇÃO (ATUALIZADO) --- */}
      <div className="add-form-container">
        <h2>Adicionar Novo Registro</h2>
        <form onSubmit={handleAddSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="Nome">Nome</label>
              <input type="text" id="Nome" name="Nome" value={newContato.Nome} onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={newContato.email} onChange={handleFormChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              {/* IMPORTANTE: type="password" para esconder a senha */}
              <input type="password" id="password" name="password" value={newContato.password} onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="manager">Manager</label>
              <input type="text" id="manager" name="manager" value={newContato.manager} onChange={handleFormChange} />
            </div>
          </div>
          <button type="submit">Adicionar Registro</button>
        </form>
      </div>

      <hr />

      {/* --- SEÇÃO DE CONSULTA --- */}
      <h2>Consulta à Base</h2>
      <input
        type="text"
        placeholder="Buscar..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredData.length === 0 ? (
        <p>Nenhum dado encontrado.</p>
      ) : (
        <table>
          <thead>
            <tr>
              {filteredHeaders.map(header => ( <th key={header}>{header}</th> ))}
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr key={row._id}>
                {filteredHeaders.map(header => (
                  <td key={`${row._id}-${header}`}>{row[header]}</td>
                ))}
                <td>
                  <button className="btn-delete" onClick={() => handleDelete(row._id)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ContatosViewer;