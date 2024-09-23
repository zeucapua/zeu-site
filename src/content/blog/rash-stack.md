---
title: "The RASH Stack: React, Astro, Svelte, HTMX"
description: Strap a horse on a rocket and use Astro Partials to stream UI components via HTMX.
date: "2024-09-10"
draft: true
link: https://github.com/zeucapua/
---

## The Project

I'm building a Notion-like note taking system that'll (probably) make me more productive with as
little fluff and features as possible. Each block can be added, edited, and deleted freely, with
the full page data is saved locally. 

For the features to demo the RASH stack, we are making:
- Plain text (Astro + HTMX)
- Checkbox (Svelte)
- Whiteboard (React via tldraw library)

## What is HTMX?

The basic idea behind HTMX is that APIs should return HTML that shows the updated part of the page 
after a request. For example, let's make a button that adds our feature, simple plain text input:

```html
<h1>Hodgepodge App</h1>
<ul id="blocks">

</ul>

<button 
    hx-post="/addTextBlock"
    hx-target="#blocks"
    hx-swap="beforeend"
>
    Text
</button>
```

The button has a few new attributes to use HTMX: `hx-post` specifies a `POST` API request
at the endpoint `/addTextBlock`; `hx-target` is to determine what element we want to update;
`hx-swap` tells us how we should handle the HTML after the response, in this case adding the 
response before the button. Now the endpoint can return HTML like so...

```html
<li><textarea /></li>
```

And on the button press, the initial page will now be:

```html
<h1>Hodgepodge App</h1>
<ul id="blocks">
    <li><textarea /></li>
</ul>

<button 
    hx-post="/addTextBlock"
    hx-target="#blocks"
    hx-swap="beforeend"
>
    Text
</button>
```

While we will be using more attributes during the rest of the blog, there are plenty more
I can't possibly go over. To find more information on the list of attributes and HTMX in 
general, go to [htmx.org](https://htmx.org) or read their book 
[Hypermedia Systems](https://hypermedia.systems) which is free online, but you can be cool 
like me and get the physical book:

# TODO: ADD PHOTO OF HYPERMEDIA SYSTEMS 

## Astro Partials

Since we are using Astro as our meta framework, we can use its feature **Astro Partials** in 
conjunction with HTMX for a smooth developer experience. It allows Astro components inside the 
`/src/pages` directory to be easily called via its endpoint and returned as HTML.

For the example above, the only thing needed is for the Lemon to be in the 
`/src/pages/addTextBlock.astro` file with one extra line in the *Component Script* (the code 
inside the frontmatter like section ran on the server):

```astro
---
export const partial = true;
---
<li><textarea /></li>
```

Now we can use this page via HTMX under the `/revealSecret` endpoint, like the example above!

## Forms and Values via Astro Partials

Swapping HTML is all fine and dandy, but if we want to do more, we can leverage existing
hypermedia controls to extend functionality like the `<form>` and `<input>` elements.

## Streaming in Client Components as Astro Islands

## Using the HTMX Javascript API 
