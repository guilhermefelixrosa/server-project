const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');
const path = require('path'); // Usaremos para servir o build do React

// --- Configuração Inicial ---
const app = express();
const port = 5000;
const MONGO_URI = 'mongodb://localhost:27017/excel-data-db'; // Verifique se este é o nome do seu banco

// --- Middlewares Essenciais ---
app.use(cors()); // Permite requisições de outras origens (ex: seu app React)
app.use(express.json()); // Permite que o Express entenda JSON no body das requisições

// --- Conexão com o MongoDB ---
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB conectado com sucesso.'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// --- Definição dos Schemas e Modelos ---

// 1. Schema para os dados do Excel (vai para a coleção 'datas')
const dataSchema = new mongoose.Schema({
  Nome: String,
  Email: String,
  Telefone: String,
  // Adicione aqui quaisquer outros campos que seu Excel possa ter
  // Se os campos variarem, você pode usar a opção strict: false
}, { strict: false }); // strict: false permite campos não definidos no schema

const DataModel = mongoose.model('Data', dataSchema); // O Mongoose usará a coleção 'datas'

// 2. Schema para a 'basecontatos' (vai para a coleção 'basecontatos')
// !!! IMPORTANTE: Ajuste os campos abaixo para corresponderem à sua coleção 'basecontatos'
const contatoSchema = new mongoose.Schema({
  nome: String,
  telefone: String,
  email: String,
  empresa: String
  // Adicione os campos que existem na sua coleção
}, { 
  collection: 'basecontatos', // Força o Mongoose a usar este nome de coleção
  strict: false // Permite campos extras, caso a coleção não seja uniforme
});

const ContatoModel = mongoose.model('Contato', contatoSchema);


// --- Configuração do Multer (Upload) ---
// Usando armazenamento em memória para processar o arquivo sem salvar no disco
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- ROTAS DA API ---

// 1. Rota para UPLOAD DE ARQUIVO
app.post('/api/upload', upload.single('file'), async (req, res) => {
  console.log('Recebida requisição /api/upload');
  if (!req.file) {
    return res.status(400).send({ message: 'Nenhum arquivo enviado.' });
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).send({ message: 'O arquivo Excel está vazio ou mal formatado.' });
    }

    // Insere os dados no MongoDB na coleção 'datas'
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

// 6. Rota para CRIAR um novo registro na 'basecontatos'
app.post('/api/contatos', async (req, res) => {
  console.log('Recebida requisição POST /api/contatos', req.body);
  try {
    // req.body conterá os dados do formulário (ex: { nome: 'Novo Contato', ... })
    // IMPORTANTE: Isso assume que seu ContatoModel tem os campos 'nome', 'email', 'telefone', 'empresa'
    // Se os campos do seu formulário forem diferentes, o Modelo os salvará
    // desde que tenhamos { strict: false } no schema (o que fizemos antes).
    const novoContato = new ContatoModel(req.body);
    
    // Salva o novo contato no banco de dados
    const contatoSalvo = await novoContato.save();
    
    // Retorna o contato salvo com o status 201 (Created)
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