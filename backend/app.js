import fs from "node:fs/promises";

import bodyParser from "body-parser";
import express from "express";

const app = express();

app.use(express.static("images"));
app.use(bodyParser.json());

// CORS

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all domains
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Middleware per estrarre l'userId dal token
const getUserId = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  
  const token = authHeader.split(' ')[1]; // Bearer TOKEN
  if (!token) return null;

  try {
    // In un'app reale, qui decodificheremmo il JWT
    // Per semplicità, usiamo il token come userId
    return token;
  } catch {
    return null;
  }
};

app.get("/places", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const fileContent = await fs.readFile("./data/places.json");
  const placesData = JSON.parse(fileContent);
  res.status(200).json({ places: placesData });
});

app.get("/user-places", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: 'Non autorizzato' });
  }

  try {
    // Crea la directory user-places se non esiste
    await fs.mkdir('./data/user-places', { recursive: true });
    
    // Prova a leggere i places dell'utente
    try {
      const fileContent = await fs.readFile(`./data/user-places/${userId}.json`);
      const places = JSON.parse(fileContent);
      res.status(200).json({ places });
    } catch (error) {
      // Se il file non esiste, restituisci un array vuoto
      if (error.code === 'ENOENT') {
        res.status(200).json({ places: [] });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nel recupero dei places' });
  }
});

app.put("/user-places", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: 'Non autorizzato' });
  }

  const placeId = req.body.placeId;
  if (!placeId) {
    return res.status(400).json({ message: 'placeId mancante' });
  }

  try {
    // Leggi il place dalla lista completa
    const fileContent = await fs.readFile("./data/places.json");
    const placesData = JSON.parse(fileContent);
    const place = placesData.find((place) => place.id === placeId);

    if (!place) {
      return res.status(404).json({ message: 'Place non trovato' });
    }

    // Crea la directory user-places se non esiste
    await fs.mkdir('./data/user-places', { recursive: true });

    // Leggi i places dell'utente o inizializza un array vuoto
    let userPlaces = [];
    try {
      const userPlacesContent = await fs.readFile(`./data/user-places/${userId}.json`);
      userPlaces = JSON.parse(userPlacesContent);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    // Aggiungi il nuovo place se non è già presente
    if (!userPlaces.find(p => p.id === placeId)) {
      userPlaces.push(place);
      await fs.writeFile(
        `./data/user-places/${userId}.json`,
        JSON.stringify(userPlaces)
      );
    }

    res.status(200).json({ userPlaces });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nel salvataggio del place' });
  }
});

app.delete("/user-places/:id", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: 'Non autorizzato' });
  }

  try {
    // Leggi i places dell'utente
    const userPlacesContent = await fs.readFile(`./data/user-places/${userId}.json`);
    let userPlaces = JSON.parse(userPlacesContent);

    // Rimuovi il place
    userPlaces = userPlaces.filter(place => place.id !== req.params.id);
    
    // Salva il nuovo array
    await fs.writeFile(
      `./data/user-places/${userId}.json`,
      JSON.stringify(userPlaces)
    );

    res.status(200).json({ userPlaces });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nella rimozione del place' });
  }
});

// Registrazione utente
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username e password richiesti' });
  }

  try {
    const fileContent = await fs.readFile("./data/users.json");
    const users = JSON.parse(fileContent);

    if (users.find(user => user.username === username)) {
      return res.status(400).json({ message: 'Username già in uso' });
    }

    const newUser = {
      id: Math.random().toString(36).slice(2),
      username,
      password // In un'app reale, la password andrebbe hashata
    };

    users.push(newUser);
    await fs.writeFile("./data/users.json", JSON.stringify(users));

    res.status(201).json({ message: 'Utente registrato con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nella registrazione' });
  }
});

// Login utente
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username e password richiesti' });
  }

  try {
    const fileContent = await fs.readFile("./data/users.json");
    const users = JSON.parse(fileContent);

    const user = users.find(
      user => user.username === username && user.password === password
    );

    if (!user) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    // In un'app reale, qui genereremmo un JWT
    res.status(200).json({
      token: user.id,
      userId: user.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nel login' });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trovata' });
});

app.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
