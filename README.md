# Mykeels.Symlinks

A library that provides a way to symlink files within a project.

## Usage

Add a `symlinks.yml` file to the root of your project. The file should contain a list of symlinks to create. The symlinks will be created relative to the location of the `symlinks.yml` file.

```yaml
/path/to/source: 
  - /path/to/symlink/1
  - /path/to/symlink/2
  - /path/to/symlink/n
/path/to/source-2:
  - /glob-*/path/to/destinations
/path/to/source-3:
  - /glob-*/path/to/{project-1,project-2}
```

and run `npm install @mykeels/symlinks` and `./node_modules/.bin/symlinks` to create the symlinks.

or run `npx @mykeels/symlinks` to create the symlinks.

## Glob Patterns

Glob Patterns are supported for only the destination paths. The source paths must be exact.

## Good to know

- The symlinks will be created relative to the location of the `symlinks.yml` file.
- The symlinked files should NOT be committed to the repository else it just adds noise to the repository.
