import { dateToString } from './';

export function rpc(name: string, args: any, result: string) {
  console.log(`[${dateToString(new Date())}]`, `<${name}>`, args, '=>', result);
}

export function sse(path: string, payload: object | string) {
  console.log(`[${dateToString(new Date())}]`, `<${path}>`, JSON.stringify(payload));
}