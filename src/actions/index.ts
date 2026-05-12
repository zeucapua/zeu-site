import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";
import { getPdsAgent } from "@fujocoded/authproto/helpers";
import { TID } from "@atproto/common-web";

export const server = {
  sendChatMessage: defineAction({
    accept: "form",
    input: z.object({
      message: z.string().optional()
    }),
    handler: async (input, context) => {
      console.log({ input });
      const loggedInUser = context.locals.loggedInUser;
      if (!loggedInUser) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You're not logged in!"
        });
      }

      const agent = await getPdsAgent({ loggedInUser });
      if (!agent) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong when connecting to your PDS."
        });
      }

      try {
        const record = await agent.com.atproto.repo.createRecord({
          repo: loggedInUser.did,
          collection: "place.stream.chat.message",
          rkey: TID.nextStr(),
          record: {
            text: input.message,
            createdAt: new Date().toISOString(),
            streamer: "did:plc:gotnvwkr56ibs33l4hwgfoet",
            $type: "place.stream.chat.message"
          }
        });
        console.log(record);
      }
      catch (e) {
        console.error(e);
        console.log("EWRROR");
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong with posting your status to your PDS!"
        })
      }
    }
  }),
}
