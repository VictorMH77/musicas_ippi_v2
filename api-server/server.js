
// Backend Node.js que funciona como ponte para Appwrite
// Hospede no Vercel, Railway ou Render (todos grátis)

const express = require('express');
const cors = require('cors');
const { Client, Account, Databases, ID, Query } = require('node-appwrite');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do Appwrite
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '692ef75c002bbb970dbe';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY; // Você vai adicionar isso no Render
const DATABASE_ID = 'igreja_musicas';

const COLLECTIONS = {
  MUSICAS: 'musicas',
  PLAYLISTS: 'playlists',
  PLAYLIST_MUSICAS: 'playlist_musicas',
};

// Middleware
app.use(cors({
  origin: '*', // Permite todas as origens (inclusive Figma)
  credentials: true
}));
app.use(express.json());

// Inicializar cliente Appwrite (servidor)
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const account = new Account(client);
const databases = new Databases(client);

// ========================================
// ROTAS DE AUTENTICAÇÃO
// ========================================

// Criar conta
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const user = await account.create(
      ID.unique(),
      email,
      password,
      name
    );
    
    // Criar sessão automaticamente após registro
    const session = await account.createEmailPasswordSession(email, password);
    
    res.json({ user, session });
  } catch (error) {
    res.status(error.code || 500).json({ 
      error: error.message,
      type: error.type 
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const session = await account.createEmailPasswordSession(email, password);
    
    res.json({ session });
  } catch (error) {
    res.status(error.code || 500).json({ 
      error: error.message,
      type: error.type 
    });
  }
});

// Logout
app.post('/api/auth/logout', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    await account.deleteSession(sessionId);
    
    res.json({ success: true });
  } catch (error) {
    res.status(error.code || 500).json({ 
      error: error.message,
      type: error.type 
    });
  }
});

// Obter usuário atual
app.get('/api/auth/user', async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'];
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'No session token' });
    }
    
    // Criar cliente com sessão do usuário
    const userClient = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setSession(sessionToken);
    
    const userAccount = new Account(userClient);
    const user = await userAccount.get();
    
    res.json({ user });
  } catch (error) {
    res.status(error.code || 500).json({ 
      error: error.message,
      type: error.type 
    });
  }
});

// Recuperação de senha
app.post('/api/auth/recovery', async (req, res) => {
  try {
    const { email } = req.body;
    const redirectUrl = req.body.redirectUrl || 'http://localhost:3000/reset-password';
    
    await account.createRecovery(email, redirectUrl);
    
    res.json({ success: true });
  } catch (error) {
    res.status(error.code || 500).json({ 
      error: error.message,
      type: error.type 
    });
  }
});

// ========================================
// ROTAS DE MÚSICAS
// ========================================

// Listar músicas
app.get('/api/musicas', async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'];
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'No session token' });
    }
    
    const userClient = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setSession(sessionToken);
    
    const userDatabases = new Databases(userClient);
    
    const response = await userDatabases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MUSICAS
    );
    
    res.json(response);
  } catch (error) {
    res.status(error.code || 500).json({ 
      error: error.message,
      type: error.type 
    });
  }
});

// Criar música
app.post('/api/musicas', async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'];
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'No session token' });
    }
    
    const userClient = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setSession(sessionToken);
    
    const userDatabases = new Databases(userClient);
    
    const musica = await userDatabases.createDocument(
      DATABASE_ID,
      COLLECTIONS.MUSICAS,
      ID.unique(),
      req.body
    );
    
    res.json(musica);
  } catch (error) {
    res.status(error.code || 500).json({ 
      error: error.message,
      type: error.type 
    });
  }
});

// Atualizar música
app.put('/api/musicas/:id', async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'];
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'No session token' });
    }
    
    const userClient = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setSession(sessionToken);
    
    const userDatabases = new Databases(userClient);
    
    const musica = await userDatabases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.MUSICAS,
      req.params.id,
      req.body
    );
    
    res.json(musica);
  } catch (error) {
    res.status(error.code || 500).json({ 
      error: error.message,
      type: error.type 
    });
  }
});

