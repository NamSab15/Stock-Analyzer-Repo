import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);
// Polyfill ResizeObserver for Recharts ResponsiveContainer in test env
class RO {
	observe() {}
	unobserve() {}
	disconnect() {}
}
global.ResizeObserver = RO;
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
afterEach(() => cleanup());