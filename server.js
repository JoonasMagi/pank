const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger seadistus
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Keskpanga API',
      version: '1.0.0',
      description: 'Keskpanga API, mis võimaldab õpilastel oma panga rakenduste kaudu üksteisele ülekandeid teha',
      contact: {
        name: 'API tugi',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Arendusserver'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key'
        }
      }
    }
  },
  apis: ['./server.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Andmebaasi failid
const BANKS_FILE = path.join(__dirname, 'data', 'banks.json');
const TRANSACTIONS_FILE = path.join(__dirname, 'data', 'transactions.json');

// Tagame, et andmebaasi kataloog eksisteerib
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// Tagame, et vajalikud JSON failid eksisteerivad
if (!fs.existsSync(BANKS_FILE)) {
  fs.writeFileSync(BANKS_FILE, JSON.stringify({ banks: [] }));
}

if (!fs.existsSync(TRANSACTIONS_FILE)) {
  fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify({ transactions: [] }));
}

// Abifunktsioonid andmebaasi käsitlemiseks
function readBanks() {
  const data = fs.readFileSync(BANKS_FILE, 'utf8');
  return JSON.parse(data);
}

function writeBanks(data) {
  fs.writeFileSync(BANKS_FILE, JSON.stringify(data, null, 2));
}

function readTransactions() {
  const data = fs.readFileSync(TRANSACTIONS_FILE, 'utf8');
  return JSON.parse(data);
}

function writeTransactions(data) {
  fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(data, null, 2));
}

/**
 * @swagger
 * tags:
 *   - name: Pangad
 *     description: Pankade halduse API
 *   - name: Ülekanded
 *     description: Ülekannete halduse API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Bank:
 *       type: object
 *       required:
 *         - name
 *         - apiUrl
 *       properties:
 *         id:
 *           type: string
 *           description: Panga unikaalne ID
 *         name:
 *           type: string
 *           description: Panga nimi
 *         apiUrl:
 *           type: string
 *           description: Panga API URL
 *         balance:
 *           type: number
 *           description: Panga bilanss
 *     BankRegistrationRequest:
 *       type: object
 *       required:
 *         - name
 *         - apiUrl
 *       properties:
 *         name:
 *           type: string
 *           description: Panga nimi
 *         apiUrl:
 *           type: string
 *           description: Panga API URL
 *     BankRegistrationResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Panga unikaalne ID
 *         name:
 *           type: string
 *           description: Panga nimi
 *         apiKey:
 *           type: string
 *           description: Panga API võti autentimiseks
 *         balance:
 *           type: number
 *           description: Panga algne bilanss
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Ülekande unikaalne ID
 *         fromBankId:
 *           type: string
 *           description: Lähtepanga ID
 *         fromBankName:
 *           type: string
 *           description: Lähtepanga nimi
 *         toBankId:
 *           type: string
 *           description: Sihtpanga ID
 *         toBankName:
 *           type: string
 *           description: Sihtpanga nimi
 *         amount:
 *           type: number
 *           description: Ülekande summa
 *         description:
 *           type: string
 *           description: Ülekande kirjeldus
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Ülekande aeg
 *     TransactionRequest:
 *       type: object
 *       required:
 *         - fromBankId
 *         - toBankId
 *         - amount
 *       properties:
 *         fromBankId:
 *           type: string
 *           description: Lähtepanga ID
 *         toBankId:
 *           type: string
 *           description: Sihtpanga ID
 *         amount:
 *           type: number
 *           description: Ülekande summa
 *         description:
 *           type: string
 *           description: Ülekande kirjeldus
 *     TransactionResponse:
 *       type: object
 *       properties:
 *         transaction:
 *           $ref: '#/components/schemas/Transaction'
 *         fromBankBalance:
 *           type: number
 *           description: Lähtepanga uus bilanss pärast ülekannet
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Veateade
 */

// Pankade API endpoint-id

