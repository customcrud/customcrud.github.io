---
sidebar_position: 2
---
# How It Works
## The Concept

All CRUD (Create, Read, Update, Delete) operations are delegated to external commands, these can be binaries or scripts.

Terraform manages the state, dependencies, and lifecycle of your resources just as it normally would. But with Custom CRUD, the actual "heavy lifting" - making API calls, writing files, or running commands — is done by whatever handler you provide. This allows you to manage all your CRUD-able resources with terraform, as well as custom data sources.

Custom CRUD endeavors to support as much of the terraform plugin framework API as is possible via provider and resource options, massively speeding up your virtual provider development by avoiding the need to publish a full-fat terraform provider (and all the infra headaches that can come with it such as a private provider registry + config).

## The Protocol

The communication between the provider and your script is done entirely via JSON over standard input (stdin) and standard output (stdout).

### Input (`stdin`)

When the provider executes your script, it sends a JSON object with the following structure:

```json
{
  "id": "e3218da9",
  "input": {
    "name": "cruddy",
    "count": 5
  },
  "output": {
    "id": "e3218da9",
    "name": "cruddy",
    "count": 5,
    "status": "online"
  }
}
```

*   **`id`**: The unique identifier of the resource. This is populated from the `id` field returned by `create`, and is sent to `read`, `update`, and `delete`.
*   **`input`**: Resource `input` merged with provider `default_inputs`. During `create` and `update`, `input_wo` is also merged into this field. See [Write-Only Inputs](./write-only-inputs.md) for details on `input_wo`.
*   **`output`**: Stored output values from the previous hook run. This is sent to `read`, `update`, and `delete`.

Data source `read` hooks receive only `input`. Ephemeral `open` hooks also receive only `input`; ephemeral `renew` and `close` hooks receive the original ephemeral `input` and `output` saved after `open`.

### Output (`stdout`)

For `create`, `read`, `update`, data source `read`, and ephemeral `open`, your script must print a valid JSON object to stdout. This object is used to update Terraform state or the ephemeral result. `delete`, `renew`, and `close` hooks do not need to print JSON.

```json
{
  "id": "e3218da9",
  "name": "cruddy",
  "count": 5,
  "status": "online"
}
```

*   **`id`**: (Required for `create`) The new ID of the resource. If omitted in other phases, the existing ID is preserved.
*   **Other keys**: Any other keys returned will be stored in the resource's `output` map. If an output key already exists in `input`, that `input` value is updated to match the returned output value for future runs.

### Exit Codes

The provider uses the script's exit code to determine success or failure:

*   **0**: Success. The `stdout` JSON is processed.
*   **22** (default): Resource Not Found.
    *   Only in the `read` hook: Signals that the resource no longer exists. Terraform will remove it from the state, and a creation will show up in your plan.
    *   This exit code is configurable via the [`missing_resource_exit_code`](./provider-configuration.md#missing_resource_exit_code) provider option.
*   **Any other non-zero**: Error. The provider will fail the Terraform operation and display the script's `stderr` to the user.

## Hook Commands

Hook command strings are parsed using shell-style quoting and whitespace rules, then executed directly. They are not run through an interactive shell, so shell features such as pipes, redirects, glob expansion, and environment-variable expansion require an explicit shell wrapper:

```hcl
hooks {
  read = "sh -c 'my-command | jq .'"
}
```

## Resource Behaviors

### Optional Update Hook

The `update` hook is optional. If you omit it, any change to `input` will cause Terraform to **destroy and recreate** the resource instead of updating it in-place.

```hcl
resource "customcrud" "example" {
  hooks {
    create = "hooks/create.sh"
    read   = "hooks/read.sh"
    # no update hook — input changes trigger replacement
    delete = "hooks/delete.sh"
  }

  input = {
    name = "my-resource"
  }
}
```

:::info
This is useful for resources that genuinely can't be updated (e.g. immutable infrastructure, one-shot provisioning scripts).
:::

### Hook-Only Changes

If you change only the hook commands (e.g. pointing `read` at a new script) but leave `input` unchanged, the update hook is **not** executed. The new hooks are saved to state and will be used for future operations.

## Data Sources

Custom CRUD also supports [data sources](./data-sources.md) — read-only lookups that execute on every plan and apply. These use a single `read` hook and follow the same JSON stdin/stdout protocol.

## Ephemeral Resources

Custom CRUD also supports [ephemeral resources](./ephemeral-resources.md) — short-lived values that are never stored in Terraform state. These use `open`, `renew`, and `close` hooks instead of CRUD hooks, and follow the same JSON stdin/stdout protocol.

## Environment Variables

Custom CRUD hooks inherit their environment with the parent terraform process, so if you want to be able to pass any configuration via environment variables directly in your hook handler, you can do so as long as the variables are set within the environment you are running terraform.

## Provider Configuration

The provider supports global options including parallelism control, default inputs, high-precision number parsing, and a configurable "missing resource" exit code. See [Provider Configuration](./provider-configuration.md) for details.
