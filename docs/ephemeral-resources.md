---
sidebar_position: 4
---

# Ephemeral Resources

Ephemeral resources are short-lived resources that are not stored in Terraform state. They are ideal for sensitive data like passwords, API keys, and temporary credentials that should never be persisted to disk.

## How It Works

An ephemeral `customcrud` resource uses hooks to manage its lifecycle:

- **`open`** (required) — Called when Terraform needs the ephemeral value. Your script reads or generates the secret and outputs it as JSON to stdout.
- **`renew`** (optional) — Called to extend the lifetime of the ephemeral resource (e.g., renewing a lease on a secret).
- **`close`** (optional) — Called when the ephemeral resource is no longer needed (e.g., revoking a temporary credential).

The protocol is the same as regular resources — JSON in via stdin, JSON out via stdout.

### Input (`stdin`)

```json
{
  "input": {
    "secret_file": "/path/to/secret.txt"
  }
}
```

### Output (`stdout`)

```json
{
  "content": "my-secret-value"
}
```

The output is available via `ephemeral.customcrud.<name>.output`.

## Example

### Hook Script

`hooks/open.sh`:
```bash
#!/usr/bin/env bash
set -e
input="$(cat)"

secret_file="$(echo "$input" | jq -r '.input.secret_file')"
content=$(cat "$secret_file")

jq -n --arg content "$content" '{content: $content}'
```

### Terraform Configuration

```hcl
ephemeral "customcrud" "secret" {
  hooks {
    open = "hooks/open.sh"
  }

  input = {
    secret_file = "${path.module}/secret.txt"
  }
}
```

The ephemeral output can then be used with [`input_wo`](./write-only-inputs.md) on regular resources to pass secrets without storing them in state:

```hcl
resource "customcrud" "my_resource" {
  hooks {
    create = "hooks/create.sh"
    read   = "hooks/read.sh"
    update = "hooks/update.sh"
    delete = "hooks/delete.sh"
  }

  input = {
    label = "my-resource"
  }

  input_wo = jsonencode({
    password = ephemeral.customcrud.secret.output.content
  })
}
```

## Renew and Close

For resources that have a limited lifetime (e.g., temporary credentials with a TTL), you can provide `renew` and `close` hooks:

```hcl
ephemeral "customcrud" "temp_creds" {
  hooks {
    open  = "hooks/open.sh"
    renew = "hooks/renew.sh"
    close = "hooks/close.sh"
  }

  input = {
    role = "admin"
  }
}
```

The `renew` hook receives the original input and output via stdin and is called periodically to extend the resource's lifetime. The `close` hook receives the same payload and is called when Terraform no longer needs the ephemeral resource. Neither hook needs to return JSON.

## Supported Versions

- Terraform >= 1.10 for ephemeral resources
- Terraform >= 1.11 when combining ephemeral resources with `input_wo`
