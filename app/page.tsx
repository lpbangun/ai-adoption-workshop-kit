"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Stage = {
  id: string;
  nav: string;
  title: string;
  range: string;
  minute: number;
};

type Reflection = {
  id: number;
  text: string;
  theme: "Review gaps" | "Prompt context" | "Escalation";
};

type BacklogItem = {
  id: string | number;
  priority: string;
  title: string;
  owner: string;
};

const stages: Stage[] = [
  { id: "why", nav: "Why", title: "Workshop rationale", range: "0–4", minute: 0 },
  { id: "frame", nav: "Frame", title: "Workflow framing", range: "4–8", minute: 4 },
  { id: "safe", nav: "Boundaries", title: "Safe-use orientation", range: "8–12", minute: 8 },
  { id: "coach", nav: "Practice", title: "AI Practice Coach", range: "12–25", minute: 12 },
  { id: "clinic", nav: "Clinic", title: "Edge-case clinic", range: "25–35", minute: 25 },
  { id: "board", nav: "Learn", title: "Live learning board", range: "35–42", minute: 35 },
  { id: "close", nav: "Close", title: "Commitments & close", range: "42–45", minute: 42 },
];

const startingReflections: Reflection[] = [
  {
    id: 1,
    text: "I need a clear owner when a policy source conflicts with a manager’s request.",
    theme: "Escalation",
  },
  {
    id: 2,
    text: "Naming the audience and source made the draft much more usable.",
    theme: "Prompt context",
  },
  {
    id: 3,
    text: "The review checklist caught a confident statement that was not in the source.",
    theme: "Review gaps",
  },
  {
    id: 4,
    text: "I would pause when an intake includes health or performance details.",
    theme: "Escalation",
  },
  {
    id: 5,
    text: "A good prompt needs the decision the reader should make next.",
    theme: "Prompt context",
  },
  {
    id: 6,
    text: "We need a final check for names, dates, links, and policy versions.",
    theme: "Review gaps",
  },
];

const startingBacklog: BacklogItem[] = [
  {
    id: "policy-owner",
    priority: "P1",
    title: "Surface policy-owner metadata when two sources conflict.",
    owner: "Knowledge product",
  },
  {
    id: "source-recency",
    priority: "P2",
    title: "Add source-recency cues to the intake drafting step.",
    owner: "Product + People Ops",
  },
  {
    id: "review-card",
    priority: "P3",
    title: "Publish a five-point review card inside the team playbook.",
    owner: "Enablement",
  },
];

const clinicCases = [
  {
    label: "Sensitive detail",
    title: "A manager includes medical context in an onboarding request.",
    signal: "Restricted personal data",
    move: "Pause AI drafting. Remove the sensitive detail and route the request to the approved People partner.",
    question: "What is the minimum context needed to move the work forward safely?",
  },
  {
    label: "Policy conflict",
    title: "The draft combines two policy pages with different effective dates.",
    signal: "Source conflict",
    move: "Do not reconcile the policies by inference. Flag both sources and ask the policy owner to confirm the current version.",
    question: "Which source is authoritative, and who has the authority to decide?",
  },
  {
    label: "High-stakes request",
    title: "The intake asks whether an employee should receive a performance warning.",
    signal: "Consequential recommendation",
    move: "Do not ask AI to make or justify the decision. Escalate to the accountable People leader with the original evidence.",
    question: "Where should AI support stop and accountable human judgment begin?",
  },
];

const safetyCards = [
  {
    key: "source",
    title: "Ground in approved sources",
    copy: "Name the current knowledge source and do not let the model fill a policy gap.",
  },
  {
    key: "minimize",
    title: "Minimize personal data",
    copy: "Use only the context needed for the task; remove sensitive or identifying detail.",
  },
  {
    key: "review",
    title: "Review before action",
    copy: "A person checks claims, tone, dates, names, links, and the requested next step.",
  },
  {
    key: "escalate",
    title: "Escalate the exceptions",
    copy: "Pause for policy conflict, sensitive data, consequential decisions, or unclear ownership.",
  },
];

