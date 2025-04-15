import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  rest.get('/api/room', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ roomId: 'testRoom', players: [] })
    );
  }),
);