// Deletar música
app.delete('/api/musicas/:id', async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'];
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'No session token' });
    }
    
    const userClient = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setSession(sessionToken);
    
    const userDatabases = new Databases(userClient);
    
    await userDatabases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.MUSICAS,
      req.params.id
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(error.code || 500).json({ 
      error: error.message,
      type: error.type 
    });
  }
});

// ========================================
// ROTAS DE PLAYLISTS
// ========================================

// Listar playlists
app.get('/api/playlists', async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'];
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'No session token' });
    }
    
    const userClient = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setSession(sessionToken);
    
    const userDatabases = new Databases(userClient);
    
    const response = await userDatabases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PLAYLISTS,
      [Query.orderDesc('$createdAt')]
    );
    
    res.json(response);
  } catch (error) {
    res.status(error.code || 500).json({ 
      error: error.message,
      type: error.type 
    });
  }
});

// Criar playlist
app.post('/api/playlists', async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'];
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'No session token' });
    }
    
    const userClient = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setSession(sessionToken);
    
    const userDatabases = new Databases(userClient);
    
    const playlist = await userDatabases.createDocument(
      DATABASE_ID,
      COLLECTIONS.PLAYLISTS,
      ID.unique(),
      req.body
    );
    
    res.json(playlist);
  } catch (error) {
    res.status(error.code || 500).json({ 
      error: error.message,
      type: error.type 
    });
  }
});

// Obter playlist específica
app.get('/api/playlists/:id', async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'];
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'No session token' });
    }
    
    const userClient = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setSession(sessionToken);
    
    const userDatabases = new Databases(userClient);
    
    const playlist = await userDatabases.getDocument(
      DATABASE_ID,
      COLLECTIONS.PLAYLISTS,
      req.params.id
    );
    
    res.json(playlist);
  } catch (error) {
    res.status(error.code || 500).json({ 
      error: error.message,
      type: error.type 
    });
  }
});

// ========================================
// ROTAS DE PLAYLIST_MUSICAS
// ========================================

// Listar músicas de uma playlist
app.get('/api/playlist-musicas/:playlistId', async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'];
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'No session token' });
    }
    
    const userClient = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setSession(sessionToken);
    
    const userDatabases = new Databases(userClient);
    
    const response = await userDatabases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PLAYLIST_MUSICAS,
      [
        Query.equal('playlist_id', req.params.playlistId),
        Query.orderAsc('ordem')
      ]
    );
    
    res.json(response);
  } catch (error) {
    res.status(error.code || 500).json({ 
      error: error.message,
      type: error.type 
    });
  }
});

// Adicionar música à playlist
app.post('/api/playlist-musicas', async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'];
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'No session token' });
    }
    
    const userClient = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setSession(sessionToken);
    
    const userDatabases = new Databases(userClient);
    
    const playlistMusica = await userDatabases.createDocument(
      DATABASE_ID,
      COLLECTIONS.PLAYLIST_MUSICAS,
      ID.unique(),
      req.body
    );
    
    res.json(playlistMusica);
  } catch (error) {
    res.status(error.code || 500).json({ 
      error: error.message,
      type: error.type 
    });
  }
});

// ========================================
// HEALTH CHECK
// ========================================

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'API funcionando!',
    appwrite: APPWRITE_API_KEY ? 'configurado' : 'não configurado'
  });
});

// ========================================
// INICIAR SERVIDOR
// ========================================

app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
  console.log(`📡 Endpoint: http://localhost:${PORT}`);
  console.log(`✅ CORS habilitado para todas as origens`);
  
  if (!APPWRITE_API_KEY) {
    console.log('⚠️  ATENÇÃO: APPWRITE_API_KEY não configurada!');
    console.log('   Configure a variável de ambiente antes de fazer deploy');
  }
});

module.exports = app;

