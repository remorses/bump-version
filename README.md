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
In a monorepo you can use the input `prefix` for versioning subdirectories and give different prefixes to git tags,
if using prefix you can bump versions adding the pattern `[bump if {prefix}]` above the line containing the version, for example in a python setup.py:
```py
from setuptools import setup, find_packages
setup(
  name='foo',
  # [bump if dir2]
  version='1.0.0',
  ...
```
```yaml
- name: Bump version
  uses: remorses/bump-version@js
  with:
    version_file: ./dir2/VERSION
    prefix: dir2
  env:
    GITHUB_TOKEN: {{ secrets.GITHUB_TOKEN }}
```
