import { createNamespace } from 'cls-hooked';

export interface RequestContextStore {
  traceId?: string;
  userId?: string;
  email?: string;
}

const REQUEST_NAMESPACE = 'app:request';
export const requestContext = createNamespace(REQUEST_NAMESPACE);

export class RequestContext {
  static run(fn: () => void) {
    requestContext.run(() => {
      requestContext.set('store', {} satisfies RequestContextStore);
      fn();
    });
  }

  static set<K extends keyof RequestContextStore>(key: K, value: RequestContextStore[K]) {
    const store = requestContext.get('store') as RequestContextStore | undefined;
    if (store) {
      store[key] = value;
    }
  }

  static get<K extends keyof RequestContextStore>(key: K): RequestContextStore[K] | undefined {
    const store = requestContext.get('store') as RequestContextStore | undefined;
    return store?.[key];
  }
}
