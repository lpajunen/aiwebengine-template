# aiwebengine-template

Starter templates for scripts built by the agent (`aiwebengine-agent`). One
directory per shape: `site`, `tool`, `agent` and `scheduled`.

Each directory is itself a script, so pulling this repository with a prefix
puts them on an engine as `template-site`, `template-tool`,
`template-agent` and `template-scheduled`:

```text
pull_from_git(repo: "lpajunen/aiwebengine-template", prefix: "template")
```

The script's own `main.ts` registers nothing, so a pulled template serves
nothing. The starter is under `starter/`: the agent's `create_script` writes a
stub first, pins it, then copies `starter/` into the new script, replacing
`__NAME__` with the script's name and `__SNAKE__` with the same name using
underscores.

Handlers live in `lib/handlers.ts` and are made global in `main.ts` with
`Object.assign(globalThis, {...})`, so a test can import and call them with the
`makeContext` helper in `lib/testing.ts`.

A `scheduled` starter is a page where a signed-in person gives the app
permission, chooses a time of day and a time zone, and sees what the last run
did. The run itself (`runDaily`) is a task the engine fires from
`personalTasks.schedule`, acting as that person while they are away; it also
says when their permission is about to lapse, since the engine does not.

Every starter has tests, a `check_script` that passes, and no secrets. Change
a template only together with the evaluation tasks that use it.

## License

Licensed under either of [MIT](LICENSE-MIT) or [Apache-2.0](LICENSE-APACHE), at
your option.
