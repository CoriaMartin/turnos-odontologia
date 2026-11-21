# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

Generated: 2026-11-21 · Project: turnos-odontologia · Scanned: `~/.claude/skills/`, `~/.agents/skills/` (no project-level skills; no OpenCode/Gemini/Cursor/Copilot skill dirs found). Skipped: `sdd-*`, `_shared`, `skill-registry`.

## User Skills

### Stack del proyecto (Spring Boot · PostgreSQL · React/TS)

| Trigger | Skill | Path |
|---|---|---|
| Write/review code in an existing Spring Boot 3 project (controllers, validation, ProblemDetail, JPA, scheduling) | java-springboot | `~/.agents/skills/java-springboot/SKILL.md` |
| Spring Boot architecture, layered services, data access, logging | springboot-patterns | `~/.agents/skills/springboot-patterns/SKILL.md` |
| Java naming, immutability, Optional, streams, exceptions | java-coding-standards | `~/.agents/skills/java-coding-standards/SKILL.md` |
| Spring Boot features/bugs test-first (JUnit 5, Mockito, MockMvc) | springboot-tdd | `~/.agents/skills/springboot-tdd/SKILL.md` |
| Spring Security authn/authz, JWT, CSRF, secrets, rate limiting | springboot-security | `~/.agents/skills/springboot-security/SKILL.md` |
| Spring caching (@Cacheable, Caffeine/Redis) | spring-boot-cache | `~/.agents/skills/spring-boot-cache/SKILL.md` |
| Design/review a PostgreSQL schema, types, constraints, indexes | postgresql-table-design | `~/.agents/skills/postgresql-table-design/SKILL.md` |
| PostgreSQL-specific features, JSONB, query optimization | postgresql-optimization | `~/.agents/skills/postgresql-optimization/SKILL.md` |
| Postgres queries, indexes, pooling, RLS (Supabase guidance, any Postgres) | supabase-postgres-best-practices | `~/.agents/skills/supabase-postgres-best-practices/SKILL.md` |
| Writing/reviewing React components, data fetching, performance | vercel-react-best-practices | `~/.agents/skills/vercel-react-best-practices/SKILL.md` |
| React component/hook tests with Testing Library + Vitest, MSW, axe | react-testing | `~/.agents/skills/react-testing/SKILL.md` |
| Advanced TypeScript types, branded types, strict config | typescript-pro | `~/.agents/skills/typescript-pro/SKILL.md` |
| Generics, conditional/mapped types, type-safe API clients | typescript-advanced-types | `~/.agents/skills/typescript-advanced-types/SKILL.md` |
| Playwright E2E tests, flaky tests, POM | playwright-best-practices | `~/.agents/skills/playwright-best-practices/SKILL.md` |
| Redis data modeling / key naming | redis-core | `~/.agents/skills/redis-core/SKILL.md` |
| Redis caching, locks, rate limiting, pub/sub | redis-patterns | `~/.agents/skills/redis-patterns/SKILL.md` |

### Calidad, tests y depuración

| Trigger | Skill | Path |
|---|---|---|
| Build features or fix bugs test-first, red-green-refactor | tdd | `~/.agents/skills/tdd/SKILL.md` |
| Review changes vs repo standards and the originating spec | code-review | `~/.agents/skills/code-review/SKILL.md` |
| "Diagnose/debug this", broken, failing, slow | diagnosing-bugs | `~/.agents/skills/diagnosing-bugs/SKILL.md` |
| Any bug, test failure or unexpected behavior, before proposing fixes | systematic-debugging | `~/.agents/skills/systematic-debugging/SKILL.md` |

### UI, diseño y accesibilidad

