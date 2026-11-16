# World model v0 — draft schemas

Proposal for [ADR-0012](../adr/0012-world-model-representation.md). **Not live**: nothing here is
read by `minbit` or CI. If the ADR is accepted, an implementing task moves these to `state/schema/`,
creates `state/projects.yaml` and `state/roadmap.yaml`, and extends `minbit validate`.

| File | Becomes |
|---|---|
| `projects.schema.json` | `state/schema/projects.schema.json` |
| `roadmap.schema.json` | `state/schema/roadmap.schema.json` |
| `task-delta.schema.json` | two optional fields merged into `state/schema/tasks.schema.json` |
| `examples/*.yaml` | first content of `state/projects.yaml`, `state/roadmap.yaml` |

Check the examples: `check-jsonschema --schemafile projects.schema.json examples/projects.yaml`
(same for `roadmap`).
