---
title: Build a Twitter Clone with SvelteKit, Auth.js, and Prisma
description: Learn SvelteKit routing, authentication, and database management with a public post board.
date: "2023-05-01"
draft: false 
link: https://github.com/zeucapua/veranda-app
---

### Table of Contents
- [Prerequisites](#Prerequisites)
- [Installation](#Installation)
- [Project Configuration](#Configuration)
- [Authentication with Auth.js](#Authentication)
- [Databases with Prisma](#Databases) 
- [Dynamic Routing](#Dynamic-Routing) 

## Prerequisites <a name="Prerequisites"></a> 

Before getting started with the installation, we will need a database to store our data in, as well as get our Discord developer 
application ready to use for our OAuth solution. For this tutorial, we will use Railway to spin up a PostgreSQL database. 
You can use other solutions like Supabase (which have their own client library), but since we are going to be using Prisma in this 
tutorial, we just need to connect to a database using a URL, no matter where it is hosted. 

As said earlier, we will use Discord as our OAuth provider, which means we will need the client ID and secret from a Discord 
application. Create an application from the [Discord Developer Page](https://discord.com/developers) using your account.

Keep track of your PostgreSQL `DATABASE_URL`, as well as your Discord `CLIENT_ID` and `CLIENT_SECRET`. They will be stored inside 
our `.env` file, as well as a `AUTH_SECRET` for Auth.js (which you can generate randomly by going to the terminal and typing in
`openssl rand -base64 32`.

With that said, also ensure that you have Node.js and NPM installed. Find the instructions for your OS 
[here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

## Installation <a name="Installation"></a> 

Let's create our SvelteKit project and install our packages (TailwindCSS, DaisyUI, Prisma, and Auth.js) using npm:

```bash
// Skeleton Project, with Typescript, no additional options
npm create svelte@latest veranda-tutorial 

// go inside the project folder
cd veranda-tutorial

// optional CSS-in-JS solution
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install daisyui 

// install Auth.js and Prisma ORM
npm install @auth/core @auth/sveltekit
npm install @prisma/client @next-auth/prisma-adapter
npm install prisma --save-dev
```

## Project Configuration <a name="Configuration"></a> 

After installing our packages, we're going to do some housekeeping before able to actually use them.

### TailwindCSS and DaisyUI 

> This is completely optional. You can use plain CSS or other CSS-in-JS solutions 
(like Bootstrap, Twind, UnoCSS, PicoCSS, etc.) instead.

Inside our project folder, find the `tailwind.config.js` and change the `content` and `plugins` lines to the following:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {}
  },
  plugins: [require("daisyui")]
};
```

This will ensure that Tailwind can find what files to look through when generating CSS styles using class names, as well as 
being able to use the DaisyUI plugin to make styling easier. To actually use it however, we need to create some files.

First, inside your project folder, create a `/src/app.css` file that includes the following:

```css 
@tailwind base
@tailwind components 
@tailwind utilities
```

To use the CSS we just made, create a `/src/routes/+layout.svelte` file that imports it: 

```svelte
<script>
  import "../app.css";
</script>

<slot />
```

Layout files are used to wrap its children pages with shared data and components, and since this `+layout.svelte` file lives in 
the root `routes` folder, it will be used throughout the entire SvelteKit application (unless otherwise specified). Keep this in mind 
if you're using SvelteKit's [advanced layout techniques](https://kit.svelte.dev/docs/advanced-routing#advanced-layouts) 
like `(group)` and `+page@` files. We'll talk more about layouts and pages later on.

### Prisma ORM (Schema and Database Connection)

Next is to ensure we can use our PostgreSQL database with Prisma. Using the terminal, type in `npx prisma init`. This will generate
a new `prisma` folder with a `schema.prisma` file, as well as a `.env` file. First, go inside the `.env` and we will set a few 
variables from before:

```
DATABASE_URL="<from Railway PostgeSQL Database>"
DISCORD_CLIENT_ID="<from Discord Developer Application>"
DISCORD_CLIENT_SECRET="<from Discord Developer Application>"
AUTH_SECRET="<from terminal (openssl rand -base64 32)>"
```

Once that is set, go back to the `/prisma/schema.prisma` file and add a model for our posts:

```prisma
model Post {
  id      String @id @default(cuid())
  content String 
  claps   Int    @default(0)
}
```

We will add more onto this `schema.prisma` file, but for now we just need to create the shape of our `Post` data. We can then 
use `npx prisma format` to ensure that there are no errors in our schema, and then `npx prisma db push` to create a table on our 
PostgreSQL database to hold our `Posts` and generate a Prisma Client that we can use to send and recieve data in our application.

With that said, we need to create said Prisma Client with a `/src/lib/prisma.ts` file that exports one for us to use in other 
parts of our project:

```js
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient(); 
```

Now, whenever we create any changes to our Prisma schema (which is what we are going to do in the next step), always use 
`npx prisma format` and `npx prisma db push` to make sure our application and database are in sync with no errors.

### Auth.js (with PrismaAdapter)

> Please note that Auth.js for SvelteKit is in **experimental** status as of this tutorial. 
There might be changes to the package and API in the future that 
can cause errors that I cannot know now. Keep that in mind when thinking of using Auth.js and know that there are other 
alternatives that you can consider (Auth0, ClerkJS, Authorizer, etc.) that may be more stable.

To start authenticating, let's add more onto our `schema.prisma` file to include all the information from Auth.js.

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_in        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  posts         Post[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Post {
  id        String   @id @default(cuid())
  content   String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  claps     Int @default(0)
}

```

> Due to a current issue with Auth.js, when using Discord (and Google?) as our OAuth provider, using the default schema given
by the documentation will result in an error because of a different naming convention for the expiry duration. Under the 
`Account` model, ensure you have `expires_in` and NOT `expires_at`.

Also note that our `Post` model has changed to be connected to a `User`'s posts field. That way we know who made which posts later 
on in the application. Remember that now we have changed the schema to use `npx prisma format` and `npx prisma db push`.

We are going to be using Auth.js to get a session, but by default it does not include enough `User` information,
more specifically, no ID to refer to. To do so will require us to extend the initial package to include the 
data with a Prisma call. First, we need to create a `types.d.ts` file in our root directory and extend the `Session` type from 
Auth.js to include a ID in connection to the User.

```ts
// shoutout to Coding Garden for types.d.ts and auth handler w/ callbacks
import type {
  Session as OGSession,
  DefaultSession,
} from "@auth/sveltekit/node_modules/@auth/core/types";

// TODO: change package to "@auth/core/types" when fixed. above fixes a bug!

declare module "@auth/sveltekit/node_modules/@auth/core/types" {
  interface Session extends OGSession {
    user?: {
      id : string,
    } & DefaultSession["user"],
  }
}
```

Now with the database shape and type definitions are done, let's actually use Auth.js for authentication by writing a Handle in a 
new `/src/hooks.server.ts` file. SvelteKit will use this file to intercept a request from the client and generates a response. We are 
going to declare the authentication handle separately and then use `sequence()` from SvelteKit to run it. That way you can create 
other Handles in the future and then use in conjunction with what we have by adding to the `sequence()` function.

```ts 
import { SvelteKitAuth } from "@auth/sveltekit";
import Discord from "@auth/core/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { prisma } from "$lib/prisma";
import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } from "$env/static/private";

import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

export const auth = (async (...args) => {
  const [{event}] = args;
  return SvelteKitAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
      Discord({ clientId: DISCORD_CLIENT_ID, clientSecret: DISCORD_CLIENT_SECRET }), 
    ], 
    callbacks: {
      async session({ user, session }) {
        session.user = {
          id: user.id,
          name: user.name,
          image: user.image,
        };

        event.locals.session = session
        return session
      }
    }
  })(...args);
}) satisfies Handle;

export const handle = sequence(auth);
```

There are few things going on here, but let's just highlight a few of them. The `auth` function returns a Handle by `SvelteKitAuth`
that uses the PrismaAdapter that takes in our Prisma client from earlier. Also inside is the Discord provider that requires 
our `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` environment variables, which is being imported using SvelteKit's `$env` module.

To make use of the extended `Session` type definition we made earlier, we ensure that we change the `session()` callback to 
include set the `User` property with the ID and return the session.

With that said, we are done with all the prep work and now we can start making pages happen!

## Authentication with Auth.js <a name="Authentication"></a> 

For this application, we are going to use site-wide authentication so we know the state no matter where we are. That said means we 
are going to use our `/src/routes/+layout.svelte` file from earlier. Before rendering the actual layout component, 
we need to get the current session by using the `load()` function inside a new `/src/routes/+layout.server.ts` file.

```ts 
export async function load({ locals }) {
  const session = await locals.getSession();
  return { session }
}
```

Now that `session` object is now accessible via SvelteKit's `LayoutData` prop inside our `+layout.svelte` component. We can then 
check if there is a user currently logged in, which we can use to render their information as well as a "Sign In" and "Sign Out"
button when appropriate. Those buttons will call the `signIn()` and `signOut()` functions respectively that we will import from 
the Auth.js package:

```svelte 
<script>
  import { signIn, signOut } from "@auth/sveltekit/client";
  import "../app.css";

  export let data;
  const user = data.session?.user;

  let show_menu = false;
</script>

<main class="flex flex-col w-full h-full min-w-screen min-h-screen p-16 gap-8">

  <section class="navbar bg-base-100">
    <div class="flex-1">
      <a href="/">
        <button class="btn btn-ghost normal-case text-white text-2xl font-bold">Veranda</button>
      </a>
    </div>

    <div class="flex-none">
      {#if !user}
        <button on:click={() => signIn("discord")} class="btn btn-primary">
          Log in with Discord
        </button>
      {:else}
        <div class="flex flex-row justify-center gap-8">
          {#if show_menu}
            <button on:click={() => signOut()} class="btn btn-outline btn-error">
              Log out
            </button> 
          {/if}
          <button on:click={() => show_menu = !show_menu} class="btn btn-ghost btn-circle avatar"> 
            <img 
              src={user.image} alt={`${user.name} Profile Picture`} 
              class="w-16 h-16 rounded-full"/>
          </button>
        </div>
      {/if}
    </div>
  </section>

  <slot />

</main>
```

As you can see, conditional rendering of the DOM is easy with Svelte using their `{#if}` blocks. Now this navigation bar is 
available throughout all the pages since its in the root `+layout.svelte` file. 

The cool thing about the `LayoutData` prop is that it is available to its page children by the `$page` store given in SvelteKit.
We can use this to decide whether or not to render a form text input for creating posts in our root `+page.svelte` 
file, which will be our index page, depending on whether there is a user logged in:

```svelte 
<script lang="ts">
  import { page } from "$app/stores";

  const user = $page.data.session?.user;
</script>

{#if user}
  <form method="POST" action="?/createPost">
    <!-- will be implemented -->
  </form>
{/if}
```

## Databases with Prisma <a name="Databases"></a> 

Next, let's actually connect to the database to read and create posts. Most of this will need to import the Prisma client that 
we made in the `/src/lib` directory. 

### Creating Posts with Prisma

First, let's finish the form above for creating our post:

```svelte
{#if user}
  <form method="POST" action="?/createPost" class="flex flex-row gap-8 items-center">
    <img src={user?.image} alt={`${user?.name} Profile Picture`} 
      class="w-0 h-0 md:w-16 md:h-16 md:rounded-full" 
    />
    <input name="content" type="text" placeholder="Say something..." 
      class="grow input input-bordered input-primary" 
    />
  </form>
{/if}
```

Here we have a form with a method of **POST** with the action of **createPost**. Inside is an input tag with the name **content**,
which we can use to grab its value. You can add a button inside the form to submit it, but for now, pressing Enter will do the same.
To use this form, we have to create and export an `actions` variable in a `/src/routes/+page.server.ts` file: 

```ts 
import { prisma } from "$lib/prisma";
import { fail } from "@sveltejs/kit";

export const actions = {
  createPost: async ({ locals, request }) => {
    const data = await request.formData();
    const content = data.get("content");

    const session = await locals.getSession();
    const user = session.user;

    const post = await prisma.post.create({
      data: {
        content,
        user: { connect: { id: user.id } }
      }
    });

    if (!post) { 
      throw fail(
        503, 
        message: "There's been an error when posting. Try again."
      ); 
    }
  },
}
```

Note that the action is named the same from our form, which holds an async function that allows us to access the `locals` 
from our application that has our session, and a `request` parameter that can get our `formData()`. To get the actual input value,
we use `data.get()` with the name of the input tag (e.g. **content**). We then use `locals.getSession()` like we did in our 
`+layout.server.ts` file to get our user. Don't forget to import our Prisma client using the `$lib` module so that we can use it 
to create our post in the database and connect it to the corresponding user. If post returns undefined, that means there was an error 
in our Prisma call, so we can throw a `fail`. We can take that fail and show a message to the user, but for now, it will just 
act like an error.

### Reading Posts with Prisma 

Now that we can create posts, we should actually get the posts, so we can read them in a column in our index page. To get the posts, 
let's go back into our `/src/routes/+page.server.ts` file and add a `load` function that will use our Prisma client and return it:

```ts 
export async function load() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  return { posts };
}
```

The Prisma client call above will have a list posts that is ordered by descending timestamps, as well as the associated user. The data 
is then returned into a JSON object, which can access in our `+page.svelte` file by using its `PageData` with `export let data`:

```svelte 
<script>
  import PostView from "$lib/PostView.svelte";
  export let data;
  const posts = data.posts;
</script>

{#if posts}
  {#each posts as { user, ...post }}
    <PostView {user} {post} />
  {/each}
{/if}
```

Once we get the posts, we use another Svelte `{#if}` block to ensure we will on render when it is available. After, we need to 
turn each element in our **posts** variable into two parts: the **user** and the **post**. The user is already a property, so we 
can declare it separately, but the rest of the properties are a `Post` object, so we use `...post` to put them all in one variable.
Those variables then gets passed as props in a new `PostView` component, which we can declare as a Svelte file in our `lib` 
directory (the same place where our Prisma client lives):

```svelte 
<script lang="ts">
  import { format } from "timeago.js";
  import type { Post, User } from "@prisma/client"

  export let post : Post; 
  export let user : User;

  let duration = format(post.createdAt);
</script>

<div class="flex flex-row gap-8 items-center">
  <a href={`/u/${user.id}`} class="btn btn-ghost btn-circle avatar">
    <img src={user.image} alt={`${user.name}`} class="w-16 h-16 rounded-full" />
  </a>
  <div class="flex flex-col gap-2">
    <a href={`/p/${post.id}`}>
      <p class="text-neutral-400 pb-2">
        <a href={`/u/${user.id}`}>@{user.name}</a>
        | { duration }
      </p>
    </a>
    <p class="text-xl text-white">{post.content}</p>
  </div>
</div>

```

> Above there is a `duration` variable that takes in the **createdAt** property from the post. To format it like 
how it is seen on Twitter, I've installed **timeago.js** (via `npm i timeago.js`) and used its `format()` function.
This is optional, but it does make it easier to render the time. Another option that I haven't explored yet is 
`Intl.RelativeTimeFormat`, so if you don't want to install another package, try that one out!

As you can see above, we are going to be creating new pages for the user and post using their IDs. But before 
getting that done, let's keep working on our `PostView` by adding a *clapping* feature.

### Clapping Posts (aka Likes)

I'll explain the following after we add to our `PostView`:

```svelte 
<script lang="ts">
  import { onMount } from "svelte";
  import { enhance } from "$app/forms";
  // other imports

  // other variables
  let claps : number;

  onMount(() => { claps = post.claps; });

  function onClap() { claps += 1; }
</script>

<div class="flex flex-col gap-8 items-center">
  <!-- the other stuff from before -->
  <div class="flex flex-col gap-2">
    <!-- the other stuff from before -->
    <form method="POST" action="?/clapPost" use:enhance>
      <input name="post_id" type="hidden" value={post.id} />
      <button 
        on:click={onClap}
        class="btn btn-outline btn-secondary rounded-full"
      >
        👏 {#if !claps}...{:else} {claps} {/if}
      </button>
    </form>
  </div>
</div>
```

So first things first, let's address the form. There is a hidden input that carries the **post.id**, which will be 
used to determine, which post to update later on in the action. Next is the new `use:enhance` prop on the form. This 
is from SvelteKit that allows the form to submit, but crucially it doesn't do full-page reloads. We don't want to 
refresh the screen every time we clap a post, so this is a great solution for that. 

But that also means the claps won't update because the Prisma call that finds the post won't rerun. And so to combat
this, we can use `onMount(() => { claps = post.claps })` to hold the count locally to the component when first 
rendering, which we can update everytime we press the form button via the `onClap()` function.

> That's all good, but how can we have a form in a separate component when we need a 
`+page.server.ts` file to create an action? 

Well, as far as I know, since this component is being rendered as a part of the `+page.svelte`, the form will 
find the appropriate action given it's rendered location. With that said let's go to our `/src/routes/+page.server.ts`
file and create that `clapPost` action:

```ts 
export const actions = {
  createPost: ...,
  clapPost: async ({ request }) => {
    const data = await request.formData();
    const post_id = data.get("post_id");

    const post = await prisma.post.update({
      where: { id: post_id },
      data: { claps: { increment: 1 } }
    });

    if (!post) {
      return fail(502, { message: "Cannot clap right now. Try again." });
    }
  }
}
```

## Dynamic Routing <a name="Dynamic-Routing"></a> 

Last thing we can add to our application are dynamic routes to have pages for every post and user. With SvelteKit's 
file-based routing, we can create them in our `src/routes/` folder with brackets, which in our case 
will be under `/u/[id]/+page.svelte` and `/p/[id]/+page.svelte`. We will also add a `+page.server.ts` file under 
each route to get the appropriate data from Prisma based on the dynamic route paramater (`id`). They have similar
code, so I'll put them all below:

### /u/[id]

#### +page.server.ts

```ts 
import { prisma } from "$lib/prisma";
import { error } from "@sveltejs/kit";

export async function load({ params }) {
  const id = params.id; // corresponds to [id]

  const user_data = await prisma.user.findUnique({
    where: { id },
    include: { posts: true },
  });
  
  if (!user_data) { return error(404, "User not found"); }

  const { posts, ...user } = user_data;

  return { user, posts }
}
```

#### +page.svelte

```svelte 
<script>
  import PostView from "$lib/PostView.svelte";
  import type { User, Post } from "@prisma/client";

  export let data;
  const user : User = data.user;
  const posts : Post[] = data.posts;
</script>

<section class="flex flex-row gap-8 items-center">
  <img src={user.image} alt={`${user.name} Profile`} class="w-18 h-18 rounded-full" />
  <p class="text-4xl text-white">@{user.name}</p>
</section>

{#if !posts}
  <p>This user hasn't posted anything yet.</p>
{:else}
  {#each posts as post}
    <PostView {post} {user} />
  {/each} 
{/if}
```

### /p/[id]

#### +page.server.ts 

```ts 
import { prisma } from "$lib/prisma";
import { error } from "@sveltejs/kit";

export async function load({ params }) {
  const id = params.id;

  const post_data = await prisma.post.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!post_data) { return error(404, "Post not found"); }

  const { user, ...post } = post_data;

  return { user, post }
}
```

#### +page.svelte

```svelte
<script lang="ts">
  import PostView from "$lib/PostView.svelte";
  import type { User, Post } from "@prisma/client";

  export let data;
  const post : Post = data.post;
  const user : User = data.user;
</script>

<PostView {user} {post} />
```

## That's all folks

Congratulations, you've completed a full stack SvelteKit application! Built with Auth.js and Prisma allows us to 
create a website with authentication and database manipulation. Thank you if you'd read this far and thanks to 
Theo for the inspiration. Hopefully this information is useful for you to get started with Svelte and SvelteKit. 
To learn more, I recommend joining the Svelte discord and read the official documentation to get all the help you 
might need. 'Till next time :)
