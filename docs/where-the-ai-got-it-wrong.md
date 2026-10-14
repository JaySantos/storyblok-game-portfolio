# Where the AI got Storyblok wrong (and where it got it right)

Claude Code, connected to Storyblok's MCP server, built most of this demo. These notes cover three places where it got something wrong or could not help, followed by two places where it got something right. Each wrong-note says what happened step by step, how it was noticed, what the real cause was, what is still unverified, and what would have stopped it. Times are local (BST) from the session log.

## 1. The "ready-to-use" upload command fails as given

### What happened

Uploading an image through the MCP is a three-step flow:

1. The `upload_asset` tool creates the asset record in Storyblok and returns the details of a signed upload to Amazon S3: the target URL, a list of form fields (`acl`, `Cache-Control`, `Content-Type`, `key`, a base64 `policy`, and the `x-amz-*` signature fields), and a `curl_command` that is meant to do the upload for you. The tool describes it as "ready-to-use" for environments with shell access, naming Claude Code.
2. The file is posted to S3 with that command.
3. The `upload_asset_finish` tool tells Storyblok the file has arrived.

The generated `curl_command` contains `-F "Content-Type=image/png"` twice: once near the top, with the other form fields, and once again right before the `file=` line. Everything else in it is correct.

### How it was noticed

At about 12:03, for the first cover of the timed session, the assistant ran the command exactly as returned. S3 answered **HTTP 403**. It then ran the same command, with the same signed values copied from the same response, but without the second `Content-Type` line. S3 answered **HTTP 204**, and `upload_asset_finish` then succeeded. After that the assistant wrote a small helper script that posts the same fields without the duplicate, and the other 39 uploads (20 covers, then 20 text-free replacements, minus the one used for this test) all returned 204.

There was a trap here. In an earlier, untimed test in another space, the very first upload had also returned a 403, but that time the cause was the assistant's own mistake: it had retyped the long signed policy by hand and dropped characters. When it then copied the policy correctly and dropped the duplicate in the same retry, the upload worked, and at that point nobody could tell which of the two changes had mattered. That is why the timed session ran the test again with only one variable changed. Without it, the duplicate could easily have been blamed wrongly, or missed.

### What is not known

The upload command was run with its response body discarded, so the actual S3 error message for the duplicate case was never read. The conclusion that the duplicate causes the failure rests on the before/after result, not on an error message. It was tested on one file.

### Related details found along the way

- The tool's `next_step` text says the signed URL "expires after approximately 30-60 minutes". The signed policy itself, once decoded, expires **10 minutes** after it was issued (for example, a request at 11:03:40 UTC carried an expiry of 11:13:40 UTC). This matters when you upload many files, as the command and the finish call have to happen inside that window.
- Searching the MCP for "upload asset" did not return the upload tools. It returned only asset-folder operations. The upload tools exist as separate top-level tools, so finding them depends on the client listing them.
- Because the signed values are long, the assistant had to copy them from the tool output into a command for every upload. Copying them wrongly produces the same 403 as the duplicate-field problem, so the two failures look identical from the outside.

### What would have stopped it

On Storyblok's side: removing the duplicate field from the generated command, a note in `next_step`, or an automated test that runs the generated command. On the assistant's side: when an upload fails, test one hypothesis at a time before choosing a cause.

## 2. Renaming a component silently changed another component

### What happened

The first version of the model had `game_card` as a nestable block that held a game's name, cover, genre and so on. That could not work for "create 20 games and publish 15 of them", because only stories can be published (see "Where it got it right" below). So the decision was to turn that component into a content type called `game` and add a **new** nestable `game_card` whose only field is a reference to a game.

At about 12:00 the assistant did this in two steps:

1. It renamed the existing `game_card` to `game` and made it a content type, using `updateComponent` with `update_content=true`. The tool describes that parameter as: "If true, rename component references in existing stories".
2. It created a brand-new nestable component, also called `game_card`.

The `game_grid` component has a field called `columns`, which is limited to a list of allowed components (a "whitelist"). Before the rename, that list was `["game_card"]`.

### The side effect

When the rename ran, Storyblok also rewrote that list in `game_grid` to `["game"]`. This is visible in the timestamps: `game_grid` was last updated in the same second as the rename. Reading the new list: it now allowed `game`, which is a content type and cannot be nested inside another block, and it did not allow the new `game_card`. In the editor, that would have left a grid that could not take any cards. The assistant did not test what the editor would have shown.

The response to the rename call only described the renamed component. It did not mention `game_grid` or say that anything else had changed.

### How it was noticed

Only because the assistant listed all the components again after creating the new `game_card`, as a check. It saw the changed list, and put it back to `["game_card"]` with a second `updateComponent` call about 17 seconds later.

### Why it happened

It is probably not a bug. A rename that updates every reference to the old name is a reasonable thing for Storyblok to do. The surprise comes from the two details together: the description only mentions stories, not other components' schemas, and the old name was immediately reused for a different component. In that situation "follow the rename" is exactly what is *not* wanted. The assistant also chose to pass the flag; it could have left it off.

