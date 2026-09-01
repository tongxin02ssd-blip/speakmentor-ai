import app from './app';

const port = Number(process.env.PORT) || 3001;

app.listen(port, () => {
  console.log(`SpeakMentor AI backend is running at http://localhost:${port}`);
});