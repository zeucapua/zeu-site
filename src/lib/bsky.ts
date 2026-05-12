import { buildAtUri, getRecord, resolveHandle } from "./utils";

let bskyProfileCache: Record<string, BskyProfileResult> = {};

type BskyProfileResult = {
  avatar: { ref: { $link: string }};
  displayName: string;
  handle: string;
}

export async function getBskyProfile(did: string): Promise<BskyProfileResult> {
  if (Object.keys(bskyProfileCache).includes(did)) {
    return bskyProfileCache[did];
  }
  const profile = await getRecord<BskyProfileResult>(buildAtUri(did, "app.bsky.actor.profile", "self"));
  const miniDoc = await resolveHandle(did);
  profile.value.avatar.ref.$link = `${miniDoc.pds}/xrpc/com.atproto.sync.getBlob?did=${miniDoc.did}&cid=${profile.value.avatar.ref.$link}`;

  bskyProfileCache = {...bskyProfileCache, [did]: profile.value};

  return profile.value;
}
