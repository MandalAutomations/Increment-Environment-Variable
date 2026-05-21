# Increment Environment Variable

This is a GitHub Action that increments an environment variable.
If environment variable does not exist, it will create it and set it to 1.

## Usage
```YAML
- name: Increment Environment Variable
  uses:  MandalAutomations/Increment-Environment-Variable@v1
  with:
    Name: "Name for the variable to increment"
    EnvironmentName: "Environment Name"
    RepoId: ${{ github.repository_id }}
    Token: ${{ secrets.PAT_TOKEN }}
```
### Increment variable in multiple environments use matrix
```YAML
increment:
    runs-on: ubuntu-latest
    strategy:
        matrix:
            environments: ["ev1", "ev2", "ev3"]
    steps:
        - name: Increment Environment Variable
          uses:  MandalAutomations/Increment-Environment-Variable@v1
          with:
            Name: "Name for the variable to increment"
            EnvironmentName: ${{ matrix.environments }}
            RepoId: ${{ github.repository_id }}
            Token: ${{ secrets.PAT_TOKEN }}
```

## Inputs
### Name:
`Required` `String` Name for the variable to increment. Whitespace is replaced with `_`.

### EnvironmentName:
`Required` `String` Environment Name

### RepoId:
`Required` `String` Repository ID can be found using  ${{ github.repository_id }}

### Token:
`Required` `String` Personal Access Token (PAT). The built-in `GITHUB_TOKEN` cannot write environment variables, so a PAT is required.

**Required scopes:**
- Classic PAT: `repo`
- Fine-grained PAT, on the target repository: `Variables: Read and write` and `Environments: Read and write`

## Behavior

- If the variable does not exist, it is created with value `1`.
- If the variable exists and its value is a non-negative integer, it is incremented by 1.
- If the variable exists but its value is not a non-negative integer, the step logs a warning and exits successfully without changing anything.
