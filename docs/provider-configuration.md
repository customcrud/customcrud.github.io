---
sidebar_position: 7
---

# Provider Configuration

The `customcrud` provider supports several configuration options that apply globally to all resources, data sources, and ephemeral resources.

```hcl
provider "customcrud" {
  parallelism             = 4
  high_precision_numbers  = true
  missing_resource_exit_code = 44

  default_inputs = {
    api_url = var.api_url
    api_key = var.api_key
  }
}
```

## Options

### `parallelism`

Maximum number of hook scripts that can execute concurrently. Defaults to `0` (unlimited).

Set this if your scripts share a resource that can't handle concurrent access (e.g. a local database, a rate-limited API).

```hcl
provider "customcrud" {
  parallelism = 1  # fully serial execution
}
```

### `default_inputs`

A map of values that get merged into the `input` field of **every** hook execution across all resources and data sources. Resource-level `input` takes priority over defaults when keys overlap.

```hcl
provider "customcrud" {
  default_inputs = {
    api_url = var.api_url
    api_key = var.api_key
  }
}
```

:::warning
Default inputs do not appear in plans or state — they are only merged at execution time. This makes them suitable for passing secrets, but be aware that values **will** appear in debug logs when `TF_LOG` is enabled.
:::

### `high_precision_numbers`

When set to `true`, JSON output from your scripts is parsed using 512-bit floats instead of the default 64-bit. Enable this if you work with numbers that require higher precision than IEEE 754 double-precision (e.g. financial calculations, large integer IDs).

```hcl
provider "customcrud" {
  high_precision_numbers = true
}
```

### `missing_resource_exit_code`

The exit code your `read` hook should return to signal that a resource no longer exists on the remote. Defaults to `22`.

When a `read` hook exits with this code, Terraform removes the resource from state and plans a re-creation. Set to `-1` to disable this behavior entirely.

```hcl
provider "customcrud" {
  missing_resource_exit_code = 44  # use a custom exit code
}
```

:::tip
If you disable this with `-1`, your `read` hooks must handle missing resources by returning valid JSON with the current (or empty) state — they can no longer signal "not found" via exit code.
:::