/**
 * @swagger
 * /api/banks/register:
 *   post:
 *     summary: Registreeri uus pank
 *     tags: [Pangad]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BankRegistrationRequest'
 *     responses:
 *       201:
 *         description: Pank edukalt registreeritud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BankRegistrationResponse'
 *       400:
 *         description: Vale päringu andmed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Serveri viga
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/banks/register', (req, res) => {
  try {
    const { name, apiUrl } = req.body;

    if (!name || !apiUrl) {
      return res.status(400).json({ error: 'Panga nimi ja API URL on kohustuslikud' });
    }

    const banks = readBanks();
    
    // Kontrolli, kas pank sama nimega juba eksisteerib
    const existingBank = banks.banks.find(bank => bank.name === name);
    if (existingBank) {
      return res.status(400).json({ error: 'Sellise nimega pank on juba registreeritud' });
    }

    // Genereeri uus api võti
    const apiKey = uuidv4();

    // Lisa uus pank
    const newBank = {
      id: uuidv4(),
      name,
      apiUrl,
      apiKey,
      balance: 1000, // Algne bilanss
      createdAt: new Date().toISOString()
    };

    banks.banks.push(newBank);
    writeBanks(banks);

    res.status(201).json({
      id: newBank.id,
      name: newBank.name,
      apiKey: newBank.apiKey,
      balance: newBank.balance
    });
  } catch (error) {
    console.error('Viga panga registreerimisel:', error);
    res.status(500).json({ error: 'Serveri viga panga registreerimisel' });
  }
});

/**
 * @swagger
 * /api/banks:
 *   get:
 *     summary: Vaata kõiki registreeritud panku
 *     tags: [Pangad]
 *     responses:
 *       200:
 *         description: Kõik pangad
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bank'
 *       500:
 *         description: Serveri viga
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/banks', (req, res) => {
  try {
    const banks = readBanks();
    // Tagasta piiratud info pankade kohta (ilma API võtmeteta)
    const simplifiedBanks = banks.banks.map(bank => ({
      id: bank.id,
      name: bank.name,
      balance: bank.balance
    }));
    res.json(simplifiedBanks);
  } catch (error) {
    console.error('Viga pankade laadimisel:', error);
    res.status(500).json({ error: 'Serveri viga pankade laadimisel' });
  }
});

/**
 * @swagger
 * /api/banks/{id}:
 *   get:
 *     summary: Vaata ühe panga infot
 *     tags: [Pangad]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Panga ID
 *     responses:
 *       200:
 *         description: Panga info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bank'
 *       401:
 *         description: API võti puudub
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Vale API võti
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Panka ei leitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Serveri viga
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/banks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ error: 'API võti puudub' });
    }

    const banks = readBanks();
    const bank = banks.banks.find(bank => bank.id === id);

    if (!bank) {
      return res.status(404).json({ error: 'Panka ei leitud' });
    }

    // Kontrolli, kas API võti on õige
    if (bank.apiKey !== apiKey) {
      return res.status(403).json({ error: 'Vale API võti' });
    }

    res.json({
      id: bank.id,
      name: bank.name,
      balance: bank.balance
    });
  } catch (error) {
    console.error('Viga panga info laadimisel:', error);
    res.status(500).json({ error: 'Serveri viga panga info laadimisel' });
  }
});

// Ülekannete API endpoint-id

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Tee ülekanne ühelt pangalt teisele
 *     tags: [Ülekanded]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionRequest'
 *     responses:
 *       201:
 *         description: Ülekanne edukalt tehtud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       400:
 *         description: Vale päringu andmed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: API võti puudub
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Vale API võti
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Panka ei leitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Serveri viga
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/transactions', (req, res) => {
  try {
    const { fromBankId, toBankId, amount, description } = req.body;
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ error: 'API võti puudub' });
    }

    if (!fromBankId || !toBankId || !amount) {
      return res.status(400).json({ error: 'Puuduvad vajalikud andmed ülekande tegemiseks' });
    }

    // Kontrolli, et summa on positiivne arv
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Summa peab olema positiivne arv' });
    }

    const banks = readBanks();
    
    // Leia lähtepank
    const fromBank = banks.banks.find(bank => bank.id === fromBankId);
    if (!fromBank) {
      return res.status(404).json({ error: 'Lähtepanka ei leitud' });
    }

    // Kontrolli, kas API võti on õige
    if (fromBank.apiKey !== apiKey) {
      return res.status(403).json({ error: 'Vale API võti' });
    }

    // Leia sihtpank
    const toBank = banks.banks.find(bank => bank.id === toBankId);
    if (!toBank) {
      return res.status(404).json({ error: 'Sihtpanka ei leitud' });
    }

    // Kontrolli, kas lähtepangal on piisavalt raha
    if (fromBank.balance < amount) {
      return res.status(400).json({ error: 'Kontol pole piisavalt raha' });
    }

    // Tee ülekanne
    fromBank.balance -= parseFloat(amount);
    toBank.balance += parseFloat(amount);

    // Salvesta muudatused
    writeBanks(banks);

    // Salvesta ülekanne ajalukku
    const transactions = readTransactions();
    const newTransaction = {
      id: uuidv4(),
      fromBankId,
      fromBankName: fromBank.name,
      toBankId,
      toBankName: toBank.name,
      amount: parseFloat(amount),
      description: description || 'Ülekanne',
      timestamp: new Date().toISOString()
    };

    transactions.transactions.push(newTransaction);
    writeTransactions(transactions);

    res.status(201).json({
      transaction: newTransaction,
      fromBankBalance: fromBank.balance
    });
  } catch (error) {
    console.error('Viga ülekande tegemisel:', error);
    res.status(500).json({ error: 'Serveri viga ülekande tegemisel' });
  }
});

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Vaata kõiki ülekandeid
 *     tags: [Ülekanded]
 *     responses:
 *       200:
 *         description: Kõik ülekanded
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       500:
 *         description: Serveri viga
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/transactions', (req, res) => {
  try {
    const transactions = readTransactions();
    res.json(transactions.transactions);
  } catch (error) {
    console.error('Viga ülekannete laadimisel:', error);
    res.status(500).json({ error: 'Serveri viga ülekannete laadimisel' });
  }
});

/**
 * @swagger
 * /api/transactions/bank/{bankId}:
 *   get:
 *     summary: Vaata ühe panga ülekandeid
 *     tags: [Ülekanded]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: bankId
 *         required: true
 *         schema:
 *           type: string
 *         description: Panga ID
 *     responses:
 *       200:
 *         description: Panga ülekanded
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: API võti puudub
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Vale API võti
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Panka ei leitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Serveri viga
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/transactions/bank/:bankId', (req, res) => {
  try {
    const { bankId } = req.params;
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ error: 'API võti puudub' });
    }

    const banks = readBanks();
    const bank = banks.banks.find(bank => bank.id === bankId);

    if (!bank) {
      return res.status(404).json({ error: 'Panka ei leitud' });
    }

    // Kontrolli, kas API võti on õige
    if (bank.apiKey !== apiKey) {
      return res.status(403).json({ error: 'Vale API võti' });
    }

    const transactions = readTransactions();
    const bankTransactions = transactions.transactions.filter(
      t => t.fromBankId === bankId || t.toBankId === bankId
    );

    res.json(bankTransactions);
  } catch (error) {
    console.error('Viga panga ülekannete laadimisel:', error);
    res.status(500).json({ error: 'Serveri viga panga ülekannete laadimisel' });
  }
});

// Lisa info Swagger UI kohta peamisele veebilehele
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// Serveri käivitamine
app.listen(PORT, () => {
  console.log(`Server töötab pordil ${PORT}`);
  console.log(`Swagger dokumentatsioon on saadaval: http://localhost:${PORT}/api-docs`);
});