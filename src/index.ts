import cluster from 'cluster';
import os from 'os';
import App from './app';

const isClusterEnabled = false;

if (cluster.isPrimary && isClusterEnabled) {
  const numCPUs = os.cpus().length;

  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, _code, _signal) => {
    console.log(`Worker ${worker.process.pid} died, restarting...`);
    cluster.fork();
  });
} else {
  // This will start your Fastify server on each worker
  App();
}
