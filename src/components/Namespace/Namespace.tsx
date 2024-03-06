import { createContext, useContext } from 'react'

export const NamespaceContext = createContext<string[] | undefined>(undefined);

export type NamespaceProps = {
  namespace: string
  children: any
}

export const Namespace = ({ namespace, children }: NamespaceProps) => {
  const ctx = useContext(NamespaceContext);
  const ns = ([] as string[]).concat(ctx ?? []).concat([namespace]);
  return (
    <NamespaceContext.Provider value={ns}>
      {children}
    </NamespaceContext.Provider>
  );
}