### What is not known

There were no stories yet when the rename ran, so it is not known whether `update_content=true` would also have changed story content, which is what the tool's own description suggests.

### What would have stopped it

On Storyblok's side: documenting that a rename also updates allowed-component lists in other components, or returning a list of everything that changed. On the assistant's side: after any rename, list the components that refer to the old name, and avoid reusing a name for a different component; create the new one under a new name, then move things over.

## 3. Content baked into generated images

### What happened

Jay's prompt for the content asked for 20 games, each with its own 300x400 cover image. The assistant generated the covers with a short Python script, and drew the game's title (in large white text) and its genre (in small capitals) onto every image, on top of a coloured gradient. They were uploaded and attached to the games as the `cover` field. Games also had separate `name` and `genre` fields, and the `name` was shown on the page. So the title existed in more places than anyone had asked for.

After that, Jay asked for the text under each card to be removed, since "the name of the game is already on the card". That was true: the name on the card was the one painted on the image. At that point the card name was no longer a real piece of text at all.

### How it was noticed

At about 13:40, Jay renamed "Ember Descent" to "Ember Descent 2: Ember Descenter" in the Storyblok editor. The popup, which draws its heading from the `name` field, showed the new name. The grid card still showed "Ember Descent". The assistant checked the data and found:

- The game's `name` field held the new name.
- The cover was still the old image, which had "Ember Descent" in its pixels.
- The cover's alt text, which the assistant had set to "Cover art for Ember Descent" when uploading, was also stale.
- Storyblok's own story title (a separate field from the `name` field in the model) still said "Ember Descent".

So one game's name existed in four places: the story title, the `name` field, the alt text, and the image. Only one of them was being rendered from the field.

### Why it matters beyond this case

The cause was not a quirk of Storyblok. It was a modelling mistake: treating text that an editor can change as part of a picture. Storyblok stores an image as a static file, so changing a field can never reach the pixels. A CMS-driven site depends on one source of truth for each piece of content, and a generated image with text on it quietly creates a second source. The alt text made a third. The MCP's own description of `createComponent` also warns not to add a `name` field to a component, because the story already has a built-in name; Jay's prompt did, and the API accepted it, which is how the duplicate story title came about.

### The fix

1. The assistant regenerated all 20 covers as plain art, with no text, and uploaded them through the MCP.
2. Before updating any story, it fetched the current draft content of all 20 games, so Jay's rename would not be overwritten. Only the new cover and an empty alt text were changed, so the card falls back to the game's current name.
3. It updated the 20 stories, keeping 15 published and the 5 drafts as drafts.
4. The card now draws the name, and later also the genre and studio, as real text over the bottom of the image.
5. It moved the 20 old text covers to Storyblok's trash, after checking that no story still referenced them. They are in the trash, not permanently deleted.

This took roughly 10 minutes of the timed session. The story title of "Ember Descent" was left as it was, since it is not shown on the page.

### What would have stopped it

A rule in the project instructions, which would apply to every future image the assistant generated: "anything an editor can change must come from a field, never from an image." Storyblok's modelling guidance could say the same, with an example of text drawn over an image from a field. And for the assistant, a prompt for an image that has to carry a title should be a reason to ask where the title lives.

## Where it got it right

### It read "columns (Grid)" correctly

Jay's content-model prompt listed `game_grid` with a field `columns (Grid)`. Storyblok has no "Grid" field type: the tool's own list of allowed field types (`bloks`, `text`, `textarea`, `richtext`, `option`, `asset`, and so on) has nothing called grid. The assistant worked out what was meant by looking at the starter's own `grid` component, whose `columns` field is a `bloks` field. It created `columns` as a blocks field, limited to `game_card`, and wrote that interpretation down as a choice for Jay to check, instead of asking or guessing silently. It treated "Reference" the same way, mapping it to an option field that reads from stories filtered to the `studio` content type. Both worked and the Visual Editor confirmed them.

### It spotted that nestable blocks cannot be published one by one

Jay then asked for 20 games, with 15 of them published. The assistant stopped before building anything. It pointed out that `game_card` was a nestable block, and nestable blocks live inside a page rather than being stories of their own, so they cannot be published or left as drafts one at a time. Only a story can. It offered options instead of guessing, and Jay was not sure about the difference between a content type and a nestable block, so it explained that too. The design that came out of that discussion was Jay's decision: turn the card into a `game` content type, so each game is a story that can be published or left as a draft, and add a new nestable `game_card` that points at a game. That is the structure used now. Had the assistant built 20 embedded cards without asking, "publish 15 of the 20" could not have been met, and the model would have needed rebuilding after all the content was made.

## What else worked well

The content model, 5 studios, 5 genres, 20 games with images and the portfolio page were all created through the MCP in about 20 minutes. The references resolved to exactly the published games when checked with `resolve_relations`, and changing a card's reference in the Visual Editor updated the page live on the first try.
