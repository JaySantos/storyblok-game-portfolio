# AI.md

How AI tools were used to build this demo: the prompts that did the most work, and what was rewritten by hand.

- **Assistant:** Claude Code, which handled both the Storyblok MCP work and the React code.
- **Storyblok MCP server:** connected to Claude Code. All content-model and content work below went through it, apart from one component noted below.
- **Draft status:** AI output was treated as a draft and checked. Corrections are noted under each prompt and at the end.

## Prompt 1: (MCP-connected) content model

The prompt, as I wrote it:

```
Create the following blocks in dry_run

- games_page (Content Type)
	- Fields:
		- body (Blocks)

- game_grid (Nestable)
	- Fields:
		- columns (Grid)

- game_card (Nestable)
	- Fields:
		- name (Text)
		- genre (Text)
		- description (Textarea)
		- studio (Reference) - restricted to content type studio
		- cover (Image)
		- release date (Text)

- Studio (Content Type)
	- Fields:
		- name (Text)
		- contact (Text)
		- description (Textarea)
```

**What it produced:** four components in one pass: `studio`, `game_card`, `game_grid` and `games_page`.

- The prompt used "Grid" and "Reference", which are not Storyblok field types. The assistant mapped Grid to a blocks field limited to `game_card`, and Reference to an option field that reads from internal stories filtered to the `studio` content type. It also limited `games_page.body` to `game_grid`. Those choices were its own, and they are still in place.
- `game_card` already existed as an empty component, so the create call failed with a 422. The assistant updated it instead.

**What I rewrote by hand, and why:** the model changed after the assistant noticed a problem with it, not because of the output itself.

- `game_card` was nestable, so it could not be its own story, and I wanted to publish some games and not others. I turned it into a `game` content type, and added a new nestable `game_card` whose only field is a reference to a game. The card gets its name and cover from the referenced game.
- Later I added a `genre` content type, and turned `game.genre` from a text field into a reference, like `studio`.

## Prompt 2: (MCP-connected) sample content

The prompt, as I wrote it:

```
Create 20 games, 5 genres and 5 studios

for each game create a 300x400 image for the game cover, have all games reference a studio

publish 15 of the 20 games
```

I followed up with: spread the 5 drafts across genres and studios, one `games_page` with a grid of 20 cards, and organise everything in folders named Games, Studios and Genres.

**What it produced:** 5 studios, 20 games (4 per genre, 4 per studio) and 5 genre stories, in three folders. Each game has a studio reference and its own cover image. It also made a `portfolio` page with one grid of 20 cards. 15 games are published and 5 are drafts.

- The covers are 300x400 gradients with the title on them, generated with a short Python script and uploaded through the MCP's upload tool.
- All names, descriptions and contact details are invented.
- Published games resolve on the page, and the 5 drafts do not. I checked this against the API, not only by eye.

**What I rewrote by hand, and why:**

- The assistant could not build the prompt as written, because published and draft games need to be stories. It asked, and I made the model change described under Prompt 1.

## Prompt 3: (frontend) card popup

The prompt, as I wrote it:

```
* remove the text field underneath each game, the name of the game is already on the card so it's unnecessary
* When I click on one of the games I want a popup to open with a library card-like window showing all game info, the game cover on the top left Title and genre on the right and the rest of the info underneath it
```

Two follow-ups: "have the pop-up in the center of the screen", and, after I could not edit anything in the Visual Editor, "Can the pop-up be the game story?".

**What it produced:** clicking a cover opens a native `<dialog>` styled as a library card: cover top left, title and genre on the right, then description, release date and studio details underneath. The popup and a new game story page share one `LibraryCard` component.

- A resolved reference is not editable in place in the Visual Editor, so the popup itself cannot be edited from the portfolio page. Opening a game story in the editor shows the same card, and its fields update live.
- The assistant also wrote a small `mode.js` with token and version logic: draft content with a preview token inside the Visual Editor, published content with the public token elsewhere. I removed it on purpose afterwards, to use the draft versus published question as the live change in the walkthrough. The app now reads draft content with the preview token everywhere, in the browser as well as in the Visual Editor.

**What I rewrote by hand, and why:** the popup layout, colours and copy are the assistant's. The centring fix was a second round after the first version.

## Smaller follow-up prompts

- "add to the top of the page a count of cards being shown, so it's easier for users to see the total number of games". The assistant added an "N games" line that counts only the cards that actually render.
- "edit the portfolio page so the game in the grid also shows the genre and studio name in a smaller font under the title". The assistant read both names from the resolved references and added them as a second, smaller line on the card.

## Other hand rewrites

- After switching the code to use the public token everywhere I was seeing a "Loading..." message on the browser and a 403 unauthorized error on the log. I realised I also had to change the parameter in `useStoryblok` to `published` as well.
- I added the Storyblok preview token to `.env`, and set the Visual Editor environment to `https://localhost:5173/` in the Storyblok settings. The assistant does not touch `.env`.

## Corrections along the way

- The MCP's ready-made `curl_command` for asset uploads fails with a 403 because it repeats the `Content-Type` field. I removed the duplicate and all 20 uploads then succeeded.
- Renaming `game_card` to `game` silently rewrote the allowed components of `game_grid`. The assistant noticed this when it listed the components again, and changed it back.
- The assistant created components in parallel without first checking whether one already existed.
- The assistant generated the 20 covers with each game's title painted on the image. When I renamed a game, the popup showed the new name but the grid card still showed the old one. We regenerated the covers without text, re-uploaded them and rendered the name from the game's `name` field instead.
