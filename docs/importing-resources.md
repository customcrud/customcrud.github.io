---
sidebar_position: 3
---

# Importing Resources

One of the major advantages of Custom CRUD over other similar projects is it's ability to import resources for your virtual provider.

Imports work via encoding all of the provider hook information into json and using that as the import ID, for example:

```shell
terraform import customcrud.file_example '{"id":"/path/to/file","hooks":{"create":"create.sh","read":"read.sh","update":"update.sh","delete":"delete.sh"},"input":{"content":"test"},"output":{"content":"test"}}'
```

or more easily via a declarative import:

```hcl
import {
  to = customcrud.file_example
  id = jsonencode({
    id = "/path/to/file"
    hooks = {
      create = "create.sh"
      read   = "read.sh"
      update = "update.sh"
      delete = "delete.sh"
    }
    input = {
      content = "test"
    }
    output = {
      content = "test"
    }
  })
}
```

This allows you to migrate all of your existing resources that were created by other unmanaged means into terraform, and live happily ever after.
