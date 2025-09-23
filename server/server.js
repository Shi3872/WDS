const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.post('/api/validate', (req, res) => {
  const { word, guess } = req.body; // get the word being guessed and the letter guessed from player
  if (!word || !guess) return res.status(400).json({ ok: false });

  const matches = [];

  for (let i = 0; i < word.length; i++) // loop through the letters of the word
    if (word[i] === guess) matches.push(i); // match it to guess

  res.json({ ok: true, matches }); // return matches
});

app.listen(PORT, () => {
  console.log(`Hangman server running at http://localhost:${PORT}`);
});
