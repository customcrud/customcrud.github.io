---
sidebar_position: 1
---

# A Simple Example with Python

This tutorial demonstrates how to use the `customcrud` provider with Python to manage resources. We will use the [`file-python`](https://github.com/customcrud/terraform-provider-customcrud/tree/main/examples/file-python) example which implements a simple tmp file resource.

`file_provider.py`:
```python
import click
import json
import sys
import tempfile
from pathlib import Path

@click.command()
@click.option('--action', type=click.Choice(['create', 'read', 'update', 'delete']), required=True, help='Action to perform')
def main(action):
    input_data = sys.stdin.read()
    data = json.loads(input_data)

    match action:
        case 'create':
            handle_create(data)
        case 'read':
            handle_read(data)
        case 'update':
            handle_update(data)
        case 'delete':
            handle_delete(data)

def handle_create(data):
    content = data.get("input", {}).get("content", "")
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp_path = Path(tmp.name)
        tmp_path.write_text(content)
    
    print(json.dumps({"id": str(tmp_path), "content": content}))

def handle_read(data):
    path = Path(data.get("id"))
    if not path.exists():
        sys.exit(22)

    print(json.dumps({"id": str(path), "content": path.read_text()}))

def handle_update(data):
    path = Path(data.get("id"))
    content = data.get("input", {}).get("content", "")
    path.write_text(content)
    print(json.dumps({"id": str(path), "content": content}))

def handle_delete(data):
    Path(data.get("id")).unlink(missing_ok=True)

if __name__ == '__main__':
    main()
```

Here you can see how we can implement a provider in a fraction of the boilerplate you would usually need to achieve this within the terraform provider framework.

## Terraform Configuration

This is an example of how a resource can be configured to use your custom provider.

```hcl
resource "customcrud" "example_file" {
  hooks {
    create = "python3 file_provider.py --action create"
    read   = "python3 file_provider.py --action read"
    update = "python3 file_provider.py --action update"
    delete = "python3 file_provider.py --action delete"
  }

  input = {
    content = "Hello, World!"
  }
}
```

This example isn't very useful in the real world, but this same concept can be applied to almost any resource, for example:
- using cloud provider clis to create resources or options not yet supported (or badly supported!) by their terraform provider.
- any API that doesn't have a terraform provider
- triggering CI/CD pipelines that create resources

By enabling terraform to be used for any resource, you can have *all* of your dependencies managed by terraform's dependency management.
