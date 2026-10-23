// identity.js — the site's mark: one Lucide glyph, as the paths of its 24-unit viewBox, drawn in each
// palette's accent on its tint. The build keeps the tab's icon, the browser's colour and the splash in
// the palette shown (`siteIdentity` in vite.config.js), and `npm run icons` writes the fixed artwork in
// the default palette under public/. Replace the glyph with the one that says what the site is, copied
// from Lucide's source (a `<rect>`, `<line>` or `<circle>` written as a path; a filled path as
// `{ d, fill: true }`). An Android app of the site (tks-shell's new-app.sh) adds
// `android: "android/res"` and `androidPalettes: true`, and its launcher icon is drawn here too.

export default {
  // Lucide's app-window.
  mark: [
    "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
    "M10 4v4",
    "M2 8h20",
    "M6 4v4",
  ],
};
