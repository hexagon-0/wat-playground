# WebAssembly Text Format Playground

A simple interface to run WebAssembly text files (.wat), akin to a
fantasy console.

## Hooks

If exported from your module, the following functions are used:

- `start` is run once

- `update` is called via `requestAnimationFrame` (about 60 times per second)

## Memory Map

Memory is provided as `js.mem`. Import it into your module like this:

```wat
(module
  (memory (import "js" "mem") 1)
  (; rest of your program ;))
```

Display is 32x32 pixels with 8bpp depth (1024 bytes long) mapped to
region 0x200 to 0x5ff.

| Value | Color |
|-------|-------|
|     0 | Black |
|     1 | Red   |
|     2 | Green |
|     3 | Blue  |
|     4 | White |

Keyboard input is mapped to address 0x100, keys A, D, W and S correspond to bits
0, 1, 2 and 3 respectively (0 = key up, 1 = key down).
