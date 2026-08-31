# Deploy Pipeline

The site is a static Vercel project. Pushing to `main` is *supposed* to be the
whole deploy. On 2026-09-01 it was not, and the gap is invisible from git.

## The setup

- Repo: `github.com/Bazzook4/hotel-setup-tool`, branch `main`.
- `vercel.json`: `buildCommand` empty, `outputDirectory` `src/public`, no build
  step. Everything under `src/public/` is served at the web root, so
  `src/public/css/footer.css` is `/css/footer.css`.
- One Vercel project serves both www and the retired insights subdomain. Do not
  create a second one. See [[migration-plan]].

## A green push is not a deploy

Four commits (`ba63aad`, `bb1f5dc`, `0effc08` and one earlier) pushed cleanly to
GitHub and simply never built. `git status` was clean, `origin/main` was correct,
the files were in the pushed tree — and the live site kept serving the previous
build for close to an hour. Nothing in git said anything was wrong.

The symptom reported was "why can't I see the footers". The cause was not the
markup, which was correct in the repo and correct locally.

**How to apply:** after pushing anything user-visible, check the live site, not
git. Two curls settle it:

```sh
curl -s -o /dev/null -w "%{http_code}\n" https://www.onlinehotelier.com/css/footer.css
curl -s https://www.onlinehotelier.com/guides/ | grep -c 'class="guide-card"'
```

A 404 on a file that exists in `origin/main` means the deploy has not run. Add
`?x=$(date +%s%N)` and `-H "Cache-Control: no-cache"` so a CDN hit cannot be
mistaken for a fresh build.

## Reading the headers

`curl -I` on a live page tells you which build you are looking at:

- `x-vercel-cache: HIT` with a large `age` is the CDN, not necessarily the
  current build.
- `last-modified` is the **build** time. Compare it against
  `git log -1 --format=%cd <commit>`. If `last-modified` predates the commit you
  are looking for, that commit was never built. This is the check that settled
  it: the live build was timestamped 8½ hours *after* the commit it served,
  which meant that build had been triggered by hand, not by a push.

## Forcing a build

An empty commit reliably triggers one:

```sh
git commit --allow-empty -m "Trigger deploy" && git push origin main
```

That deployed within ~20 seconds. A **Redeploy** from the Vercel dashboard does
the same without touching history, and is the better option when the tree is
already correct.

Making the repo public did **not** retroactively build the commits pushed while
it was private. Whatever the trigger state is, it applies going forward only.

## Unresolved

Why the original four pushes did not fire is still unknown. The repo was private
at the time and was made public before the successful build, so a Vercel GitHub
App that lost access to the private repo is the plausible story — but it is
unconfirmed, and a build *had* run earlier while the repo was private, which
argues against it.

Do not record this as diagnosed. If an ordinary push deploys on its own, it
resolved itself; if it needs another empty commit, the Git integration needs
reconnecting under Vercel Settings → Git.

Related: [[working-practice]], [[migration-plan]]
