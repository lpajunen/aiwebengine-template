# Contributing

What the templates are and how the agent uses them: [README.md](README.md). The
engine they run on, and the rules for changing it:
[aiwebengine](https://github.com/lpajunen/aiwebengine/blob/main/CONTRIBUTING.md).

## Before a change

1. For anything larger than a fix, open an issue first and say what you intend.
2. Branch from `main`.
3. Change a template only together with the evaluation tasks in
   [aiwebengine-agent](https://github.com/lpajunen/aiwebengine-agent) that use
   it.

## Before a pull request

- Every starter keeps its tests passing, a `check_script` that passes, and no
  secrets.
- Update the README where the change makes it untrue. It describes what is
  true now; history belongs in the commit message.
- Commit messages follow Conventional Commits: `feat:`, `fix:`, `refactor:`,
  `test:`, `docs:`, `perf:`, `chore:`, with `!` for a breaking change. A pull
  request is squash-merged with its title as the commit message.

## License

Licensed under either of [MIT](LICENSE-MIT) or [Apache-2.0](LICENSE-APACHE), at
your option. Unless you say otherwise, a contribution you submit is licensed
the same way, with no additional terms.

## Security

Report vulnerabilities privately as described in the engine's
[SECURITY.md](https://github.com/lpajunen/aiwebengine/blob/main/SECURITY.md),
not in a public issue.
