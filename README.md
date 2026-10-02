# z3

A planned public informational website with four pages, built with Astro.

## Agreed Plan

- Use Astro to generate a static website.
- Create four pages, each with its own content and URL.
- Decide page names, routes, and content later, when the content is provided.
- Keep editable website content in local Markdown files where practical.
- Keep link collections in structured data files when useful.
- Use shared layouts and styles for consistent navigation and presentation.
- Keep all project-specific files inside this `z3` folder.
- Use a GitHub repository for version history and portability.
- Host the public website on Cloudflare Pages, connected to the GitHub repository.
- Start without a database, login system, or backend.

## File Organization

Once the website is scaffolded, the intended organization is:

```text
z3/
  README.md
  package.json
  package-lock.json
  astro.config.mjs
  .gitignore
  public/
    images/
    downloads/
  src/
    content/
      pages/
    data/
    layouts/
    pages/
    styles/
```

Content, assets, source code, configuration, and the dependency lockfile will be
tracked in Git. Dependencies (`node_modules/`) and generated output (`dist/`)
will stay local but will be ignored by Git once the project is scaffolded.
Credentials and other secrets must never be committed or published.

## Editing and Publishing

1. Edit content and assets locally in VS Code.
2. Preview and check the website locally.
3. Commit the changes and push them to GitHub.
4. Cloudflare Pages builds and publishes changes from the production branch.

The planned Cloudflare Pages build command is `npm run build`, with `dist` as
the output directory. These settings will be confirmed during setup.

Visitors will access the website through a public HTTPS URL. No GitHub account
is required, and the local computer does not need to remain on. A custom domain
is optional and can be added later. The GitHub repository may be private while
the published website remains public.

All published pages and assets must be treated as public information.

## Current Status

The static Astro site includes Home's Three.js car viewer, Goldenrod Racing's
About page, the Lemons Schedule, and Support Us. Source is stored in the personal
GitHub repository at https://github.com/zpbarrell/Z3. Cloudflare account setup and
the first public deployment are still pending.

## Local Development

Use Node 22.22.0, pinned in `.node-version` for Cloudflare builds.

```sh
npm ci
npm run dev
```

On Windows PowerShell, use `npm.cmd` if the script execution policy blocks npm.
Page text lives in `src/content/pages/`. Public photos live in `public/images/`.
The schedule is fetched from the official Lemons site at build time; deployed
dates refresh on rebuild. A fetch failure publishes an official-source fallback.

## Schedule Map

The Schedule uses locally bundled US state boundaries (`us-atlas`) and a D3
Albers USA projection, with no external map tiles or geocoding requests.
Only races starting in 2027 or later are included. Completed races are hidden.
Each event has its own marker; races sharing a track are offset slightly.
Locations are approximate, not navigation directions. On narrow screens, the
map can scroll horizontally; the event list also opens the same detail panel.

Edit `src/data/team-events.json` to choose team races. Add the event ID from the
official event URL (`race/?id=463`, for example) to `selectedEventIds`:

```json
{ "selectedEventIds": ["463"] }
```

This is an example, not a confirmed team entry. The manual selection list starts
empty. `preferredRadius` automatically stars all events within 250 straight-line
miles of central Indianapolis, IN, using approximate track coordinates and
great-circle distance, not driving mileage. Edit its center or `miles` to change
the preference area. Stars indicate team preferences, not confirmed entries.
Preferred events use stars. Events starting within 30 calendar days use red pins
or red stars. Countdown dates use each track's local timezone, refresh every
minute and on tab activation, and do not require a redeploy to change color.
New official event dates still require rebuilding the static site.

Edit `src/data/tracks.json` for course coordinates, timezone, description, and
the official source URL. Descriptions are optional; unavailable notes are stated
explicitly. Add verified facts about turns, elevation, surface, and layout here.
General course notes do not guarantee the race's specific layout. New tracks
without coordinates fail the build rather than silently disappear from the map.

Run `npm run test` (`npm.cmd run test` in PowerShell) for map and date tests.

## Cloudflare Pages Setup

1. Sign in at https://dash.cloudflare.com/.
2. Under Workers & Pages, create a Pages application, not a Worker.
3. Import the GitHub repository `zpbarrell/Z3`. Authorize access to this repository.
4. Select `main` as the production branch and `Astro` as the framework preset.
5. Use `npm run build` as the build command and `dist` as the output directory.
6. Leave the root directory at the repository root (blank).
7. Save and deploy, then check Home, About, Schedule, and Support Us on the public URL.

The static site does not need a Cloudflare adapter, Functions, or a deploy command.
Cloudflare provides an HTTPS `pages.dev` address; a custom domain can be added later.
Pushes to `main` trigger deployment after the Git integration is connected.

Cloudflare Pages limits individual assets to 25 MiB. The original car GLB is
preserved under `assets/models/`, outside `public`, so it is not deployed. The
viewer uses the quantized copy `public/models/bmw-z3-cabriolet/car-web.glb`.
Creator/license credit and disclosure of quantization appear in the viewer.
The web copy remains relatively large and should be optimized further for mobile.

## Next Steps

1. Commit and push the Cloudflare preparation changes after verification.
2. Connect Cloudflare Pages and verify the first public deployment.
3. Add final content, payment details, and an accurate racecar model.