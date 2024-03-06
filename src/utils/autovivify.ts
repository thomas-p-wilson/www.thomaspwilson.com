export const autovivify = (obj: any, path: string[], value: any): any => {
  if (path.length > 1) {
    // Go another level deeper
    const [key, ..._path] = path;
    return {
      ...obj,
      [key!]: autovivify(obj[key!] ?? {}, _path, value)
    }
  }

  return {
    ...obj,
    [path[0]!] : value
  }
};

export const get = (obj: any, path: string[]): any => {
  if (!obj) {
    return undefined;
  }

  if (path.length > 1) {
    const [key, ..._path] = path;
    return get(obj[key!], _path);
  }

  return obj[path[0]!];
}
