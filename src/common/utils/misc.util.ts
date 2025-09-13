import * as util from 'util';

export const consoleDepth = (message: string, value: any) =>
  console.log(message, util.inspect(value, { depth: null }));
