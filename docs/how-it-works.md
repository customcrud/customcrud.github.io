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

*   **`id`**: The unique identifier of the resource. This will be populated by the `id` field returned from the `create`. (populated in all hooks other than `create`)
*   **`input`**: The merged result of your `input` and `input_wo` arguments from your Terraform configuration.
*   **`output`**: Stored output values from the previous hook run. (populated in all hooks other than `create`)

### Output (`stdout`)

Your script must print a valid JSON object to stdout. This object is used to update the Terraform state.

```json
{
  "id": "e3218da9",
  "name": "cruddy",
  "count": 5,
  "status": "online"
}
```

*   **`id`**: (Required for `create`) The new ID of the resource. If omitted in other phases, the existing ID is preserved.
*   **Other keys**: Any other keys returned will be stored in the resource's `output` map and effectively merged into the `input` map for future runs.

### Exit Codes

The provider uses the script's exit code to determine success or failure:

*   **0**: Success. The `stdout` JSON is processed.
*   **22**: Resource Not Found.
    *   Only in the `read` hook: Signals that the resource no longer exists. Terraform will remove it from the state, and a creation will show up in your plan.
*   **Any other non-zero**: Error. The provider will fail the Terraform operation and display the script's `stderr` to the user.

## Environment Variables

Custom CRUD hooks inherit their environment with the parent terraform process, so if you want to be able to pass any configuration via environment variables directly in your hook handler, you can do so as long as the variables are set within the environment you are running terraform.
