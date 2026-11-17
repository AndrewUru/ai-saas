# Weekly UI/UX Improvements automation

The scheduled workflow lives in `.github/workflows/weekly-ui-improvements.yml` and runs on Mondays at 08:00 UTC (GitHub may delay scheduled jobs). A manual **Run workflow** is also available under **Actions**.

## Required repository configuration

1. Set an **Actions repository secret** named `OPENAI_API_KEY` under **Settings → Secrets and variables → Actions → Secrets**. It must be a valid OpenAI API key with access to the Responses API. A ChatGPT subscription alone does **not** supply this secret.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under **Settings → Secrets and variables → Actions**, either as Secrets or Variables. These two values are required for the production build validation; the workflow accepts either location and gives Secrets precedence.
3. To let GitHub Actions open draft PRs automatically, enable **Settings → Actions → General → Workflow permissions → Allow GitHub Actions to create and approve pull requests**. If your repository does not allow this, the workflow pushes its branch and prints a manual PR creation URL instead.

**Never commit API keys to source control or print them in CI logs.** Do not place `OPENAI_API_KEY` in repository Variables.

## Flow

1. Read-only generation checks whether another `automation/weekly-ui-ux-` PR is open, runs engine unit tests, and inspects the ready queue.
2. When a ready improvement is queued, Codex is not needed. Otherwise the workflow verifies `OPENAI_API_KEY` **before** invoking Codex. Missing credentials generate a clear failure instead of a `.codex/<run-id>.json` file-not-found error.
3. Codex runs with `:read-only` permissions and produces a JSON proposal. The existing validator enforces allowed paths, operations, size limits and safe text replacements before any changes are staged.
4. The application job runs engine tests, applies one validated proposal, and performs `npm ci`, lint and production build. A failing install prevents noisy lint/build attempts; failures appear in the draft PR report and fail the workflow.
5. Only files declared by the engine may be committed. The resulting PR stays in **draft** and is **never merged automatically**.

## Verification and troubleshooting

- A separate read-only `weekly-ui-validation.yml` runs the engine unit tests and a dry run when the workflow or proposal scripts change in a PR. No OpenAI key or Supabase configuration is needed for these checks.
- **Missing OPENAI_API_KEY:** create the Actions secret and re-run the scheduled workflow. This cannot be corrected by changing workflow YAML alone.
- **Codex authentication / model errors after preflight passes:** validate the API key's status, allowed model access, usage limits, and account billing in your OpenAI API account. The preflight only tests that a nonempty secret was provided.
- **Missing Supabase build settings:** configure the URL and anon key as Actions variables or secrets. The build step reports an explicit error if either is empty.
- **GitHub Actions cannot open PRs:** follow the `pull/new/` URL in the job summary or enable the repository-level permission above.
- **No eligible improvement found:** the workflow succeeds without opening a PR. This is expected when the queue is empty and Codex returns a valid `noImprovement` response.

Test locally with `npm run improve:weekly:test` and `npm run improve:weekly:dry`. Neither test applies modifications.
