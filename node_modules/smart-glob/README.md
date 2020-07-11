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

tiny-glob: 157.726ms
    ✓ tiny-glob (158ms)
fast-glob: 8.392ms
    ✓ fast-glob
globby: 7.855ms
    ✓ globby
glob: 391.656ms
    ✓ glob (392ms)
smart-blog: 3.261ms
    ✓ smart-blog
```