const classifyReflection = (text: string): Reflection["theme"] => {
  const lower = text.toLowerCase();
  if (/(escalat|sensitive|policy|owner|pause|risk)/.test(lower)) {
    return "Escalation";
  }
  if (/(prompt|context|audience|source|format|goal)/.test(lower)) {
    return "Prompt context";
  }
  return "Review gaps";
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
};

export default function Home() {
  const [activeStage, setActiveStage] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(45 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [checkedBoundaries, setCheckedBoundaries] = useState<string[]>([]);
  const [draft, setDraft] = useState(
    "Write a reply to a manager asking how to onboard a contractor next Monday.",
  );
  const [audience, setAudience] = useState("Manager");
  const [source, setSource] = useState("Contractor onboarding guide");
  const [coachRun, setCoachRun] = useState(false);
  const [activeCase, setActiveCase] = useState(0);
  const [caseRevealed, setCaseRevealed] = useState(false);
  const [reflections, setReflections] = useState<Reflection[]>(startingReflections);
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>(startingBacklog);
  const [reflectionText, setReflectionText] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!timerRunning || secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, secondsLeft]);

  const progress = ((45 * 60 - secondsLeft) / (45 * 60)) * 100;

  const themeCounts = useMemo(() => {
    return ["Review gaps", "Prompt context", "Escalation"].map((theme) => ({
      theme,
      count: reflections.filter((reflection) => reflection.theme === theme).length,
    }));
  }, [reflections]);

  const changeStage = (index: number) => {
    setActiveStage(index);
    setCaseRevealed(false);
    window.setTimeout(() => mainRef.current?.focus({ preventScroll: true }), 0);
  };

  const startWorkshop = () => {
    setTimerRunning(true);
    changeStage(1);
  };

  const submitReflection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = reflectionText.trim();
    if (!text) return;
    const theme = classifyReflection(text);
    setReflections((current) => [
      ...current,
      { id: Date.now(), text, theme },
    ]);
    setBacklogItems((current) => [
      {
        id: Date.now(),
        priority: "NEW",
        title: `Review newly clustered ${theme.toLowerCase()} signal: “${
          text.length > 76 ? `${text.slice(0, 76)}…` : text
        }”`,
        owner: theme === "Escalation" ? "Product + People Ops" : "Enablement",
      },
      ...current,
    ]);
    setReflectionText("");
    setSubmitted(true);
    window.setTimeout(() => setSubmitted(false), 2600);
  };

  return (
    <div className="site-shell">
      <a className="skip-link" href="#workshop-stage">
        Skip to workshop
      </a>

      <header className="topbar">
        <a className="wordmark" href="#" aria-label="Fieldwork home">
          <span className="wordmark-mark" aria-hidden="true">
            FW
          </span>
          <span>Fieldwork</span>
        </a>
        <div className="topbar-center" aria-label="Prototype status">
          <span className="status-dot" aria-hidden="true" />
          Fictional workshop prototype
        </div>
        <div className="timer-control">
          <span className="timer" aria-label={`${formatTime(secondsLeft)} remaining`}>
            {formatTime(secondsLeft)}
          </span>
          <button
            className="icon-button"
            type="button"
            onClick={() => setTimerRunning((running) => !running)}
            aria-label={timerRunning ? "Pause session timer" : "Start session timer"}
          >
            {timerRunning ? "Pause" : "Start"}
          </button>
        </div>
        <div className="time-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
      </header>

      <div className="workspace">
        <aside className="session-rail" aria-label="Workshop agenda">
          <div className="rail-heading">
            <strong>AI adoption, in practice</strong>
            <span>45-minute field kit</span>
          </div>
          <nav>
            <ol className="stage-list">
              {stages.map((stage, index) => (
                <li key={stage.id}>
                  <button
                    className={`stage-button ${activeStage === index ? "active" : ""}`}
                    type="button"
                    onClick={() => changeStage(index)}
                    aria-current={activeStage === index ? "step" : undefined}
                  >
                    <span className="stage-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="stage-label">
                      <strong>{stage.nav}</strong>
                      <small>{stage.range} min</small>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          <div className="rail-note">
            <span>Working agreement</span>
            <p>Practice with fictional inputs. Pause when human judgment is required.</p>
          </div>
        </aside>

        <main
          id="workshop-stage"
          className="main-stage"
          ref={mainRef}
          tabIndex={-1}
        >
          <div className="mobile-stage-nav" aria-label="Current workshop stage">
            <button
              type="button"
              onClick={() => changeStage(Math.max(0, activeStage - 1))}
              disabled={activeStage === 0}
              aria-label="Previous stage"
            >
              ←
            </button>
            <span>
              {activeStage + 1} / {stages.length} · {stages[activeStage].nav}
            </span>
            <button
              type="button"
              onClick={() => changeStage(Math.min(stages.length - 1, activeStage + 1))}
              disabled={activeStage === stages.length - 1}
              aria-label="Next stage"
            >
              →
            </button>
          </div>

          {activeStage === 0 && (
            <section className="stage stage-intro" aria-labelledby="why-title">
              <div className="intro-copy">
                <h1 id="why-title">Why this workshop is designed this way.</h1>
                <p className="stage-meta">Facilitator opening · 0–4 minutes</p>
                <p className="lede">
                  AI adoption becomes durable when teams practice real workflows, make
                  human-review boundaries explicit, and turn learner friction into
                  better enablement and product decisions.
                </p>
                <button className="primary-button" type="button" onClick={startWorkshop}>
                  Start the 45-minute session
                  <span aria-hidden="true">→</span>
                </button>
              </div>

              <aside className="session-brief" aria-label="Session facts">
                <h2>Session brief</h2>
                <dl>
                  <div>
                    <dt>Time</dt>
                    <dd>45 minutes</dd>
                  </div>
                  <div>
                    <dt>Format</dt>
                    <dd>Groups of 4–6</dd>
                  </div>
                  <div>
                    <dt>Context</dt>
                    <dd>People + operations</dd>
                  </div>
                  <div>
                    <dt>Data</dt>
                    <dd>Fictional only</dd>
                  </div>
                </dl>
              </aside>

              <div className="reason-grid">
                <article className="reason-card problem">
                  <span className="card-number" aria-hidden="true">01</span>
                  <div>
                    <h2>
                      <span className="reason-label">Problem</span>
                      Knowing the tool is not the same as trusting the workflow.
                    </h2>
                    <p>
                      Generic demos skip the judgment calls that determine whether a
                      draft is actually safe and useful.
                    </p>
                  </div>
                </article>
                <article className="reason-card action">
                  <span className="card-number" aria-hidden="true">02</span>
                  <div>
                    <h2>
                      <span className="reason-label">Practice action</span>
                      Rehearse the handoffs, not just the prompt.
                    </h2>
                    <p>
                      Learners frame context, improve a draft, review the response, and
                      spot where a person must take over.
                    </p>
                  </div>
                </article>
                <article className="reason-card evidence">
                  <span className="card-number" aria-hidden="true">03</span>
                  <div>
                    <h2>
                      <span className="reason-label">Learning evidence</span>
                      Turn shared friction into the next improvement.
                    </h2>
                    <p>
                      Anonymous patterns feed facilitator discussion, enablement
                      priorities, and a fictional product-feedback backlog.
                    </p>
                  </div>
                </article>
              </div>
            </section>
          )}

          {activeStage === 1 && (
            <section className="stage" aria-labelledby="frame-title">
              <StageHeader
                id="frame-title"
                meta="Workflow framing · 4–8 minutes"
                title="See the work before adding AI."
                copy="Name the decision, evidence, handoffs, and accountable reviewer. AI supports a step; it does not own the outcome."
              />
              <div className="workflow-board">
                <div className="workflow-context">
                  <p className="context-label">Fictional workflow</p>
                  <h2>Answer a manager’s contractor onboarding question</h2>
                  <p>
                    Intake arrives through the team’s knowledge and request queue.
                    The goal is a useful response grounded in the current onboarding
                    guide.
                  </p>
                  <div className="context-tags" aria-label="Workflow context">
                    <span>Owner: People Ops</span>
                    <span>Source: approved guide</span>
                    <span>Risk: medium</span>
                  </div>
                </div>
                <ol className="workflow-steps">
                  {[
                    ["01", "Intake", "Clarify the request and remove unnecessary personal detail."],
                    ["02", "AI-assisted draft", "Structure a grounded answer with questions and next steps."],
                    ["03", "Human review", "Verify policy, names, dates, links, tone, and escalation flags."],
                    ["04", "Respond + learn", "Send the approved answer and capture recurring friction."],
                  ].map(([number, title, copy], index) => (
                    <li key={title}>
                      <span className="step-dot">{number}</span>
                      <div>
                        <h3>{title}</h3>
                        <p>{copy}</p>
                      </div>
                      {index < 3 && <span className="step-arrow" aria-hidden="true">→</span>}
                    </li>
                  ))}
                </ol>
              </div>
              <FacilitatorCue>
                Ask each table: “Where does a person add judgment that the model
                cannot own?” Take two answers before moving on.
              </FacilitatorCue>
              <StageFooter activeStage={activeStage} onChange={changeStage} />
            </section>
          )}

          {activeStage === 2 && (
            <section className="stage" aria-labelledby="safe-title">
              <StageHeader
                id="safe-title"
                meta="Safe-use orientation · 8–12 minutes"
                title="Four boundaries for responsible practice."
                copy="Select each boundary as your table confirms how it applies to this fictional onboarding workflow."
              />
              <div className="boundary-grid">
                {safetyCards.map((card, index) => {
                  const checked = checkedBoundaries.includes(card.key);
                  return (
                    <button
                      type="button"
                      className={`boundary-card ${checked ? "checked" : ""}`}
                      key={card.key}
                      onClick={() =>
                        setCheckedBoundaries((current) =>
                          current.includes(card.key)
                            ? current.filter((key) => key !== card.key)
                            : [...current, card.key],
                        )
                      }
                      aria-pressed={checked}
                    >
                      <span className="boundary-top">
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <span className="check-mark" aria-hidden="true">
                          {checked ? "✓" : "+"}
                        </span>
                      </span>
                      <strong>{card.title}</strong>
                      <span>{card.copy}</span>
                    </button>
                  );
                })}
              </div>
              <div className="boundary-summary" role="status" aria-live="polite">
                <strong>{checkedBoundaries.length} of 4 boundaries confirmed</strong>
                <span>
                  {checkedBoundaries.length === 4
                    ? "Ready to practice with the coach."
                    : "Discuss each boundary before moving on."}
                </span>
              </div>
              <StageFooter activeStage={activeStage} onChange={changeStage} />
            </section>
          )}

          {activeStage === 3 && (
            <section className="stage coach-stage" aria-labelledby="coach-title">
              <StageHeader
                id="coach-title"
                meta="Adaptive practice · 12–25 minutes"
                title="Build a prompt around the workflow."
                copy="The Practice Coach only helps structure this task, ask for missing context, define review checks, and flag escalation needs."
              />
              <div className="coach-layout">
                <form
                  className="coach-input"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setCoachRun(true);
                  }}
                >
                  <div className="coach-panel-heading">
                    <div>
                      <h2>Fictional contractor intake</h2>
                      <p className="panel-meta">Your practice draft</p>
                    </div>
                    <span className="constraint-badge">Constrained coach</span>
                  </div>
                  <label htmlFor="draft">What do you want AI to help draft?</label>
                  <textarea
                    id="draft"
                    value={draft}
                    onChange={(event) => {
                      setDraft(event.target.value);
                      setCoachRun(false);
                    }}
                    rows={5}
                  />
                  <div className="field-grid">
                    <label>
                      Audience
                      <select value={audience} onChange={(event) => setAudience(event.target.value)}>
                        <option>Manager</option>
                        <option>New contractor</option>
                        <option>People Ops partner</option>
                      </select>
                    </label>
                    <label>
                      Approved source
                      <select value={source} onChange={(event) => setSource(event.target.value)}>
                        <option>Contractor onboarding guide</option>
                        <option>Manager intake playbook</option>
                        <option>No confirmed source</option>
                      </select>
                    </label>
                  </div>
                  <div className="coach-notice">
                    <span aria-hidden="true">◆</span>
                    <p>
                      Do not enter names, medical details, performance information, or
                      other real personal data.
                    </p>
                  </div>
                  <button className="primary-button wide" type="submit">
                    Coach this draft <span aria-hidden="true">↗</span>
                  </button>
                </form>

                <div className={`coach-output ${coachRun ? "ready" : ""}`} aria-live="polite">
                  {!coachRun ? (
                    <div className="coach-empty">
                      <span className="orbit" aria-hidden="true">＋</span>
                      <h2>Your practice guidance will build here.</h2>
                      <p>
                        It will stay inside four lanes: structure, questions, review,
                        and escalation.
                      </p>
                      <div className="lane-preview" aria-hidden="true">
                        <span>Structure</span>
                        <span>Questions</span>
                        <span>Review</span>
                        <span>Escalation</span>
                      </div>
                    </div>
                  ) : (
                    <div className="coach-response">
                      <div className="response-heading">
                        <span className="coach-avatar" aria-hidden="true">PC</span>
                        <div>
                          <strong>Practice Coach</strong>
                          <p>Guidance for this workflow · fictional output</p>
                        </div>
                      </div>

                      <ResponseBlock number="01" label="Prompt structure" tone="green">
                        <p className="prompt-rewrite">
                          “Using the current <mark>{source}</mark>, draft a concise reply
                          for a <mark>{audience.toLowerCase()}</mark> about this request:
                          <em> {draft}</em> List the required onboarding steps, name any
                          missing information as questions, link only to confirmed
                          resources, and end with the next action. Do not infer policy.”
                        </p>
                      </ResponseBlock>

                      <ResponseBlock number="02" label="Follow-up questions">
                        <ul className="response-list">
                          <li>Is the worker classification already confirmed?</li>
                          <li>Which country or legal entity does the request apply to?</li>
                          <li>Who owns account access before the requested start date?</li>
                        </ul>
                      </ResponseBlock>

                      <ResponseBlock number="03" label="Response-review cues" tone="blue">
                        <div className="review-chip-row">
                          <span>Policy version</span>
                          <span>Dates + links</span>
                          <span>Named owner</span>
                          <span>Unsupported claims</span>
                          <span>Tone + next step</span>
                        </div>
                      </ResponseBlock>

                      <ResponseBlock number="04" label="Escalation flags" tone="coral">
                        <div className="escalation-line">
                          <strong>
                            {source === "No confirmed source" ? "Pause before drafting" : "Review required"}
                          </strong>
                          <p>
                            {source === "No confirmed source"
                              ? "No approved source is selected. Ask the People Ops owner to confirm the governing guidance."
                              : "Escalate if classification is unclear, sources conflict, or the intake contains sensitive personal details."}
                          </p>
                        </div>
                      </ResponseBlock>
                    </div>
                  )}
                </div>
              </div>
              <StageFooter activeStage={activeStage} onChange={changeStage} />
            </section>
          )}

          {activeStage === 4 && (
            <section className="stage" aria-labelledby="clinic-title">
              <StageHeader
                id="clinic-title"
                meta="Edge-case clinic · 25–35 minutes"
                title="Practice the moment AI should stop."
                copy="Choose a fictional case, decide as a table, then reveal the review boundary and facilitator question."
              />
              <div className="clinic-layout">
                <div className="case-selector" aria-label="Choose an edge case">
                  {clinicCases.map((item, index) => (
                    <button
                      type="button"
                      aria-pressed={activeCase === index}
                      className={activeCase === index ? "active" : ""}
                      onClick={() => {
                        setActiveCase(index);
                        setCaseRevealed(false);
                      }}
                      key={item.label}
                    >
                      <span>Case {index + 1}</span>
                      <strong>{item.label}</strong>
                    </button>
                  ))}
                </div>
                <div className="case-card" aria-live="polite">
                  <div className="case-meta">
                    <span>Fictional scenario</span>
                    <span>{clinicCases[activeCase].signal}</span>
                  </div>
                  <h2>{clinicCases[activeCase].title}</h2>
                  <p className="case-prompt">
                    Your group has 60 seconds: proceed, revise, or escalate?
                  </p>
                  {!caseRevealed ? (
                    <button
                      className="primary-button"
                      type="button"
                      onClick={() => setCaseRevealed(true)}
                    >
                      Reveal the boundary
                    </button>
                  ) : (
                    <div className="case-reveal" aria-live="polite">
                      <div>
                        <h3>Recommended move</h3>
                        <p>{clinicCases[activeCase].move}</p>
                      </div>
                      <blockquote>
                        <strong>Discuss</strong>
                        “{clinicCases[activeCase].question}”
                      </blockquote>
                    </div>
                  )}
                </div>
              </div>
              <FacilitatorCue>
                Listen for “it depends.” Ask the group to name exactly what it depends
                on—and which human role owns that decision.
              </FacilitatorCue>
              <StageFooter activeStage={activeStage} onChange={changeStage} />
            </section>
          )}

          {activeStage === 5 && (
            <section className="stage board-stage" aria-labelledby="board-title">
              <StageHeader
                id="board-title"
                meta="Anonymous live learning board · 35–42 minutes"
                title="Make the group’s friction visible."
                copy="Fictional, de-identified reflections cluster into shared themes for discussion. Contributions are anonymous by default."
              />
              <div className="board-stats" aria-label="Fictional learning board summary">
                <p className="board-stats-note">Illustrative data · updates in this prototype only</p>
                <dl>
                  <div>
                    <dt>Contributions</dt>
                    <dd>{reflections.length}</dd>
                  </div>
                  <div>
                    <dt>Shared themes</dt>
                    <dd>3</dd>
                  </div>
                  <div>
                    <dt>Needs product input</dt>
                    <dd>{themeCounts.find((item) => item.theme === "Escalation")?.count}</dd>
                  </div>
                </dl>
              </div>

              <div className="learning-board">
                <div className="theme-columns">
                  {themeCounts.map(({ theme, count }) => (
                    <article className="theme-column" key={theme}>
                      <header>
                        <span className={`theme-symbol ${theme.toLowerCase().replace(" ", "-")}`} aria-hidden="true" />
                        <div>
                          <h2>{theme}</h2>
                          <p>{count} reflections</p>
                        </div>
                      </header>
                      <div className="reflection-stack">
                        {reflections
                          .filter((reflection) => reflection.theme === theme)
                          .slice(-3)
                          .map((reflection) => (
                            <blockquote key={reflection.id}>
                              “{reflection.text}”
                              <cite>Anonymous · fictional</cite>
                            </blockquote>
                          ))}
                      </div>
                    </article>
                  ))}
                </div>

                <form className="reflection-form" onSubmit={submitReflection}>
                  <div>
                    <h2>What would make this workflow safer or easier?</h2>
                    <p className="panel-meta">Add a reflection</p>
                  </div>
                  <label className="sr-only" htmlFor="reflection">
                    Your fictional, de-identified reflection
                  </label>
                  <textarea
                    id="reflection"
                    value={reflectionText}
                    onChange={(event) => setReflectionText(event.target.value)}
                    placeholder="Share a fictional, de-identified observation…"
                    rows={3}
                  />
                  <div className="form-actions">
                    <label className="anonymous-toggle">
                      <input
                        type="checkbox"
                        checked={anonymous}
                        onChange={(event) => setAnonymous(event.target.checked)}
                      />
                      <span aria-hidden="true" />
                      Anonymous by default
                    </label>
                    <button className="primary-button" type="submit">
                      Add to board
                    </button>
                  </div>
                  {!anonymous && (
                    <p className="privacy-warning" role="alert">
                      For this workshop, keep contributions anonymous and de-identified.
                    </p>
                  )}
                  {submitted && (
                    <p className="submit-confirmation" role="status">
                      Reflection clustered. The board and backlog have been updated.
                    </p>
                  )}
                </form>
              </div>

              <section className="backlog" aria-labelledby="backlog-title">
                <div>
                  <h2 id="backlog-title">What the learning team carries forward</h2>
                  <p className="panel-meta">Product-feedback backlog · fictional</p>
                </div>
                <ol>
                  {backlogItems.map((item) => (
                    <li key={item.id} className={item.priority === "NEW" ? "new" : ""}>
                      <span>{item.priority}</span>
                      <p><strong>{item.title}</strong></p>
                      <small>Owner: {item.owner}</small>
                    </li>
                  ))}
                </ol>
              </section>
              <StageFooter activeStage={activeStage} onChange={changeStage} />
            </section>
          )}

          {activeStage === 6 && (
            <section className="stage close-stage" aria-labelledby="close-title">
              <div className="close-hero">
                <h1 id="close-title">Practice made the boundary visible.</h1>
                <p className="stage-meta">Commitments & close · 42–45 minutes</p>
                <p>
                  Close by choosing one workflow behavior to repeat and one friction
                  signal to route back to the team.
                </p>
              </div>
              <div className="commitment-grid">
                <article>
                  <span className="card-number" aria-hidden="true">01</span>
                  <h2>
                    <span className="reason-label">Use next</span>
                    Structure prompts around source, audience, outcome, and limits.
                  </h2>
                </article>
                <article>
                  <span className="card-number" aria-hidden="true">02</span>
                  <h2>
                    <span className="reason-label">Review every time</span>
                    Check claims, versions, names, dates, links, and next action.
                  </h2>
                </article>
                <article>
                  <span className="card-number" aria-hidden="true">03</span>
                  <h2>
                    <span className="reason-label">Escalate early</span>
                    Pause for sensitive detail, source conflict, and consequential judgment.
                  </h2>
                </article>
              </div>
              <div className="close-evidence">
                <div>
                  <p className="panel-meta">Fictional session signal</p>
                  <strong>{reflections.length}</strong>
                  <p>anonymous learning reflections ready for facilitator synthesis</p>
                </div>
                <div className="facilitator-close">
                  <p className="panel-meta">Final prompt</p>
                  <p>“What will you do differently in your next real intake?”</p>
                </div>
              </div>
              <div className="prototype-note">
                <span aria-hidden="true">✦</span>
                <p>
                  This is a fictional portfolio prototype. It contains no real employee
                  data, client metrics, or engagement claims.
                </p>
              </div>
              <StageFooter activeStage={activeStage} onChange={changeStage} />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function StageHeader({
  id,
  meta,
  title,
  copy,
}: {
  id: string;
  meta: string;
  title: string;
  copy: string;
}) {
  return (
    <header className="stage-header">
      <h1 id={id}>{title}</h1>
      <p className="stage-meta">{meta}</p>
      <p className="stage-lede">{copy}</p>
    </header>
  );
}

function FacilitatorCue({ children }: { children: React.ReactNode }) {
  return (
    <aside className="facilitator-cue" aria-label="Facilitator cue">
      <span className="cue-icon" aria-hidden="true">
        F
      </span>
      <p>{children}</p>
    </aside>
  );
}

function ResponseBlock({
  number,
  label,
  tone = "",
  children,
}: {
  number: string;
  label: string;
  tone?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`response-block ${tone}`}>
      <header>
        <span>{number}</span>
        <strong>{label}</strong>
      </header>
      {children}
    </section>
  );
}

function StageFooter({
  activeStage,
  onChange,
}: {
  activeStage: number;
  onChange: (stage: number) => void;
}) {
  return (
    <footer className="stage-footer">
      <button
        className="text-button"
        type="button"
        onClick={() => onChange(activeStage - 1)}
        disabled={activeStage === 0}
      >
        ← Previous
      </button>
      <span>
        {stages[activeStage].range} min · {stages[activeStage].title}
      </span>
      {activeStage < stages.length - 1 ? (
        <button
          className="secondary-button"
          type="button"
          onClick={() => onChange(activeStage + 1)}
        >
          Continue <span aria-hidden="true">→</span>
        </button>
      ) : (
        <button className="secondary-button" type="button" onClick={() => onChange(0)}>
          Restart session ↻
        </button>
      )}
    </footer>
  );
}
