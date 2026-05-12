import { buildAtUri, getDistinctDids, getRecord, resolveHandle, type MiniDoc } from "./utils";

type ATFProfileResult = {
  avatar: { ref: { $link: string }};
  displayName: string;
}

export async function getATFProfile(did: string): Promise<ATFProfileResult> {
  const profile = await getRecord<ATFProfileResult>(buildAtUri(did, "com.atprotofans.profile", "self"));
  return profile.value;
}

type GetSupportersResult = {
  total: number;
  list: MiniDoc[];
}

let supportersCache: Record<string, MiniDoc> = {};

export async function getSupporters(did: string): Promise<GetSupportersResult> {
  const { total, linking_dids } = await getDistinctDids(did, "com.atprotofans.supporter", ".subject");

  const list = [];
  for (const did of linking_dids) {
    const miniDoc = await resolveHandle(did);
    const profile = await getATFProfile(did);
    miniDoc.avatar = `${miniDoc.pds}/xrpc/com.atproto.sync.getBlob?did=${miniDoc.did}&cid=${profile.avatar.ref.$link}`;
    miniDoc.displayName = profile.displayName;
    supportersCache = {...supportersCache, [did]: miniDoc};
    list.push(miniDoc);
  }

  return { total, list };
}
