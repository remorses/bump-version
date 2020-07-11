# smart-glob

`smart-glob` is the only nodejs glob searcher that does not recurse inside every directory it finds

This is useful when you want to ignore certain folders from being scanned like `node_modules`

```
npm i smart-glob
```

## Benchmark

Here is a benchmark with other globs solutions run on this package folder ignoring the `node_modules` directory

You can find this benchmark in the `/tests` folder

```
benchmarks

tiny-glob: 168.075ms
    ✓ tiny-glob (169ms)
fast-glob: 6.027ms
    ✓ fast-glob
globby: 4.359ms
    ✓ globby
glob: 397.735ms
    ✓ glob (398ms)
smart-blog: 3.981ms
    ✓ smart-blog
```
