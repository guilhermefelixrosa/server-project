import React, { useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ESTADO INICIAL DO FORMULÁRIO
// !! IMPORTANTE !!
// Ajuste os campos aqui para que correspondam EXATAMENTE aos campos
// que você definiu no seu contatoSchema no server.js
const initialFormState = {
  nome: '',
  email: '',
  telefone: '',
  empresa: ''
};

function ContatosViewer() {
  const [contatos, setContatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // --- NOVO ESTADO PARA O FORMULÁRIO DE ADIÇÃO ---
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
  }, [refreshTrigger]); // Atualiza quando refreshTrigger muda

  // --- NOVA FUNÇÃO: Lida com mudanças nos inputs do formulário ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewContato(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // --- NOVA FUNÇÃO: Lida com o envio do formulário ---
  const handleAddSubmit = async (e) => {
    e.preventDefault(); // Impede o recarregamento da página
    
    // Validação simples
    if (!newContato.nome || !newContato.email) {
      alert('Por favor, preencha pelo menos nome e email.');
      return;
    }
    
    try {
      // Envia os dados do formulário para o backend
      await axios.post(`${API_URL}/api/contatos`, newContato);
      
      // Limpa o formulário
      setNewContato(initialFormState);
      
      // Força a atualização da lista (recarrega os dados)
      setRefreshTrigger(prev => prev + 1); 
      
    } catch (err) {
      console.error('Erro ao adicionar contato:', err);
      alert('Não foi possível adicionar o contato.');
    }
  };

  // --- FUNÇÃO DE DELETAR (Já existia, sem mudanças) ---
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este contato?')) {
      try {
        await axios.delete(`${API_URL}/api/contatos/${id}`);
        setRefreshTrigger(prev => prev + 1); 
      } catch (err) {
        console.error('Erro ao deletar contato:', err);
        alert('Não foi possível excluir o contato.');
      }
    }
  };

  // Lógica de filtro (Já existia, sem mudanças)
  const filteredData = contatos.filter((contato) => {
    return Object.values(contato).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) return <p>Carregando contatos...</p>;
  if (error) return <p>{error}</p>;

  const headers = contatos.length > 0 ? Object.keys(contatos[0]) : [];
  const filteredHeaders = headers.filter(h => h !== '_id' && h !== '__v');

  return (
    <div className="dataviewer-container">
      
      {/* --- NOVO FORMULÁRIO DE ADIÇÃO --- */}
      <div className="add-form-container">
        <h2>Adicionar Novo Contato</h2>
        <form onSubmit={handleAddSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input type="text" id="nome" name="nome" value={newContato.nome} onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={newContato.email} onChange={handleFormChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="telefone">Telefone</label>
              <input type="tel" id="telefone" name="telefone" value={newContato.telefone} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label htmlFor="empresa">Empresa</label>
              <input type="text" id="empresa" name="empresa" value={newContato.empresa} onChange={handleFormChange} />
            </div>
          </div>
          <button type="submit">Adicionar Contato</button>
        </form>
      </div>

      <hr />

      {/* --- SEÇÃO DE CONSULTA (O que já existia) --- */}
      <h2>Consulta à Base de Contatos</h2>
      <input
        type="text"
        placeholder="Buscar em contatos..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredData.length === 0 ? (
        <p>Nenhum contato encontrado.</p>
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