---
sidebar_position: 6
---

# Data Sources

Custom CRUD supports data sources for reading external data into your Terraform configuration. A data source uses a single `read` hook to fetch data on every plan and apply.

## How It Works

A `data` block with the `customcrud` provider executes your `read` hook and stores the result in `output`. Unlike resources, data sources have no state lifecycle — they are re-read on every Terraform run.

### Input (`stdin`)

```json
{
  "input": {
    "name": "my-lookup"
  }
}
```

:::note
Data sources do not receive `id` or `output` fields — only `input` is sent to the hook.
:::

### Output (`stdout`)

```json
{
  "status": "active",
  "endpoint": "https://api.example.com/v2"
}
```

The output is available via `data.customcrud.<name>.output`.

## Example

### Hook Script

`hooks/read_config.sh`:
```bash
#!/usr/bin/env bash
set -e
input="$(cat)"

env="$(echo "$input" | jq -r '.input.environment')"

# Fetch config from an API, file, or any other source
curl -s "https://config.example.com/api/v1/env/${env}"
```

### Terraform Configuration

```hcl
data "customcrud" "app_config" {
  hooks {
    read = "hooks/read_config.sh"
  }

  input = {
    environment = "production"
  }
}

resource "customcrud" "app" {
  hooks {
    create = "hooks/create.sh"
    read   = "hooks/read.sh"
    update = "hooks/update.sh"
    delete = "hooks/delete.sh"
  }

  input = {
    endpoint = data.customcrud.app_config.output.endpoint
  }
}
```

## Use Cases

Data sources are ideal when you need to:
- Look up existing infrastructure details (IPs, endpoints, versions) to feed into resources
- Query an API that doesn't have a Terraform provider
- Read configuration from a file or secret store during planning
