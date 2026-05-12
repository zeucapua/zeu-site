import { getBskyProfile } from "./bsky";
import { getDistinctDids, resolveHandle } from "./utils";

export async function getConnections(did: string) {
  const { total, linking_dids } = await getDistinctDids(did, "at.youandme.connection", ".subject");
  const list = [];
  for (const did of linking_dids) {
    const profile = await getBskyProfile(did);
    list.push(profile);
  }

  return { total, list };
}
