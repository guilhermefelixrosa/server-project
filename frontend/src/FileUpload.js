import React, { useState } from 'react';
import axios from 'axios';

// API URL (do Render ou localhost)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function FileUpload({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage(''); 
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setMessage('Por favor, selecione um arquivo.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile); 

    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(`Sucesso! ${response.data.rows} linhas importadas.`);
      onUploadSuccess(); // Atualiza a tabela
      setSelectedFile(null); 
      event.target.reset(); 
    } catch (error) {
      setMessage('Erro no upload: ' + (error.response?.data?.message || error.message));
    }
  };

  // --- FUNÇÃO CORRETA (Limpa apenas a 'primeira tabela') ---
  const handleClearDatabase = async () => {
    // Adiciona uma dupla confirmação
    if (window.confirm('ATENÇÃO: Isso limpará TODOS os registros importados do Excel (a primeira tabela). Deseja continuar?')) {
      if (window.confirm('Tem certeza absoluta? Esta ação não pode ser desfeita.')) {
        try {
          // Chama apenas a rota para deletar os dados do Excel
          const response = await axios.delete(`${API_URL}/api/data/all`);
          
          // Mostra a mensagem de sucesso
          setMessage(`${response.data.deletedCount} registros foram deletados com sucesso.`);
          
          // Chama a função de refresh (passada pelo App.js)
          onUploadSuccess(); 

        } catch (error) {
          setMessage('Erro ao limpar a base de dados: ' + (error.response?.data?.message || error.message));
        }
      }
    }
  };
  // --- FIM DA FUNÇÃO ---

  return (
    <div className="upload-container">
      <h2>Importar Planilha</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept=".xlsx, .xls, .csv" />
        <button type="submit">Enviar</button>
      </form>
      {message && <p className="upload-status">{message}</p>}

      {/* --- SEÇÃO DE PERIGO (TEXTO CORRETO) --- */}
      <div className="danger-zone">
        <h2>Limpar Base (Importados)</h2>
        <p>
          Isso deletará todos os dados da tabela "Dados Importados do Excel".
          (Não afetará a "Consulta à Base de Contatos").
        </p>
        <button 
          type="button" 
          className="btn-delete" 
          onClick={handleClearDatabase}
        >
          Limpar Base de Importados
        </button>
      </div>
    </div>
  );
}

export default FileUpload;