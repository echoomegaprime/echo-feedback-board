# Contributing

Thank you for improving Echo Feedback Board. This is a public, proprietary infrastructure
project: contributions are welcome for review, but repository visibility does not grant a
general use or redistribution license.

## Development path

1. Open an issue describing the behavior being changed.
2. Create a focused branch from current `main`.
3. Add a failing test before changing `authOk`/`timingSafeEqual` or the public-field-picking
   in `handlePublicAPI` -- see SECURITY.md for exactly what's public by design versus
   authenticated-only.
4. Validate before opening a pull request:

   ```powershell
   npm install
   npm test
   ```

5. Open a pull request using the repository template and include exact test output.

## Pull-request requirements

- No secrets (`ECHO_API_KEY`) are included.
- No stubs, placeholders, or self-asserted readiness.
- **Any change to which fields a `/public/*` query selects must be called out explicitly in
  the pull request description** -- the public API is currently careful to exclude
  `author_email` everywhere; a change that reintroduces `SELECT *` on a public route would be
  a real regression.
