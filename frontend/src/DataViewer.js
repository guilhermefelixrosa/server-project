import React, { useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Recebe as props 'refreshTrigger' e 'onDataChange'
function DataViewer({ refreshTrigger, onDataChange }) {
  const [data, setData] = useState([]); // Armazena TODOS os dados do DB
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- NOVO ESTADO ---
  const [searchTerm, setSearchTerm] = useState(''); // Estado para o filtro de busca

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/data`);
        setData(response.data); // Armazena a lista completa
        setError(null);
      } catch (err) {
        setError('Erro ao buscar dados.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchData();
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        await axios.delete(`${API_URL}/api/data/${id}`);
        onDataChange(); 
      } catch (err) {
        console.error('Erro ao deletar registro:', err);
        alert('Não foi possível excluir o registro.');
      }
    }
  };

  if (loading) return <p>Carregando dados...</p>;
  if (error) return <p>{error}</p>;

  // --- LÓGICA DE FILTRO ---
  // Filtra os dados com base no searchTerm
  const filteredData = data.filter((row) => {
    // Pega todos os valores do objeto (Nome, Email, Telefone, etc.)
    return Object.values(row).some(value => 
      // Converte o valor para string, coloca em minúsculas e verifica se inclui o termo de busca
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pega os cabeçalhos do primeiro objeto (da lista completa, não da filtrada)
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  const filteredHeaders = headers.filter(h => h !== '_id' && h !== '__v');

  return (
    <div className="dataviewer-container">
      <h2>Dados Armazenados</h2>
      
      {/* --- CAMPO DE BUSCA ADICIONADO --- */}
      <input
        type="text"
        placeholder="Buscar em qualquer coluna..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Agora, usamos filteredData.length para verificar se há dados */}
      {filteredData.length === 0 ? (
        <p>Nenhum dado encontrado.</p>
      ) : (
        <table>
          <thead>
            <tr>
              {filteredHeaders.map(header => (
                <th key={header}>{header}</th>
              ))}
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {/* E usamos filteredData.map() para renderizar as linhas */}
            {filteredData.map((row) => (
              <tr key={row._id}>
                {filteredHeaders.map(header => (
                  <td key={`${row._id}-${header}`}>
                    {row[header]}
                  </td>
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

export default DataViewer;