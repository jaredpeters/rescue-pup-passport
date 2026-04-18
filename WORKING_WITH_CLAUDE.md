# Working with Claude on this project

A short guide to working effectively with Claude Code (or another AI coding assistant) in this repo. Project-specific notes are called out where they matter.

The loop is: describe what you want → review what came back → direct the next step. The habits below are about *how to ask*, *how to verify*, and *when to start over*.

---

## Plan first. Almost always.

For anything more involved than "fix a typo" or "change this color," say:

> *Don't write code yet. Walk me through what you'd change, in order, and which files. I want to approve the plan before you implement.*

Why: AI assistants are eager. Without a plan, they'll happily edit 8 files when the right answer touched 2. Catching that *after* the change is more work than catching it in a plan.

In **Claude Code** specifically, press **Shift+Tab** to enter Plan Mode — it produces a plan and waits for your approval before touching anything.

---

## Brief with specifics

Vague briefs produce vague work. Spell out the data model, the UI pattern to copy, and what's explicitly out of scope.

**Vague:**
> *Add a vet bills tab.*

**Specific:**
> *Add a "Vet Bills" tab. Each entry has: date, vet/clinic name, what it was for (free text), amount in dollars, insurance covered (yes/no/partial). Show a running total per dog at the top. Match the card-and-list layout of the Feeding tab. Out of scope: charts, categorization, PDF export.*

A useful template:

```
Goal: [what you want].
Data model: [fields, types].
UI reference: [existing screen / component to match].
Out of scope: [list].
```

---

## Trust, but verify

After Claude says "done," your job is to read the diff. You don't need to understand every line — you need to spot when something's off.

**Tells that Claude wandered or made things up:**

- It edited files you didn't expect (look at the file list — anything beyond the discussed scope?)
- It added "TODO" or `// you'll need to...` comments (means it gave up on a part)
- It invented a function or file that doesn't exist when you ask follow-up questions about it
- It says *"this should work"* but didn't actually run the tests
- A "small fix" produced a 200-line diff
- It deleted code that wasn't in the plan
- It introduced a new dependency for something that should be one line of code

When you spot any of these, push back: *"You changed X, which wasn't in the plan. Why? Revert that part."* It will.

---

## The git commands worth knowing

| Command | What it does |
|---|---|
| `git status` | List changes since the last commit |
| `git diff` | Show the actual line-level changes |
| `git add .` | Stage everything for the next commit |
| `git commit -m "message"` | Create a commit |
| `git push` | Push commits to GitHub |
| `git restore .` | Discard uncommitted changes |

Claude can run all of these. [GitHub Desktop](https://desktop.github.com/) covers the same surface with a GUI and can be used alongside Claude Code.

---

## Tests are your safety net

Before committing, run the tests:

> *Run `npm test` and confirm everything passes.*

If something fails:

> *Explain what broke and why. Fix the underlying cause — don't delete or disable the test.*

"Make the test pass" is the wrong prompt. A test that's green because it was deleted is worse than a test that fails.

---

## When to start a new chat

Long conversations drift. If Claude starts repeating questions, forgetting constraints you set earlier, or making mistakes it didn't make at the start — end the conversation and open a new one.

When you restart, paste in:

- One sentence on what you're working on
- Relevant file paths or feature names
- Where the previous conversation left off

`CLAUDE.md` at the repo root briefs Claude on the codebase — you don't need to re-explain architecture.

---

## Sonnet vs. Opus

- **Sonnet (default)** — right for ~90% of work.
- **Opus** — reach for it on confusing bugs, large refactors, or open-ended design questions. Slower and more expensive per token.

Switch with `/model` in Claude Code.

---

## When you're stuck

1. **Ask for options, not a decision.** *"Give me two or three approaches and their tradeoffs. Don't pick."*
2. **Read the file yourself.** Open what Claude is working on. Relevant details often surface directly.
3. **Restart with tighter context.** New chat, paste the file and the error, describe the goal.
4. **Revert and reframe.** `git restore .` wipes uncommitted changes. Sometimes the original brief was the problem.
5. **Open an issue.** Someone else has probably hit the same thing.

---

## The loop, compressed

> Plan. Brief. Review the diff. Run the tests. Commit.
