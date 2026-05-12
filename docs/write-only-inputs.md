---
sidebar_position: 5
---

# Write-Only Inputs

The `input_wo` attribute allows you to pass sensitive data to your hook scripts without storing it in Terraform state. This is particularly useful when combined with [ephemeral resources](./ephemeral-resources.md).

## How It Works

`input_wo` is a JSON string that gets merged into the `input` field your hook scripts receive via stdin. The values are only available during `create` and `update` operations and are never persisted in Terraform state.

:::note
see [#61](https://github.com/customcrud/terraform-provider-customcrud/issues/61#issuecomment-3893443556) for why `read` and `delete` cannot receive write-only inputs.
:::

For example, given:

```hcl
resource "customcrud" "example" {
  hooks {
    create = "hooks/create.sh"
    read   = "hooks/read.sh"
    update = "hooks/update.sh"
    delete = "hooks/delete.sh"
  }

  input = {
    name = "my-resource"
  }

  input_wo = jsonencode({
    password = "secret123"
  })
}
```

Your `create` and `update` hooks will receive:

```json
{
  "input": {
    "name": "my-resource",
    "password": "secret123"
  }
}
```

But only the `input` values are stored in state — the `password` field from `input_wo` is not persisted.

## With Ephemeral Resources

The primary use case for `input_wo` is passing secrets from ephemeral resources. Since ephemeral resource outputs cannot be assigned to regular attributes (they would end up in state), `input_wo` provides the bridge:

```hcl
ephemeral "customcrud" "db_password" {
  hooks {
    open = "hooks/read_password.sh"
  }
}

resource "customcrud" "db_config" {
  hooks {
    create = "hooks/create.sh"
    read   = "hooks/read.sh"
    update = "hooks/update.sh"
    delete = "hooks/delete.sh"
  }

  input = {
    host = "db.example.com"
  }

  input_wo = jsonencode({
    password = ephemeral.customcrud.db_password.output.password
  })
}
```

## Important Notes

- `input_wo` must be a valid JSON string (use `jsonencode()`)
- Values from `input_wo` are merged into `input` — if both contain the same key, `input_wo` takes precedence
- `input_wo` values are only available during `create` and `update` hooks, not `read` or `delete`
- Requires Terraform 1.11+
