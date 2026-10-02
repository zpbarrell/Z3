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

Planning only. The Astro project has not been scaffolded, and hosting has not
been configured. This README is intended to be the first tracked project file.

## Next Steps

1. Initialize the local Git repository and commit this README.
2. Connect the local repository to GitHub and verify that a push succeeds.
3. Scaffold Astro directly in this folder, preserving this README.
4. Create four pages and a shared layout, with content supplied later.
5. Connect Cloudflare Pages and verify the public deployment.