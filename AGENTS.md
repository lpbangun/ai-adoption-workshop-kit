# Project Working Agreement

## Scope

Build and maintain the fictional AI Adoption Workshop Kit described in `DESIGN.md`. Keep work inside this repository. The lead agent owns integration, product decisions, and final verification.

## Product constraints

- Never imply a real Eliza engagement or use Eliza names, logos, copied assets, or unverifiable brand claims.
- Label all sample data, participant inputs, metrics, outputs, and evidence as fictional.
- Preserve the complete 45-minute workshop arc and group-facilitation context.
- Keep the Practice Coach constrained to workflow practice; do not turn it into an open-ended chatbot.
- Keep live-board contributions anonymous by default and de-identified.
- Surface human-review and escalation boundaries directly in the experience.

## Design and implementation

- Follow `DESIGN.md`; update it when research changes a material design decision.
- Prefer semantic HTML, accessible native controls, visible focus states, responsive CSS, and reduced-motion support.
- Keep interactions demonstrable without external accounts or production data.
- Use original implementation and visual assets.
- Avoid unnecessary dependencies and preserve the initialized project structure.

## Verification

Before handoff, run `npm run lint` and `npm test` (`npm test` includes the production build). Verify the rationale, complete session flow, Practice Coach outputs, edge-case clinic, anonymous live board, fictional labeling, keyboard behavior, and responsive layouts. Record any known limitation rather than disguising it.

## Collaboration

Subagents may take only bounded, non-overlapping research, documentation, testing, or review tasks. They must not overwrite another agent’s work. The lead agent integrates all changes and performs final verification.
