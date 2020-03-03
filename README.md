# Bump version

Bump the version number in the provided `version_file`.
Bumps version numbers found after lines containing `[bump]`.
**Please use the `js` branch that is faster and better.**

## Usage:

```yaml
- name: Bump version
  uses: remorses/bump-version@js
  with:
      version_file: ./VERSION
  env:
      GITHUB_TOKEN: { { secrets.GITHUB_TOKEN } }
```

## Usage in a monorepo:

You can give a prefix to the tag, the action will relace version after line containing the pattern `[bump if {prefix}]`
Useful if you have many versions to bump.

```yaml
- name: Bump versions
  uses: remorses/bump-version@js
  with:
      version_file: ./dir2/VERSION
      prefix: dir2
  env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
# will create the tag {prefix}_{version}
```

## Usage with custom branch:

You can give prefixes to tags

```yaml
- name: Bump version
  uses: remorses/bump-version@js
  with:
      version_file: ./dir2/VERSION
      prefix: dir2
  env:
      BRANCH: custom_branchname
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Usage locally

if used as npm bin it won't push, do it manually locally

```
npm i -g bumpversions
INPUT_VERSION_FILE=versionpath bumpversions
git push
git push --tags
```
