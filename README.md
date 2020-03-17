# Bump version

This actions does 3 things:
- Bumps the version number in the provided `version_file`.
- Creates a tag for the new version (prefixed with the `prefix` input if provided).
- Bumps all the versions under lines with the pattern `[bump]` (or `[bump if prefix]` if a prefix is provided).

**Please use the `js` branch as it is the one up to date.**

## Usage:

```yaml
- name: Bump version
  uses: remorses/bump-version@js
  with:
      version_file: ./VERSION
      github_token: ${{ secrets.GITHUB_TOKEN }}
      branch: master
```

## Usage in a monorepo:

You can give a prefix to the tag, the action will relace version after line containing the pattern `[bump if {prefix}]`
Useful if you have many versions to bump.

```yaml
- name: Bump versions
  uses: remorses/bump-version@js
  with:
      version_file: ./dir2/VERSION
      prefix: dir2 # this will prefix the created tag
      github_token: ${{ secrets.GITHUB_TOKEN }}
# will create the tag {prefix}_{version}
```

## Created annotations

The action also creates annotations on the code and on the actions page

![](https://raw.githubusercontent.com/remorses/bump-version/js/.github/1.png)

![](https://raw.githubusercontent.com/remorses/bump-version/js/.github/2.png)
