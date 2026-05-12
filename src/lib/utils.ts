export const CONSTELLATION = "https://constellation.microcosm.blue";
export const SLINGSHOT = "https://slingshot.microcosm.blue";

export type Ref = {
  uri: string;
  cid: string;
}

export type MiniDoc = {
  did: string;
  handle: string;
  pds: string;
  signing_key: string;
  avatar?: string;
  displayName?: string;
};

export type ConstellationRecords = {
  did: string;
  collection: string;
  rkey: string;
}[];

export function buildAtUri(did: string, collection: string, rkey: string) {
  return `at://${did}/${collection}/${rkey}`;
}

export async function getBacklinks(subject: string, source: string) {
  const response = await fetch(`${CONSTELLATION}/xrpc/blue.microcosm.getBacklinks?subject=${subject}&source=${encodeURIComponent(source)}`, {
    headers: { "Accept": "application/json" }
  });
  
  const { total, cursor, records } = await response.json() as {
    total: number,
    cursor: string | null,
    records: ConstellationRecords 
  };
  
  return { total, cursor, records };
}

export type GetDistinctDidsResult = {
 total: number;
 linking_dids: string[]; 
 cursor: string | null;
}

export async function getDistinctDids(target: string, collection: string, path: string) {
  const url = new URL(`${CONSTELLATION}/links/distinct-dids`);
  url.searchParams.set("target", target);
  url.searchParams.set("collection", collection);
  url.searchParams.set("path", path);

  const response = await fetch(url);
  const json = await response.json() as GetDistinctDidsResult;
  return json;
}

export async function getRecord<T>(at_uri: string) {
  const response = await fetch(`${SLINGSHOT}/xrpc/blue.microcosm.repo.getRecordByUri?at_uri=${at_uri}`);
  const json = await response.json() as Ref & { value: T };

  return json;
}

let handleCache: Record<string, MiniDoc> = {};

export async function resolveHandle(handle: string) {
  if (Object.keys(handleCache).includes(handle)) {
    return handleCache[handle];
  }

  const url = new URL(`${SLINGSHOT}/xrpc/blue.microcosm.identity.resolveMiniDoc`);
  url.searchParams.set("identifier", handle);

  const response = await fetch(url);
  const miniDoc = await response.json() as MiniDoc;

  return miniDoc;
}
