# From content model to page: how a game card gets on screen

If you have never used Storyblok, follow one game card from the CMS to the browser in four steps.

## 1. The content model: blocks

Storyblok content is built from **blocks**. You define each block's fields in the Space, and there are two kinds:

- A **content type** is the top of a page. Here, `games_page` and `game` are content types. Each one becomes a **story**, which is a page-like entry with its own URL. Think of a story as a whole document.
- A **nestable** block is a reusable section that lives inside another block, and never has a page of its own. Here, `game_grid` and `game_card` are nestable. A field holds one value, like a name or a cover image. A nestable groups fields into a section you can add to a page as many times as you like, and reorder. Think of the boxed items on a magazine page, such as an ad or a pull quote: they exist only on a page, and a page can have several.

A `game_card` has only one field: a reference to a `game` story. The name, cover and genre are stored once, on the game.

## 2. The content: JSON

Open the **Content** section in the left menu: the `portfolio` story sits at the top level, next to the Games, Studios and Genres folders. The form on the right of the editor shows the story's data as blocks you can add, reorder and fill in. Behind it, Storyblok stores that same data as JSON, and the API sends this JSON to the frontend. Each block names its own type in `component` (shortened here; the real story has 20 cards):

```json
{
  "component": "games_page",
  "body": [{
    "component": "game_grid",
    "columns": [
      { "component": "game_card", "game": "d85e9da5-…" },
      { "component": "game_card", "game": "674e24c4-…" },
      …
    ]
  }]
}
```

Notice that `game` is only a UUID: the card knows which game it points at, not its name.

## 3. The API: resolving the reference

The frontend reads this JSON from the Content Delivery API. By default it returns the UUID exactly as above. Adding `resolve_relations: ['game_card.game']` tells the API to include the referenced stories as well, and the JavaScript client swaps each UUID for the full game story.

When you fetch **published** content, which is the default and the only option with a public token, a game that is still a draft is not resolved. Its card keeps the plain UUID string. The `GameCard` component checks for that and skips the card.

**Where the code is:** `resolve_relations` is in [`src/App.jsx`](../src/App.jsx), line 9, inside the `useStoryblok` call. The check that skips unresolved cards is in [`src/storyblok/GameCard.jsx`](../src/storyblok/GameCard.jsx), line 13.

## 4. The frontend: one React component per block

In [`src/main.jsx`](../src/main.jsx), the `components` option (line 29) of `storyblokInit` is a map from block name to React component:

```js
components: { games_page: GamesPage, game_grid: GameGrid, game_card: GameCard }
```

`useStoryblok` fetches the story. `StoryblokComponent` renders one block: it reads `component` and finds the matching React component in the map. `GamesPage` and `GameGrid` call `StoryblokComponent` again for their children, so the tree renders itself.

Each component also spreads `storyblokEditable(blok)` onto its element. That adds data attributes so the Visual Editor knows which block you clicked, and can update the page live as you edit.

## The idea in one line

The model decides the shape, the story holds the data, the API delivers it as JSON, and each block maps to one component.
