import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🔥 Servidor en puerto ${PORT}`);
});

server.on('error', (error) => {
  console.error('Error en el servidor:', error);
});

// Cierre elegante: al recibir Ctrl+C cerramos el servidor limpiamente.
process.on('SIGINT', () => {
  console.log('👋 Cerrando servidor...');
  server.close(() => process.exit(0));
});
