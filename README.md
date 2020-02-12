# Bump version
Please use the `js` branch that is faster and better. 
Bump the version number in the provided `version_file`.
Bumps version numbers found after lines containing `[bump]`.


## Usage:
```yaml
- name: Bump version
  uses: remorses/bump-version@js
  with:
    version_file: ./VERSION
  env:
    GITHUB_TOKEN: {{ secrets.GITHUB_TOKEN }}
```

## Usage in a monorepo:
You can give prefixes to tags
```yaml
- name: Bump version
  uses: remorses/bump-version@js
  with:
    version_file: ./dir2/VERSION
    prefix: dir2
  env:
    GITHUB_TOKEN: {{ secrets.GITHUB_TOKEN }}
```


## Usage locally
```
npm i -g bumpversions
INPUT_VERSION_FILE=versionpath bumpversions
```