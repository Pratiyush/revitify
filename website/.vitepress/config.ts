import { defineConfig } from "vitepress";

// The revitify documentation site. Pages double as the canonical docs; `pnpm docs:build`
// emits a static, deployable site to website/.vitepress/dist.
export default defineConfig({
  title: "Revitify",
  description:
    "Native-TypeScript code knowledge graph — turn any codebase into a queryable graph of nodes and links, fully offline.",
  lang: "en-US",
  cleanUrls: true,
  lastUpdated: true,
  appearance: true, // dark toggle stays available; light is forced as the first-visit default ↓
  head: [
    // Light mode by default for first-time visitors. The theme toggle still works and persists,
    // this only sets the initial preference when none is stored yet.
    [
      "script",
      {},
      "try{var k='vitepress-theme-appearance';if(!localStorage.getItem(k))localStorage.setItem(k,'light')}catch(e){}",
    ],
  ],
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started", activeMatch: "/guide/" },
      { text: "Concepts", link: "/guide/concepts" },
      { text: "Languages", link: "/guide/languages" },
      { text: "Library", link: "/guide/library" },
      { text: "Design", link: "/guide/architecture" },
      { text: "Contribute", link: "/contributing" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Getting started",
          items: [
            { text: "Quickstart & tutorial", link: "/guide/getting-started" },
            { text: "CLI & queries", link: "/guide/cli" },
          ],
        },
        {
          text: "Understand the graph",
          items: [
            { text: "How nodes work", link: "/guide/concepts" },
            { text: "Languages (Java & more)", link: "/guide/languages" },
            { text: "Architecture & design", link: "/guide/architecture" },
          ],
        },
        {
          text: "Build with it",
          items: [
            { text: "Use as a library", link: "/guide/library" },
            { text: "Troubleshooting", link: "/guide/troubleshooting" },
          ],
        },
      ],
    },
    search: { provider: "local" },
    outline: "deep",
    socialLinks: [{ icon: "github", link: "https://github.com/Pratiyush/revitify" }],
    footer: {
      message:
        "MIT-licensed. Concepts adapted from graphify (MIT); original TypeScript implementation.",
      copyright: "© 2026 Pratiyush Kumar Singh",
    },
  },
});
