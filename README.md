# aiwebengine-template

Starter templates for scripts built by the agent (`aiwebengine-agent`). One
directory per shape: `site`, `tool` and `agent`.

Each directory is itself a script, so pulling this repository with a prefix
puts them on an engine as `template-site`, `template-tool` and
`template-agent`:

```text
pull_from_git(repo: "lpajunen/aiwebengine-template", prefix: "template")
```

The script's own `main.ts` registers nothing, so a pulled template serves
nothing. The starter is under `starter/`: the agent's `create_script` writes a
stub first, pins it, then copies `starter/` into the new script, replacing
`__NAME__` with the script's name and `__SNAKE__` with the same name using
underscores.

Every starter has tests, a `check_script` that passes, and no secrets. Change
a template only together with the evaluation tasks that use it.
