# AI.md

How AI tools were used to build this demo: the prompts that did the most work, and what was rewritten by hand.

- **Before you reuse these prompts:** make sure the Storyblok connector (MCP server) is connected in your AI assistant and has access to the space you want to edit. If it is authorised for a different space, the calls fail with a 403 ("This token does not have access to this space"). The first prompt names the space by ID and region (see the note above it), so the assistant knows which one to use.
- **Assistant:** Claude Code, which handled both the Storyblok MCP work and the React code.
- **Storyblok MCP server:** connected to Claude Code. All content-model and content work below went through it, apart from one empty `game_card` component that I created by hand in the Storyblok UI before the timed session started (see Prompt 1), and the settings listed under "Other hand rewrites".
- **Draft status:** AI output was treated as a draft and checked. Corrections are noted under each prompt and at the end.

## Prompt 1: (MCP-connected) content model

**Note:** replace `<SPACE ID>` and `<REGION>` in the first line of the prompt with your own values. You can find both in your space's **Settings** page in Storyblok.

It describes the final model: `game` is a content type that holds the fields, and `game_card` is a nestable that holds only a reference to a game. My original was different: `game_card` held all the fields, `genre` was a text field and there was no Genre content type. The model changed later (see below). The improved version adds details that came from problems in the build: I've created the name fields even though stories already have a built-in name, but I have some problem using it to render the game card (but I'm sure there is a proper way to do it), "Grid" and "Reference" are spelled out because they are not field types, and the assistant lists and checks the components. I have also asked Claude to revise my prompt to be more effective.

```
Create the following blocks, the space ID is <SPACE ID> and the region is <REGION>

First list the existing components and update any that already exist. Leave the starter components (page, teaser, feature, grid) alone.

Create them in this order. Content types are root components; nestables can only live inside another block.

- Studio (Content Type): name (Text, required), contact (Text), description (Textarea)
- Genre (Content Type): name (Text, required), description (Textarea)
- Game (Content Type):
    name (Text, required), description (Textarea), cover (Image), release date (Text),
    genre: reference to stories, restricted to content type genre, storing the story UUID
    studio: reference to stories, restricted to content type studio, storing the story UUID
- game_card (Nestable): game, a reference restricted to content type game, storing the story UUID
- game_grid (Nestable): columns, a Blocks field that only allows game_card
- games_page (Content Type): body, a Blocks field that only allows game_grid

Name fields: create them even though stories already have a built-in name, because the app reads this field.

When done, list the components and show me each schema, and tell me any choice you made that I did not specify.
```

**What it produced** (from my original prompt, with `game_card` holding all the fields and no Genre part): four components in one pass: `studio`, `game_card`, `game_grid` and `games_page`.

- In the original prompt I've accidentally used "Grid", which are not Storyblok field types. The assistant mapped Grid to a blocks field limited to `game_card`. It also limited `games_page.body` to `game_grid`. Those choices were its own, and they are still in place.
- In the first run `game_card` already existed as an empty component, which I had created by hand in the Storyblok UI before starting, so the create call failed with a 422. The assistant updated it instead.

**What I rewrote by hand, and why:**

- I wanted to reuse `game_card` both for the grid and the "Library Card' showing the game details, but it's nestable, so it could not be its own story. I turned it into a `game` content type, and added a new nestable `game_card` whose only field is a reference to a game. The card gets its name and cover from the referenced game.
- Later I added a `genre` content type, and turned `game.genre` from a text field into a reference, like `studio`.
- The third prompt creates a `platform` Text field to game, this is due to time, but ideally it would be similar to `genre` and `studio`, it's own block referenced by game.

## Prompt 2: (MCP-connected) sample content

The prompt assumes the model from Prompt 1

```
Create 5 games, 5 genres and 5 studios, using the model from the first prompt. Organise them in three folders: Games, Genres and Studios.

Invent fictional names and a one-sentence description for each. Use .example addresses for the studio contacts. Give each game a different genre and a different studio. Set each story's name and its name field to the same value.

For each game create a 300x400 image for the cover, with a different colour scheme. Do not write any text in it: the name, genre and studio are shown as HTML text in the card from the game's own fields, so they must not be part of the image. Leave the alt text empty. If an upload returns a 403, remove the duplicate Content-Type field from the curl command, and upload each file right after requesting it, because the signed link lasts about 10 minutes.

Publish the first 3 games and leave the other 2 as drafts. Publish all genres and studios too.

Create a story called portfolio, of type games_page, at the root (not in a folder). It holds one game_grid with one game_card per game, each pointing at its game. Publish it.

When done, tell me anything you chose that I did not specify.
```

This differs from what I first wrote:

- It asked for 20 games and 15 published but it takes about five minutes to complete. After I saw it working with 20 I reduced to 5.
- The covers are 300x400 gradients with the title on them, generated with a short Python script and uploaded through the MCP's upload tool.
- Since by default the Access Token used is a Preview token all 5 games (published or not) are seen in the public page. This is a known issue and one I'd address in a presentation to show the proper way to set up not only the tokes but also the `version` parameter on `useStoryBlock`

**What I rewrote by hand, and why:**

- It did not ask for the folders, I asked for the folders in a follow-up prompt for organization, then incorporated to this one
- The rule about text in the images was not there and sometimes the image was created with the game name in it, which clashed with the text in the game card.

## Prompt 3: (MCP and frontend) add a platform field

The prompt, in the form I plan to use in the walkthrough. Replace `<SPACE ID>` and `<REGION>` as in Prompt 1:

```
In the space with ID <SPACE ID> and region <REGION>:

Add a Text field called platform to the game content type. Keep all its existing fields.

Give each of the games a platform: PC, Mobile, or Console. For each game, read its current content first and change only the platform field. Republish the games that are currently published, and leave the drafts as drafts.

Then, in the game card on the portfolio page, show the platform as text on a third line, under the genre and studio line, in the same smaller font. Read it from the game's platform field, and do not write it in the image. Do not change the popup.

When done, tell me anything you chose that I did not specify.
```

This is the small change made live with the AI. It touches the model, the content and the card in one go. It has not been run as written, so there is no "what it produced" yet. Why the prompt is worded this way:

- A change to a published game is only a draft change until it is republished, I've decided to re-publish the already public games. This does not impact the demo visually since we're using a Preview Access Token
- The platforms are named, not random, so the result is predictable in a live demo.
- It says where the text goes and that the popup stays as it is, so the assistant does not widen the change.
- I'm creating `platform` as a Text field in `games` so the MCP call does not take longer than needed. Ideally I'd create a Platform block (like `genre` and `studio`) and have `game` store a reference to it, but I wanted the MCP call to be faster for the demo.

## Corrections along the way

- The MCP's ready-made `curl_command` for asset uploads fails with a 403 because it repeats the `Content-Type` field. I removed the duplicate and all 20 uploads then succeeded.
- Renaming `game_card` to `game` silently rewrote the allowed components of `game_grid`. The assistant noticed this when it listed the components again, and changed it back.
- The assistant created components in parallel without first checking whether one already existed.
- The assistant generated the 20 covers with each game's title painted on the image. When I renamed a game, the popup showed the new name but the grid card still showed the old one. We regenerated the covers without text, re-uploaded them and rendered the name from the game's `name` field instead. This prompted the detailing in Prompt 2.
