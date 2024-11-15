<script lang="ts">
  import { Dialog } from "bits-ui";
  import { fade } from "svelte/transition";
</script>

<Dialog.Root>
  <Dialog.Trigger>
    Menu 
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay transition={fade} class="fixed inset-0 z-50 bg-black/80" />
    <Dialog.Content
      class="bg-neutral-800 fixed left-[50%] top-[50%] z-50 w-full max-w-[94%] translate-x-[-50%] translate-y-[-50%] rounded-card-lg border bg-background p-5 shadow-popover outline-none sm:max-w-[490px] md:w-full"
    >
      <nav id="navigation" class="flex flex-col gap-4 w-full md:col-span-1"> 

        <section class="flex flex-col gap-2 text-white">
          <h3 class="text-yellow-500">socials</h3>
          <a href="https://bsky.app/profile/zeu.dev" target="_blank" class="after:content-['_↗']">bluesky</a>
          <a href="https://github.com/zeucapua" target="_blank" class="after:content-['_↗']">github</a>
          <a href="https://twitch.tv/zeu_dev" target="_blank" class="after:content-['_↗']">twitch</a>
          <a href="https://twitter.com/zeu_dev" target="_blank" class="after:content-['_↗']">twitter</a>
        </section>

        <hr class="border-yellow-500 " />

        <section class="flex flex-col gap-2 text-white">
          <h3 class="text-yellow-500">
            <a href="/blog" class="after:content-['_->']">blog</a>
          </h3>
        </section>

        <hr class="border-yellow-500 " />

        <section class="flex flex-col gap-2 text-white">
         <h3 class="text-yellow-500">
            <a href="/resume" class="after:content-['_->']">resume</a>
          </h3>
          <h3 class="text-yellow-500">
            <a href="/open-source" class="after:content-['_->']">open source</a>
          </h3>
          <a href="https://app.opensauced.pizza" target="_blank" class="after:content-['_↗']">OpenSauced</a>
          <a href="https://easytodo.link" target="_blank" class="after:content-['_↗']">easytodo.link</a>
        </section>
      </nav>
      <Dialog.Close
        class="absolute right-5 top-5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-98"
      >
        x
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
