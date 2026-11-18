// constraint: tsconfig.json sets types to [] so that no Node.js declaration reaches the library; the tests declare here
// the part of node:vm they call.
declare module 'node:vm' {
	type Context = Record<string, unknown>;

	export function createContext(contextObject?: Context): Context;
	export function runInContext(code: string, contextifiedObject: Context, options?: {timeout?: number}): unknown;
}
