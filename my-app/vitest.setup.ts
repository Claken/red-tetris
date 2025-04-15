// vitest.setup.ts
import { server } from './src/tests/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());