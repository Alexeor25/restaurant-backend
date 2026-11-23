import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🔥 Servidor en puerto ${PORT}`);
});

server.on('error', (error) => {
  console.error('Error en el servidor:', error);
});


process.on('SIGINT', () => {
  console.log('👋 Cerrando servidor...');
  server.close(() => process.exit(0));
});
