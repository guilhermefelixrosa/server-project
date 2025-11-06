import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function FileUpload({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  
  // Novos estados para o upload da Genesys
  const [isUploadingToGenesys, setIsUploadingToGenesys] = useState(false);
  const [genesysMessage, setGenesysMessage] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage(''); 
    setGenesysMessage(''); // Limpa a outra mensagem
  };

  const handleSubmit = async (event) => {
    // ... (Esta função continua exatamente igual)
    event.preventDefault();
    if (!selectedFile) {
      setMessage('Por favor, selecione um arquivo.');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile); 
    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(`Sucesso! ${response.data.rows} linhas importadas.`);
      onUploadSuccess(); 
      setSelectedFile(null); 
      event.target.reset(); 
    } catch (error) {
      setMessage('Erro no upload: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleClearDatabase = async () => {
    // ... (Esta função continua exatamente igual)
    if (window.confirm('ATENÇÃO: Isso limpará TODOS os registros importados do Excel. Deseja continuar?')) {
      if (window.confirm('Tem certeza absoluta? Esta ação não pode ser desfeita.')) {
        try {
          const response = await axios.delete(`${API_URL}/api/data/all`);
          setMessage(`${response.data.deletedCount} registros foram deletados com sucesso.`);
          onUploadSuccess(); 
        } catch (error) {
          setMessage('Erro ao limpar a base de dados: ' + (error.response?.data?.message || error.message));
        }
      }
    }
  };

  // --- NOVA FUNÇÃO ---
  const handleUploadToGenesys = async () => {
    if (!window.confirm('Isso tentará enviar TODOS os contatos da tabela "Importados" para a Genesys Cloud. Deseja continuar?')) {
      return;
    }

    setIsUploadingToGenesys(true);
    setGenesysMessage('Enviando contatos para a Genesys... Isso pode levar alguns minutos.');
    
    try {
      // Chama a nova rota do backend
      const response = await axios.post(`${API_URL}/api/genesys/upload-contacts`);
      
      // Exibe a mensagem de resumo do backend
      setGenesysMessage(response.data.message);
      
      if (response.data.falhas > 0) {
        console.error('Falhas detalhadas:', response.data.errosDetalhados);
        setGenesysMessage(prev => prev + ' (Verifique o console para detalhes das falhas.)');
      }

    } catch (error) {
      setGenesysMessage('Erro ao enviar para a Genesys: ' + (error.response?.data?.message || error.message));
    }
    setIsUploadingToGenesys(false);
  };
  // --- FIM DA NOVA FUNÇÃO ---

  return (
    <div className="upload-container">
      <h2>1. Importar Planilha</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept=".xlsx, .xls, .csv" />
        <button type="submit">Enviar</button>
      </form>
      {message && <p className="upload-status">{message}</p>}

      {/* --- NOVA SEÇÃO DE UPLOAD GENESYS --- */}
      <div className="genesys-upload-zone">
        <h2>2. Sincronizar com Genesys</h2>
        <p>
          Após o envio, clique aqui para criar os usuários na Genesys Cloud 
          usando os dados da tabela "Importados".
        </p>
        <button 
          type="button" 
          className="btn-genesys" // Novo estilo
          onClick={handleUploadToGenesys}
          disabled={isUploadingToGenesys}
        >
          {isUploadingToGenesys ? 'Enviando...' : 'Enviar Contatos para Genesys'}
        </button>
        {genesysMessage && <p className="upload-status">{genesysMessage}</p>}
      </div>

      {/* --- SEÇÃO "danger-zone" de limpar base --- */}
      <div className="danger-zone">
        <h2>Limpar Base (Importados)</h2>
        <p>
          Deleta todos os dados da tabela "Dados Importados do Excel".
          (Não afeta a Genesys Cloud nem a "Base de Contatos").
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