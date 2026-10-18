# AI-react.md

Although not necessary as per the brief, I decided to add the prompt used to create GamesPage.jsx and LibraryCard.jsx, since this is an integral part of the demo. I asked Claude Code to review and optimize the prompt and this is the version presented here.

- **Before you reuse this prompt:** make sure the Storyblok connector (MCP server) is connected in your AI assistant and has access to the space you want to edit. If it is authorised for a different space, the calls fail with a 403 ("This token does not have access to this space"). The first prompt names the space by ID and region (see the note above it), so the assistant knows which one to use.
- **Assistant:** Claude Code, which handled both the Storyblok MCP work and the React code.
- **Storyblok MCP server:** connected to Claude Code. All content-model and content work below went through it, apart from one empty `game_card` component that I created by hand in the Storyblok UI before the timed session started (see Prompt 1), and the settings listed under "Other hand rewrites".
- **Draft status:** AI output was treated as a draft and checked.find both in your space's **Settings** page in Storyblok.

```ab
## Task
Build the React rendering for the Storyblok `games_page` block in the existing Vite + React 19 project, using `@storyblok/react` and `react-router`. Put components in `src/storyblok/`, register them in `src/main.jsx`, and don't touch the starter components (page, teaser, feature, grid).

## Content model (already in the space)
- `games_page`: `body` (Blocks, only `game_grid`)
- `game_grid`: `columns` (Blocks, only `game_card`)
- `game_card`: `game` (single story reference to a `game`, stored as a story UUID)
- `game`: `name`, `description`, `cover` (asset, `.filename` is the URL), `release_date` (text), `genre` and `studio` (story-UUID references)
- `genre`: `name`, `description`. `studio`: `name`, `contact`, `description`

## Data loading
- UUID references arrive as plain strings. Fetch with `resolve_relations: ['game_card.game', 'game.genre', 'game.studio']` so they become story objects (use `story.content`). Pass the same list to the Visual Editor bridge options.
- Use `version: 'draft'`, as the app already does.
- If a relation can't be resolved (still a string), render a "Game unavailable" placeholder and don't crash.

## Page (`games_page`)
1. The title "Our Portfolio" at the top.
2. Under it, the number of `game_card` blocks in the grid ("5 games", singular for 1).
3. Then the `game_grid`, rendered inside the page.

## Card (`game_card`)
- A `<button>` with the cover as its CSS background image, 3:4 ratio (covers are 300x400).
- Two text lines over a bottom gradient for legibility:
  1. the game's `name` field
  2. `<genre name> - <studio name>`
- Clicking opens the modal.

## Modal
- Use a native `<dialog>` opened with `showModal()`. Style it as a library catalogue card: cream paper, ruled lines, red header rule, typewriter font.
- Show every detail: name, cover, studio, studio contact, genre, release date, description, and the studio and genre descriptions.
- Close on Escape, the × button, and a backdrop click.
- **Don't call `dialog.close()` in the effect cleanup.** The app runs under `StrictMode`, so the effect runs twice and the resulting `close` event would call `onClose` and unmount the dialog immediately. Use `if (!dialog.open) dialog.showModal()` and let unmounting remove the dialog.
- **Centre it on the page.** The project has a global margin reset, so set `position: fixed; inset: 0; margin: auto; height: fit-content` on the dialog.

## Default page (`App.jsx`)
- The root URL loads the story `portfolio`. If that story doesn't exist (the request errors), load `home` instead.
- Any other URL loads its own slug, as it does now.

## Done when
`npx eslint src` is clean and `npx vite build` passes. Then list any choices I didn't specify.
```

## Corrections along the way

- In the original version clicking on the Game Card was not opening the "library card", the reason was `main.jsx` wraps the app in `StrictMode`, which runs every effect twice in development. My modal called `dialog.showModal()` and then `dialog.close()` in its cleanup, so the dialog was opened, closed, and opened again. The `close` event from that first close fired afterwards and called `onClose`, which set `open` back to false. The dialog was unmounted right after it appeared, so it looked like nothing happened.
