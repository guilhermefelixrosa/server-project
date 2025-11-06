const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');
const path = require('path'); // Usaremos para servir o build do React

// --- Configuração Inicial ---
const app = express();
// const port = 5000;
// const MONGO_URI = 'mongodb://localhost:27017/excel-data-db'; // Verifique se este é o nome do seu banco

const port = process.env.PORT || 5000; // 1. USAR A PORTA DO RENDER
const MONGO_URI = process.env.MONGO_URI; // 2. USAR A URI DO ATLAS

// --- Middlewares Essenciais ---
app.use(cors({
  origin: process.env.FRONTEND_URL // 3. Permitir CORS do seu frontend
}));
app.use(express.json());

// --- Conexão com o MongoDB ---
mongoose.connect(MONGO_URI) // 4. Usar a variável
.then(() => console.log('MongoDB conectado com sucesso.'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// --- Definição dos Schemas e Modelos ---

// 1. Schema para os dados do Excel (vai para a coleção 'datas')
const dataSchema = new mongoose.Schema({
  Nome: String,
  email: String,
  password: String, // Senha em texto puro
  manager: String
}, { strict: false });

const DataModel = mongoose.model('Data', dataSchema);

// 2. Schema para a 'basecontatos'
const contatoSchema = new mongoose.Schema({
  Nome: String,
  email: String,
  password: String, // Senha em texto puro
  manager: String
}, { 
  collection: 'basecontatos', 
  strict: false 
});

const ContatoModel = mongoose.model('Contato', contatoSchema);

// --- Configuração do Multer (Upload) ---
// Usando armazenamento em memória para processar o arquivo sem salvar no disco
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- ROTAS DA API ---

// 1. Rota para UPLOAD DE ARQUIVO (SIMPLIFICADA)
// (Removemos a lógica de hash)
app.post('/api/upload', upload.single('file'), async (req, res) => {
  console.log('Recebida requisição /api/upload');
  if (!req.file) {
    return res.status(400).send({ message: 'Nenhum arquivo enviado.' });
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet); // Lê os dados como estão

    if (data.length === 0) {
      return res.status(400).send({ message: 'O arquivo Excel está vazio ou mal formatado.' });
    }

    // Insere os dados diretamente (com senha em texto puro)
    const result = await DataModel.insertMany(data);
    
    console.log(`Sucesso: ${result.length} linhas inseridas na coleção 'datas'`);
    res.status(200).send({ message: 'Arquivo processado e dados salvos!', rows: result.length });

  } catch (error) {
    console.error('Erro no processamento do upload:', error);
    res.status(500).send({ message: 'Erro ao processar o arquivo', error: error.message });
  }
});

// 2. Rota para BUSCAR dados da coleção 'datas' (do Excel)
app.get('/api/data', async (req, res) => {
  console.log('Recebida requisição GET /api/data');
  try {
    const allData = await DataModel.find();
    res.status(200).json(allData);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).send({ message: 'Erro ao buscar dados', error: error.message });
  }
});

// 3. Rota para DELETAR dados da coleção 'datas' (do Excel)
app.delete('/api/data/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Recebida requisição DELETE /api/data/${id}`);
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: 'ID inválido.' });
    }

    const deletedData = await DataModel.findByIdAndDelete(id);

    if (!deletedData) {
      return res.status(404).send({ message: 'Registro não encontrado.' });
    }

    res.status(200).send({ message: 'Registro deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar registro:', error);
    res.status(500).send({ message: 'Erro ao deletar o registro', error: error.message });
  }
});

// 4. Rota para BUSCAR dados da coleção 'basecontatos'
app.get('/api/contatos', async (req, res) => {
  console.log('Recebida requisição GET /api/contatos');
  try {
    const contatos = await ContatoModel.find();
    res.status(200).json(contatos);
  } catch (error) {
    console.error('Erro ao buscar contatos:', error);
    res.status(500).send({ message: 'Erro ao buscar contatos', error: error.message });
  }
});

// 5. Rota para DELETAR dados da coleção 'basecontatos'
app.delete('/api/contatos/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Recebida requisição DELETE /api/contatos/${id}`);
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: 'ID inválido.' });
    }

    const deletedContato = await ContatoModel.findByIdAndDelete(id);

    if (!deletedContato) {
      return res.status(404).send({ message: 'Contato não encontrado.' });
    }

    res.status(200).send({ message: 'Contato deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar contato:', error);
    res.status(500).send({ message: 'Erro ao deletar o contato', error: error.message });
  }
});

// ... (todo o seu código existente, app.get('/api/contatos') e app.delete('/api/contatos/:id'))

// 6. Rota para CRIAR um novo registro na 'basecontatos' (SIMPLIFICADA)
// (Removemos a lógica de hash)
app.post('/api/contatos', async (req, res) => {
  console.log('Recebida requisição POST /api/contatos', req.body);
  try {
    const { Nome, email, password, manager } = req.body;

    // Validação de campos obrigatórios
    if (!Nome || !email || !password) {
      return res.status(400).send({ message: 'Nome, email e password são obrigatórios.' });
    }

    const novoContato = new ContatoModel({
      Nome,
      email,
      password, // Salva a senha em texto puro
      manager
    });
    
    const contatoSalvo = await novoContato.save();
    
    res.status(201).json(contatoSalvo);

  } catch (error) {
    console.error('Erro ao criar contato:', error);
    res.status(500).send({ message: 'Erro ao criar o contato', error: error.message });
  }
});

// --- Iniciar o Servidor ---
app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});