| Trigger | Skill | Path |
|---|---|---|
| "Improve accessibility", a11y audit, WCAG, keyboard, screen reader | accessibility | `~/.agents/skills/accessibility/SKILL.md` |
| Review UI code against Web Interface Guidelines | web-design-guidelines | `~/.agents/skills/web-design-guidelines/SKILL.md` |
| UI polish, component design, animation decisions | emil-design-eng | `~/.claude/skills/emil-design-eng/SKILL.md` |
| Frontend taste/visual quality (v1, compat) | design-taste-frontend-v1 | `~/.claude/skills/design-taste-frontend-v1/SKILL.md` |
| Distinctive visual direction for new UI | frontend-design | `~/.agents/skills/frontend-design/SKILL.md` |
| Design/redesign/critique/audit/polish an interface | impeccable | `~/.agents/skills/impeccable/SKILL.md` |
| Project-wide visual foundation or policy (not per-screen mockups) | design-system | `~/.claude/skills/design-system/SKILL.md` |

### Flujo OpenSpec / Active Stack

| Trigger | Skill | Path |
|---|---|---|
| Explore a change, investigate, clarify requirements (OPSX explore) | openspec-explore | `~/.agents/skills/openspec-explore/SKILL.md` |
| Propose a change with proposal/specs/design/tasks | openspec-propose | `~/.agents/skills/openspec-propose/SKILL.md` |
| Implement tasks of an OpenSpec change | openspec-apply-change | `~/.agents/skills/openspec-apply-change/SKILL.md` |
| Revise an existing change's planning artifacts | openspec-update-change | `~/.agents/skills/openspec-update-change/SKILL.md` |
| Sync delta specs into main specs | openspec-sync-specs | `~/.agents/skills/openspec-sync-specs/SKILL.md` |
| Archive a completed change | openspec-archive-change | `~/.agents/skills/openspec-archive-change/SKILL.md` |
| Start/resume a unit of project work (choose ODD or SDD) | active-delivery | `~/.claude/skills/active-delivery/SKILL.md` |
| Start/resume project foundation | active-orchestrator | `~/.claude/skills/active-orchestrator/SKILL.md` |
| Publish/reconcile CHANGES.md with ClickUp | active-roadmap | `~/.claude/skills/active-roadmap/SKILL.md` |
| Product discovery / 11-point checklist | discovery-research | `~/.claude/skills/discovery-research/SKILL.md` |
| Research a competitor from a URL | web-scraper | `~/.claude/skills/web-scraper/SKILL.md` |
| Build the knowledge base (10 canonical files) | kb-creator | `~/.claude/skills/kb-creator/SKILL.md` |
| Generate/update CHANGES.md | roadmap-generator | `~/.claude/skills/roadmap-generator/SKILL.md` |
| Generate AGENTS.md / CLAUDE.md | agent-instruction | `~/.claude/skills/agent-instruction/SKILL.md` |
| Find/install skills | find-skill / find-skills | `~/.claude/skills/find-skill/SKILL.md` |
| Create or improve a skill | skill-creator | `~/.claude/skills/skill-creator/SKILL.md` |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### java-springboot
- Detect versions from `pom.xml` first; never upgrade Spring Boot, Java or dependencies implicitly.
- Ask before adding infrastructure (broker, cache provider, new DB, async setup).
- Package by feature; constructor injection; controllers return DTOs/records, never entities; services own `@Transactional`.
- Bean Validation on request records with `@Valid`; one `@RestControllerAdvice` returning `ProblemDetail`.
- Boot 3 uses Jackson 2 (`com.fasterxml.jackson.*`).
- Put `@EnableScheduling`/`@EnableJpaAuditing`/`@EnableCaching` on dedicated `@Configuration` classes, not on `@SpringBootApplication` (breaks slice tests).
- `@Transactional`/`@Async`/`@Cacheable` do nothing on self-invocation or private/final methods.
- Verify every change with `./mvnw verify`; no secrets in code, properties or logs.

### springboot-patterns
- Layers controller → service → repository; DTOs at the boundary, entities stay inside.
- Transactions at service level; read-only transactions for queries.
- Centralized exception handling; domain exceptions mapped to HTTP status.
- Use profiles for environment config; SLF4J parameterized logging, no PII.
- Spring Events for in-process domain events (e.g. `TurnoReprogramado`).

### java-coding-standards
- Clarity over cleverness; immutable by default (records for DTOs/value objects).
- Unchecked domain exceptions with meaningful names (`TurnoSolapadoException`); no broad `catch (Exception)` except central handlers.
- `Optional` only as return type, never as field or parameter.
- Consistent naming and package-by-feature layout.

