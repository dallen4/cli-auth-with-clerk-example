import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { Server, Socket } from 'net';
import { LOCALHOST_AUTH_PORT } from '../constants';

const PATH = '/';

// Force destroy server + open connections
const createDestroy = (server: Server) => {
  const connections: Socket[] = [];
  server.on('connection', (c) => connections.push(c));

  return () => {
    connections.forEach((c) => c.destroy());
    server.close();
  };
};

export const createLocalAuthServer = async () => {
  let authToken: string | null = null;

  const app = new Hono();

  const server = serve({
    fetch: app.fetch,
    port: LOCALHOST_AUTH_PORT,
  });

  const destroyServer = createDestroy(server);

  const listenForAuthRedirect = () =>
    new Promise((resolve, reject) => {
      if (!server.listening) server.listen();

      server.addListener('close', () => {
        resolve(authToken);
      });

      app.use(PATH, async (_, next) => {
        await next();
        process.nextTick(() => destroyServer());
      });

      app.get(PATH, (c) => {
        const code = c.req.query('token') as string;

        authToken = code;

        return c.html(
          <div>
            <h1 class="">
              You're all set!
            </h1>
            <h2 class="">
              You can safely close this tab and return to your
              terminal
            </h2>
          </div>,
        );
      });
    }) as Promise<string | null>;

  return { listenForAuthRedirect };
};
