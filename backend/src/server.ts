import app from './app';
import { assertDeepSeekConfigured } from './services/deepSeekConfig';

const port = Number(process.env.PORT) || 3001;

assertDeepSeekConfigured();

app.listen(port, () => {
  console.log(`SpeakMentor AI backend is running at http://localhost:${port}`);
});