### springboot-tdd
- Write the failing test first; Arrange-Act-Assert; `@ParameterizedTest` for variants.
- Unit tests with JUnit 5 + Mockito (explicit stubbing, no partial mocks); web tests with MockMvc + `jsonPath`.
- Prefer AssertJ (`assertThat`, `assertThatThrownBy`).
- **Project override**: no Docker → do NOT use Testcontainers; integration tests run against local PostgreSQL `turnos_test` (`TEST_DB_URL`).
- Use test data builders; run `./mvnw verify` before finishing.

### springboot-security
- Stateless JWT validated in a `OncePerRequestFilter`; deny by default; `@EnableMethodSecurity` where needed.
- Passwords via `PasswordEncoder` bean (BCrypt); never plaintext.
- Pure Bearer API → CSRF disabled; CORS configured at the security filter, explicit origin, never `*`.
- Secrets from env vars only; `application.yml` uses placeholders.
- Parameterized queries / Spring Data only; never concatenate SQL.
- Rate-limit or lock out repeated failed logins.

### spring-boot-cache
- Not used in the MVP: do not add caching without agreement (java-springboot rule).
- If needed: `@EnableCaching` on a `@Configuration`, explicit TTL/eviction, keys via SpEL, test cache hits.

### postgresql-table-design
- `BIGINT GENERATED ALWAYS AS IDENTITY` PKs; `snake_case` identifiers.
- `TIMESTAMPTZ` for times; prefer `TEXT` + `CHECK (length(col) <= n)` over `varchar(n)`; avoid `timestamp`, `serial`, `money`.
- `NOT NULL` wherever required; `CHECK` combined with `NOT NULL`.
- Index FK columns manually (Postgres does not).
- `EXCLUDE USING gist (resource_id WITH =, period WITH &&)` prevents double booking; needs `btree_gist`.
- `UNIQUE NULLS NOT DISTINCT` (PG15+) when only one NULL is allowed.

### postgresql-optimization
- Use Postgres-native features (ranges, GiST/GIN, partial indexes) where they fit.
- Verify query plans with `EXPLAIN (ANALYZE, BUFFERS)` before optimizing.
- Partial indexes for filtered subsets (e.g. active turnos).

### supabase-postgres-best-practices
- Load before writing schema/SQL; index what you filter/join on.
- Avoid N+1 and `SELECT *` in hot paths; use connection pooling.
- RLS guidance is Supabase-specific: not applicable to this project.

### vercel-react-best-practices
- Project override: Vite SPA, not Next.js → ignore `server-*`, RSC and `next/*` rules.
- Parallelize independent requests; avoid fetch waterfalls (TanStack Query handles caching).
- Import directly, avoid barrel files; lazy-load heavy routes.
- Avoid unnecessary re-renders: stable keys, derive state instead of syncing it.

### react-testing
- Render with the same providers as production (Router, QueryClient).
- Query by role/label; interact with `userEvent`; assert visible output and observable effects.
- Never assert component state, hook calls, render counts or internal DOM structure.
- Mock the network (MSW), not React or framework hooks.
- Add axe assertions for accessibility where relevant.

### typescript-pro
- `strict` mode on; run `tsc --noEmit` before finishing.
- Discriminated unions for states (e.g. `EstadoTurno`); `satisfies` for config objects.
- Explicit return types on public APIs; branded types only where they prevent real mixups (ids).

### typescript-advanced-types
- Use generics/conditional/mapped types only when they remove real duplication.
- Type the API client from shared DTO types; avoid `any`, prefer `unknown` + guards.

### playwright-best-practices
- Not in the MVP test plan; if used: role-based locators, no fixed sleeps, isolated test data.

### redis-core / redis-patterns
- Redis is not part of this project's stack: do not introduce it without agreement.

### tdd
- Red before green: one failing test, then minimal code to pass it.
- One slice at a time (one seam, one test, one implementation); no horizontal slicing.
- Avoid implementation-coupled tests (mocking internals, testing private methods) and tautological assertions.
- Refactoring belongs to review, not the red→green loop.

