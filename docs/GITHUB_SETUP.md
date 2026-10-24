# Initial GitHub setup

The owner will have Cursor push this project. No remote repository has been created or pushed from this package.

Before the first commit:
1. Add the actual Notion URLs in docs/NOTION_LINKS.md.
2. Add the owner's chosen mockup ZIP to mockups/archives/ and update its manifest.
3. Review git status/diff, ignored files and tracked secrets. Keep both .env.example templates; exclude actual .env/.env.local, databases and dependencies.
4. Run checks. Do not fabricate author identity or use global git config.
5. Resolve intended GitHub owner/repository URL and visibility. Recommend private while the owner is deciding distribution; do not assume or create a public repository.

For a new local folder without .git, initialize main and stage only reviewed files. For an existing checkout, inspect current branch, worktree changes and remotes first. Do not overwrite or reinitialize an existing repository.

Suggested initial commit: `chore: initialize Orthodox Q&A foundation and project documentation`.

After confirming the owner's exact repository, push main normally without force. If the remote already contains commits, inspect and reconcile using a feature branch/PR; do not overwrite history. Report resulting URL, branch and commit SHA only after the push succeeds. If authentication is missing, guide the user through their own local GitHub/CLI sign-in; never ask for a token pasted in chat.

Use [Cursor initial push prompt](../CURSOR_GITHUB_PROMPT.md) to perform the workflow.
