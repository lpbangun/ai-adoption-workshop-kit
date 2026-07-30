# AI Adoption Workshop Kit

An interactive, fictional 45-minute group workshop for a hypothetical non-technical People, operations, or enablement team already using an AI-assisted knowledge and intake workflow.

[Open the live workshop](https://ai-adoption-workshop-kit.logsam-fans-triple3.chatgpt.site)

The prototype includes:

- a concise adoption rationale and complete timed facilitator flow
- workflow framing and explicit safe-use boundaries
- a constrained AI Practice Coach with prompt structure, follow-up questions, review cues, and escalation flags
- an edge-case clinic for sensitive data, policy conflicts, and consequential decisions
- an anonymous live learning board with theme clustering and a fictional product-feedback backlog

No real client, employee, or engagement data is used. This is not an Eliza engagement and uses no Eliza logo or visual assets.

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

Open the local URL printed by the development server.

## Verify

```bash
npm run lint
npm test
```

`npm test` runs a production build and checks the rendered rationale plus all required interactive capabilities.

See `DESIGN.md` for the product, visual, accessibility, and reference-validation decisions.
