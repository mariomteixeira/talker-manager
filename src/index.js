const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const generateToken = require('./services/loginToken');
const emailValidator = require('./middlewares/emailValidator');
const passwdValidator = require('./middlewares/passwdValidator');
const nameValidator = require('./middlewares/nameValidator');
const ageValidator = require('./middlewares/ageValidator');
const talkValidator = require('./middlewares/talkerValidator');
const tknValidator = require('./middlewares/tokenValidator');

const app = express();
app.use(express.json());

const talkerPathResolver = path.resolve(__dirname, 'talker.json');

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

// VALIDANDO JSON do Talker.json

const readFile = async () => (JSON.parse(await fs.readFile(talkerPathResolver, 'utf-8')));

app.get('/talker', async (_req, res) => {
  const talker = await readFile();
  res.status(200).json(talker);
});

// GET para o endpoint /talker/search?q=searchTerm

app.get('/talker/search', tknValidator, async (req, res) => {
    const talker = await readFile();
    const { q } = req.query;
    if (!q) {
      return res.status(200).json(talker);
    }
    const searchTalker = talker.filter((tlk) => tlk.name.includes(q));
    res.status(200).json(searchTalker);
  });

// VALIDANDO O ID DO PALESTRANTE

const validateId = async (ident) => {
  const talkerJSON = JSON.parse(await fs.readFile(talkerPathResolver, 'utf-8'));
  return talkerJSON.filter((talker) => talker.id === Number(ident));
};

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const [talkerResolved] = await validateId(id);
  if (!talkerResolved) { 
    return res.status(404)
  .json({ message: 'Pessoa palestrante não encontrada' });
  }
  res.status(200).json(talkerResolved);
});

// CRIAÇÃO DE TOKEN PARA LOGIN

app.post('/login', emailValidator, passwdValidator, async (req, res) => {
  const token = generateToken();
  res.status(200).json({ token });
});

// POST para o endpoint /talker

app.post('/talker', tknValidator, nameValidator, ageValidator, talkValidator, async (req, res) => {
  const talker = await readFile();
  const newTalker = { id: talker.length + 1, ...req.body };
  talker.push(newTalker);
  await fs.writeFile(talkerPathResolver, JSON.stringify(talker));
  res.status(201).json(newTalker);
});

// PUT para o endpoint /talker/:id

app.put('/talker/:id',
  tknValidator,
  nameValidator,
  ageValidator,
  talkValidator,
  async (req, res) => {
    const { id } = req.params;
    const talker = await readFile();
    const talkerIndex = talker.findIndex((tlk) => tlk.id === Number(id));
    if (talkerIndex === -1) {
      return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
    }
    const newTalker = { id: Number(id), ...req.body };
    talker[talkerIndex] = newTalker;
    await fs.writeFile(talkerPathResolver, JSON.stringify(talker));
    res.status(200).json(newTalker);
  });

// DELETE para o endpoint /talker/:id

app.delete('/talker/:id', tknValidator, async (req, res) => {
  const { id } = req.params;
  const talker = await readFile();
  const checkId = talker.filter((tlk) => tlk.id !== Number(id));
  const updateTalker = JSON.stringify(checkId, null, 2);
  await fs.writeFile(talkerPathResolver, updateTalker);
  res.status(204).send();
});
