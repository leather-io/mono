# review-gate

The `repo:review-gate` workflow, run as `pnpm lt review-gate <command>`. The workflows check out trusted code, install this package
(`.github/actions/setup-tools`) and call these commands; every decision lives here. Commands read
their inputs from the job environment (`GITHUB_TOKEN`, `RUN_URL`, ...) and flags.

## review-gate

Counts the independent approvals on a pull request into `dev` and reports the `review-gate`
commit status. Every write is made with the review gate GitHub App's token, and the ruleset requires
`review-gate` from that App, so a status a pull request posts as `github-actions[bot]` counts for
nothing.

```
pull_request, pull_request_review  ─▶ repo:review-gate-dispatch ─▶ workflow_dispatch on dev ─┐
                                                                                           ▼
                                                          check: count approvals
```

| Command            | Does                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| `check`            | counts approvals and posts the `review-gate` status                            |
| `app-token create` | signs the App JWT with KMS and writes an installation token to the step output |
| `app-token revoke` | revokes the token in `GITHUB_TOKEN` when the job ends                          |

Every pull request needs 2 approvals.

A fork pull request cannot start the dispatch, since its workflows only get a read-only token. A
maintainer runs `repo:review-gate` from the Actions tab with its number once it is approved.

Which approvals count: the latest review of each person, when it approves the head commit, is not
the author's or a bot's, and GitHub credits it to the `reviewers` team (`onBehalfOf` on the review).
The team is fixed in `steps.ts` (`reviewersTeamId`), the same team the `dev` ruleset requires, so
the gate counts the same people the ruleset does. Change both together.

A pull request the fix-issue workflow opened (a bot author on `bot/fix-issue-<issue>-<run id>`) is
answered for by whoever dispatched that run. The gate reads the run named in the branch, and the
approval of its actor or of whoever re-ran it never counts. When the run is missing, or is not a
`workflow_dispatch` run of `repo:fix-issue` for that issue, the gate fails: a bot pull request
nobody dispatched is blocked. Dispatching a revise of the pull request changes none of this: the
approval of whoever dispatched a revise counts like anyone else's.

| Module         | Responsibility                                                  |
| -------------- | --------------------------------------------------------------- |
| `approvals.ts` | approvers, fix-issue dispatchers, shared heads, the gate status |
| `client.ts`    | the GitHub calls, each response checked with `schemas.ts`       |
| `steps.ts`     | the `check` and `app-token` commands                            |

`../ci/` holds the shared pieces: the GitHub REST and GraphQL client and Actions helpers
(`github.ts`), command running (`exec.ts`), step outputs (`outputs.ts`) and the App token signed
through KMS (`app-token.ts`). `client.ts` scopes the shared client to the repository.

## Trust

`repo:review-gate` only runs from `dev`: `workflow_dispatch` is started with `--ref dev`, and the
App key sits in the `environment/mono-review-gate` environment, whose deployment branches are limited to `dev`. A pull request can edit
`repo:review-gate-dispatch`, but the most it can do is not start the gate, or start it from its own
branch, where the environment refuses the key. Either way no App status appears and the pull
request stays blocked.

The gate never checks out or runs pull request code. It reads the pull request and its reviews
through the API and parses every response against a schema before anything acts on it. The job has
no access to the Actions cache (`cache-mode: none`, pnpm cache off in `setup-tools`), so nothing
another job saved runs next to the App token.

The App's private key never reaches the runner. It lives in AWS KMS: the `aws-credentials` step
logs in to AWS through GitHub's OIDC token, then `pnpm lt review-gate app-token create` has KMS sign
the App's JWT and exchanges it for an installation token limited to this repository and to actions,
members and pull requests read and statuses write. A token that comes back with any other
permission is revoked and the step fails. The job revokes the token when it ends, so a leaked token
stops working with the run, and within an hour at most. Nobody can copy the key, and every
signature is logged in CloudTrail.

**App setup, once per repository:**

1. Create a GitHub App (webhook off; repository permissions Actions read, Commit statuses read and
   write, Pull requests read, Metadata read; organization permission Members read) and install it
   on the repository only. Set the repository variable `REVIEW_GATE_APP_CLIENT_ID`.
2. Create the environment `environment/mono-review-gate`, limited to the `dev` branch, with the variables
   `AWS_ROLE_ARN`, `AWS_REGION` and `REVIEW_GATE_APP_KMS_KEY_ID`. It holds no secrets.
3. In AWS, import a private key generated for the App into an asymmetric KMS key (`RSA_2048`,
   `SIGN_VERIFY`), then delete the downloaded `.pem` and every other key on the App's settings page.
   The role in `AWS_ROLE_ARN` trusts only GitHub's OIDC subject
   `repo:leather-io/mono:environment:environment/mono-review-gate` and may only call `kms:Sign` on
   that key.
4. In the `dev` ruleset, require the `review-gate` status from this App.
