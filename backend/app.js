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

app.get("/places", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  //res.status(500).json();

  const fileContent = await fs.readFile("./data/places.json");

  const placesData = JSON.parse(fileContent);

  res.status(200).json({ places: placesData });
});

app.get("/user-places", async (req, res) => {
  const fileContent = await fs.readFile("./data/user-places.json");

  const places = JSON.parse(fileContent);

  res.status(200).json({ places });
});

app.put("/user-places", async (req, res) => {
  const placeId = req.body.placeId;

  const fileContent = await fs.readFile("./data/places.json");
  const placesData = JSON.parse(fileContent);

  const place = placesData.find((place) => place.id === placeId);

  const userPlacesFileContent = await fs.readFile("./data/user-places.json");
  const userPlacesData = JSON.parse(userPlacesFileContent);

  let updatedUserPlaces = userPlacesData;

  if (!userPlacesData.some((p) => p.id === place.id)) {
    updatedUserPlaces = [...userPlacesData, place];
  }

  await fs.writeFile(
    "./data/user-places.json",
    JSON.stringify(updatedUserPlaces)
  );

  res.status(200).json({ userPlaces: updatedUserPlaces });
});

app.delete("/user-places/:id", async (req, res) => {
  const placeId = req.params.id;

  const userPlacesFileContent = await fs.readFile("./data/user-places.json");
  const userPlacesData = JSON.parse(userPlacesFileContent);

  const placeIndex = userPlacesData.findIndex((place) => place.id === placeId);

  let updatedUserPlaces = userPlacesData;

  if (placeIndex >= 0) {
    updatedUserPlaces.splice(placeIndex, 1);
  }

  await fs.writeFile(
    "./data/user-places.json",
    JSON.stringify(updatedUserPlaces)
  );

  res.status(200).json({ userPlaces: updatedUserPlaces });
});

// Registrazione utente
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    let users = [];
    try {
      const fileContent = await fs.readFile("./data/users.json", 'utf8');
      users = JSON.parse(fileContent);
    } catch (error) {
      // Se il file non esiste o è vuoto, continuiamo con un array vuoto
      console.log('Users file not found or empty, creating new one');
    }

    // Verifica se l'utente esiste già
    if (users.find((user) => user.username === username)) {
      return res.status(422).json({ message: "Username already exists" });
    }

    // Crea nuovo utente
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      password, // Nota: in un'app reale, la password dovrebbe essere criptata
    };

    users.push(newUser);
    await fs.writeFile("./data/users.json", JSON.stringify(users));

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Could not save user." });
  }
});

// Login utente
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const fileContent = await fs.readFile("./data/users.json", 'utf8');
    const users = JSON.parse(fileContent || '[]');

    const user = users.find(
      (user) => user.username === username && user.password === password
    );

    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // In un'app reale, dovresti generare un vero JWT token
    const token = Math.random().toString(36).substr(2);
    res.status(200).json({
      token,
      userId: user.id,
    });
  } catch (error) {
    res.status(500).json({ message: "Authentication failed" });
  }
});

// 404
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  res.status(404).json({ message: "404 - Not Found" });
});

app.listen(3000);