### code-review
- Review two axes: Standards (repo conventions win) and Spec (faithful to the OpenSpec change).
- Smells are judgement calls, labelled heuristics: Mysterious Name, Duplicated Code, Feature Envy, Primitive Obsession, Speculative Generality, Shotgun Surgery.
- Flag code that implements behavior not present in the spec.

### diagnosing-bugs
- First build a fast, deterministic reproduction loop (failing test preferred; pin time with `Clock`, seed randomness).
- Sharpen the signal: assert the specific symptom, not "didn't crash".
- Bisect or diff (old vs new) when the regression window is known.

### systematic-debugging
- Find the root cause before proposing any fix; no guess-and-patch.
- Reproduce, read the error fully, check recent changes, then form one hypothesis at a time.
- After two failed fixes, stop and re-investigate assumptions.

### accessibility
- Target WCAG 2.2 AA: keyboard reachable, visible focus (`--focus-ring`), labels for every input, `aria-invalid` + described errors.
- Color is never the only signal (estado badges include text).
- Respect `prefers-reduced-motion`; touch targets ≥ 44px.

### web-design-guidelines
- Review UI for interface-guideline compliance: semantics, focus, forms, feedback states, responsive layout.

### emil-design-eng
- Purposeful, short motion with `ease-out`; press feedback (`scale(0.97)`) on buttons.
- No animation on high-frequency actions; respect reduced motion.
- Polish details: consistent spacing, alignment, states (hover, focus, disabled, loading).

### design-taste-frontend-v1 / frontend-design / impeccable
- The approved project design system wins: use `design-system/tokens.css` variables, never loose values.
- App UI is an "operate" surface: scanability and consistency over decoration.
- Refinement preserves the incumbent identity; ask before replacing copy or brand elements.

### design-system
- Project policy is recorded: `system-and-mockups`, revision 1 approved. Do not ask again.
- Each visual change needs an approved HTML mockup in `openspec/changes/<change>/mockups/` before apply.
- Changing a shared token/asset bumps `Revision:` and resets approval to pending.

### openspec-explore / propose / apply / update / sync / archive
- `openspec` CLI owns state: run `openspec status`/`list`/`instructions`; never create `openspec/` structure by hand.
- Propose: proposal.md, delta `specs/<capability>/spec.md` with Given/When/Then scenarios (≥ happy, business error, edge), design.md, tasks.md.
- Apply: read context files first; implement only what the approved spec says; if something is missing, go back to propose/update.
- Update: planning artifacts only, never implementation code.
- Archive only after tasks are done and tests are green; sync delta specs into main specs.

### active-delivery / active-orchestrator / active-roadmap
- Before a unit of work, choose ODD or SDD with the user (active-delivery).
- Foundation state lives in `.active-orchestrator-state.json`; back up before edits, write atomically, preserve unknown sections.
- Task tracking is local (`.active-stack/roadmap.json` mode `local`); `CHANGES.md` owns scope and dependencies.

### discovery-research / web-scraper / kb-creator / roadmap-generator / agent-instruction
- Never fill a checklist point with a guess you could ask or research; mark unproven data "No evidenciado".
- KB = 10 canonical files in `knowledge-base/`; roadmap = `CHANGES.md` with stable `C-NN` IDs.
- Agent instructions keep only project-specific rules; do not repeat the global client instructions.

### find-skill / skill-creator
- Recommend before installing; install only user-approved picks; verify install count and source.

## Project Conventions

| File | Path | Notes |
|---|---|---|
| AGENTS.md / CLAUDE.md | — | Not created yet (fase `agents` pendiente) |
| Knowledge base | `knowledge-base/README.md` | Domain, rules (RN-XX), architecture, decisions |
| Roadmap | `CHANGES.md` | Change IDs C-01..C-20, dependencies, governance |
| Design system | `design-system/README.md` | Revision 1 approved; tokens in `design-system/tokens.css` |
| OpenSpec config | `openspec/config.yaml` | OPSX workflow |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.
