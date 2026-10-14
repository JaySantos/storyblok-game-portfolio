# HW&T Game Portfolio

A small Storyblok demo: a portfolio of (fictional) indie games financed by HW&T, built with React and Storyblok's `blueprint-core-react` starter. The content model and sample content were created through Storyblok's MCP server using an AI assistant. See [AI.md](AI.md) for how.

## Content model

| Component | Type | Fields |
|---|---|---|
| `games_page` | Content type | `body` (blocks, only `game_grid`) |
| `game_grid` | Nestable | `columns` (blocks, only `game_card`) |
| `game_card` | Nestable | `game` (reference to a `game` story) |
| `game` | Content type | `name`, `genre` (reference), `description`, `studio` (reference), `cover` (image), `release_date` |
| `genre` | Content type | `name`, `description` |
| `studio` | Content type | `name`, `contact`, `description` |

The page renders `games_page` > `game_grid` > `game_card`. A card holds only a reference, so its name and cover come from the referenced `game` story. The frontend asks the API to resolve that reference (`resolve_relations: ['game_card.game', 'game.genre', 'game.studio']` in [src/App.jsx](src/App.jsx)). Games that are not published are not resolved when reading published content, so their cards are skipped in [src/storyblok/GameCard.jsx](src/storyblok/GameCard.jsx).

## Run it

You need a Storyblok space with the content model above. The sample content is not in this repo.

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a `.env` file (it is gitignored) from `.env.example`:

   ```sh
   STORYBLOK_PUBLIC_API_TOKEN=<public access token>
   STORYBLOK_PREVIEW_API_TOKEN=<preview access token>
   STORYBLOK_REGION=eu
   ```

   Find both tokens in **Settings > Access Tokens**. The public token reads published content and is used everywhere. The preview token reads drafts and is only used inside the Visual Editor, and only by the dev server: it is not included in production builds. If you leave it out, the editor falls back to the public token and shows published content.

3. Start the dev server. It runs over HTTPS (a local certificate is created for you), which the Visual Editor requires:

   ```sh
   npm run dev
   ```

   Open <https://localhost:5173/>. The root path shows the `portfolio` story.

### Connect the Visual Editor

1. Go to **Settings > Visual Editor** and set the default environment to `https://localhost:5173/`.
2. Open the `portfolio` story, click **Config** and type `/` in **Real path**.
3. Edit the story in Storyblok. The page updates as you type.

## Scripts

- `npm run dev`: dev server
- `npm run build`: production build
- `npm run lint`: ESLint

Based on Storyblok's [blueprint-core-react](https://github.com/storyblok/blueprint-core-react) starter.
