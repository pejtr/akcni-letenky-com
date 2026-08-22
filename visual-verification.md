## Homepage UX verification

- Homepage loaded successfully on the current preview.
- Destination filter rendered with unique country options and selected `Thajsko` correctly reduced the offer grid to one matching card (`Bangkok`).
- Price sort selector rendered and accepted `Cena: od nejnižší` while the selected destination filter remained active.
- Footer newsletter section is implemented in the page markup and uses the existing public newsletter mutation.
- Top-flight and dynamic map teaser loading states use the shared `skeleton-shimmer` class.

Mobile verification at 390px width completed successfully: the homepage remains scrollable, the offer filter controls stack responsively, offer cards stay within the viewport, and the footer newsletter block is present without horizontal overflow.
