# AI Adoption Workshop Kit — Design Direction

## Product intent

This is an original, fictional workshop prototype for a hypothetical non-technical People, operations, or enablement team that already uses an AI-assisted knowledge and intake workflow. It is not an Eliza client engagement, does not use Eliza logos or visual assets, and must label all sample participants, inputs, outputs, evidence, and metrics as fictional.

The experience should help a facilitator run a complete 45-minute group session:

- 0–4 minutes: rationale and session launch
- 4–8 minutes: workflow framing
- 8–12 minutes: safe-use orientation
- 12–25 minutes: adaptive AI Practice Coach
- 25–35 minutes: edge-case clinic
- 35–42 minutes: anonymous live learning board
- 42–45 minutes: commitments and close

## Experience principles

1. **Operational before ornamental.** The first viewport explains why the workshop is structured around practice, review boundaries, and feedback loops.
2. **Constrained guidance.** The Practice Coach is a workflow-specific prompt lab, not an open-ended chatbot. It returns prompt structure, targeted follow-up questions, response-review cues, and escalation flags.
3. **Safe by design.** Human-review expectations appear in the workflow itself, especially around sensitive employee data, consequential recommendations, unsupported claims, and policy exceptions.
4. **Group learning without exposure.** Live-board contributions are anonymous by default and use fictional, de-identified examples. Shared themes are clustered for discussion rather than ranked as individual performance.
5. **Actionable evidence.** Reflections connect to enablement actions and a fictional product-feedback backlog.

## Visual system

The intended editorial character is executive-readable, high-signal, and operationally concrete: strong typographic hierarchy; a clear problem → action → evidence progression; restrained color; generous whitespace; compact evidence cards; and purposeful interaction states. The implementation must remain visually original.

Planned palette:

- warm off-white canvas
- near-black ink
- deep teal for action and progress
- coral for escalation and attention
- soft chartreuse for evidence and positive learning signals
- cool gray-blue for secondary surfaces

Typography should pair a distinctive editorial display face with a highly legible sans-serif UI face, while preserving robust system fallbacks. The prototype uses Fraunces for display and Source Sans 3 for UI. Avoid generic dashboard chrome, glossy gradients, excessive pills, and decorative visual noise.

## Public-reference validation and uncertainty

Public reference review was completed on July 30, 2026 against Eliza’s case-study index and three current public case studies:

- [Case studies index](https://eliza.com/case-studies)
- [10,000-user ChatGPT rollout](https://eliza.com/case-studies/10-000-user-chatgpt-rollout-for-a-global-private-equity-firm)
- [Global internal automation agents](https://eliza.com/case-studies/global-internal-automation-agents-for-a-50bn-cpg)
- [Accelerating agentic engineering](https://eliza.com/case-studies/accelerating-agentic-engineering-with-codex-at-rootstrap)

Verified editorial patterns include outcome-oriented titles; compact client/time/users facts; a scannable Problem → Solution → Results sequence; named operational workstreams; lifecycle and evaluation language; and takeaways that connect evidence to the next operating decision. This prototype adapts those general editorial ideas through an original session-facts strip, Problem → Practice action → Learning evidence rationale, visible workflow gates, and an observed/suggested/owner-oriented feedback backlog.

The reference capture does not reliably establish exact palette, spacing, grid, card treatment, or image style. Although the public HTML currently loads several font families, that is not sufficient evidence to emulate a brand typography system. The prototype therefore uses its own palette, type treatment, interaction patterns, and assets and makes no claims about Eliza’s exact visual brand.

## Accessibility and responsive behavior

- Maintain semantic landmarks, visible keyboard focus, adequate contrast, and 44px minimum touch targets.
- Do not rely on color alone for status or escalation.
- Respect `prefers-reduced-motion`.
- Keep the session timeline and controls usable on narrow screens.
- Announce dynamic coach and live-board updates with appropriate live regions.

## Acceptance checks

- Prototype runs from the project folder.
- App is mountable at the branded subpath `/ai-adoption-workshop-kit` through an external reverse proxy, with asset URLs and metadata routed under that path and no change to the workshop visual identity.
- Full 45-minute group flow is navigable and understandable.
- Practice Coach interaction demonstrably returns all four constrained output types.
- Edge-case clinic includes selectable scenarios and facilitator prompts.
- Anonymous live board accepts a fictional reflection, clusters themes, and updates the product-feedback backlog.
- Rationale titled “Why this workshop is designed this way” is present.
- All data and metrics are visibly labeled fictional.
- Responsive and accessible behavior is verified.
- Relevant tests and production build pass.
- Final visual inspection is completed at desktop and mobile widths.

## Verification record

Completed July 30, 2026:

- `npm run lint` passed.
- `npm test` passed, including the production build and rendered-capability checks.
- Headless browser interaction checks exercised the constrained coach, the no-source escalation state, reflection submission, theme clustering, and the newly generated fictional backlog item without console or page errors.
- Visual inspection passed at 1440 × 1000 and 390 × 844. The opening rationale, coach output, and live-board states were reviewed; no horizontal overflow was detected at either width.
- The social preview was generated as an original project asset and inspected for the required title, fictional label, palette alignment, and absence of client or Eliza branding.
