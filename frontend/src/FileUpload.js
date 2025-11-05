import React, { useState } from 'react';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function FileUpload({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage(''); // Limpa a mensagem ao selecionar novo arquivo
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
      // Use o seu endereço de backend
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(`Sucesso! ${response.data.rows} linhas importadas.`);
      onUploadSuccess(); // Chama a função para atualizar a lista
      setSelectedFile(null); // Limpa o input
      event.target.reset(); // Reseta o formulário
    } catch (error) {
      setMessage('Erro no upload: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="upload-container">
      <h2>Importar Planilha</h2>
      <form onSubmit={handleSubmit}>
        {/* A CORREÇÃO ESTÁ AQUI: type="file" */}
        <input type="file" onChange={handleFileChange} accept=".xlsx, .xls, .csv" />
        <button type="submit">Enviar</button>
      </form>
      {message && <p className="upload-status">{message}</p>}
    </div>
  );
}

export default FileUpload;