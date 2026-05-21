# Playwright AI-Assisted Testing Setup

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Claude Code agents, commands, and documentation to make AI-assisted Playwright test authoring, review, debugging, and refactoring practical and project-specific.

**Architecture:** All changes are additive markdown files. No production TypeScript changes. Updates to CLAUDE.md extend existing conventions without breaking them. Five subagents and six commands map to the main test lifecycle activities.

**Tech Stack:** Claude Code `.claude/agents/`, `.claude/commands/`, Playwright, TypeScript strict mode, 3-layer architecture (spec → step → page).

---

## File Map

| File                                                | Action | Purpose                                                                    |
| --------------------------------------------------- | ------ | -------------------------------------------------------------------------- |
| `CLAUDE.md`                                         | Modify | Add Playwright conventions: locators, assertions, isolation, anti-patterns |
| `.claude/agents/playwright-test-architect.md`       | Create | Test strategy and coverage design                                          |
| `.claude/agents/playwright-test-writer.md`          | Create | Write/update tests per project conventions                                 |
| `.claude/agents/playwright-framework-maintainer.md` | Create | Maintain fixtures, config, helpers                                         |
| `.claude/agents/playwright-flaky-debugger.md`       | Create | Diagnose failing/flaky tests                                               |
| `.claude/agents/playwright-test-reviewer.md`        | Create | Code review for test quality                                               |
| `.claude/commands/write-playwright-test.md`         | Create | `/write-playwright-test` slash command                                     |
| `.claude/commands/review-playwright-test.md`        | Create | `/review-playwright-test` slash command                                    |
| `.claude/commands/debug-flaky-test.md`              | Create | `/debug-flaky-test` slash command                                          |
| `.claude/commands/refactor-playwright-test.md`      | Create | `/refactor-playwright-test` slash command                                  |
| `.claude/commands/design-playwright-coverage.md`    | Create | `/design-playwright-coverage` slash command                                |
| `.claude/commands/improve-playwright-framework.md`  | Create | `/improve-playwright-framework` slash command                              |
| `docs/playwright-testing-standards.md`              | Create | Authoritative testing standards doc                                        |
| `docs/playwright-ai-prompts.md`                     | Create | Copy-paste prompt examples for developers                                  |

---

## Task 1: Update CLAUDE.md

**Files:**

- Modify: `CLAUDE.md`

- [ ] Append a new `## Playwright Conventions` section covering locator strategy, assertion strategy, isolation, anti-patterns, and debugging artifacts.

Commands to verify:

```
npm run typecheck  # should still pass (no .ts changes)
npm run lint       # should still pass
```

---

## Task 2: Create Agent Files

**Files:**

- Create: `.claude/agents/playwright-test-architect.md`
- Create: `.claude/agents/playwright-test-writer.md`
- Create: `.claude/agents/playwright-framework-maintainer.md`
- Create: `.claude/agents/playwright-flaky-debugger.md`
- Create: `.claude/agents/playwright-test-reviewer.md`

- [ ] Create each agent with frontmatter (`name`, `description`) and body covering purpose, when to use, responsibilities, project rules, output format, and good/bad examples grounded in this repo's patterns.

---

## Task 3: Create Command Files

**Files:**

- Create: `.claude/commands/write-playwright-test.md`
- Create: `.claude/commands/review-playwright-test.md`
- Create: `.claude/commands/debug-flaky-test.md`
- Create: `.claude/commands/refactor-playwright-test.md`
- Create: `.claude/commands/design-playwright-coverage.md`
- Create: `.claude/commands/improve-playwright-framework.md`

- [ ] Create each command file describing: when to use it, which agent handles it, expected input, expected output, requirement to inspect existing code first.

---

## Task 4: Create Testing Standards Doc

**Files:**

- Create: `docs/playwright-testing-standards.md`

- [ ] Write practical standards: test design, locator strategy, assertion strategy, fixtures, test data, API setup, page object guidance, flaky test debugging, CI expectations, code review checklist.

---

## Task 5: Create AI Prompts Doc

**Files:**

- Create: `docs/playwright-ai-prompts.md`

- [ ] Write copy-paste prompt examples covering: generate test from story, review test, debug flaky failure, refactor test file, improve fixtures, design coverage, add API setup.

---

## Task 6: Validate

- [ ] Run `npm run lint` — expect zero errors
- [ ] Run `npm run typecheck` — expect zero errors
- [ ] Confirm all new markdown files are in the right locations
