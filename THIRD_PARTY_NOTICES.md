# Third-Party Notices

This project includes open-source software under third-party licenses.

---

## qiita_marker

- Repository: https://github.com/increments/qiita_marker
- Reference commit: `cb88c6062b43973c4508f568d1bce86de4a6acdb`
- Upstream License: MIT License
- Copyright:
  - Copyright (c) 2015 Garen J. Torikian
  - Copyright (c) 2021 Qiita Inc.

### Modifications for KanTanMarkdown
- Ported custom block parsing logic from C (qfm_custom_block.c / qfm_scanners.re) to pure JavaScript.
- Integrated with marked 0.3.x Lexer and Parser architecture.
- Added support for Qiita Note syntax (`:::note info|warn|alert ... :::`).
- Implemented self-contained inline SVG icons to eliminate external font or CDN dependencies.
- Added scoped CSS styles preventing styling conflicts with existing KanTanMarkdown alert classes.

### License Text

```text
The MIT License (MIT)

Copyright (c) 2015 Garen J. Torikian
Copyright (c) 2021 Qiita Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

---

## qiita-markdown

- Repository: https://github.com/increments/qiita-markdown
- Reference commit: `d7d3908333b3f12f5cf32d57f9baa55d8f673f25`
- Upstream License: MIT License
- Copyright:
  - Copyright (c) 2014 Ryo Nakamura

### Modifications for KanTanMarkdown
- Referenced custom block filter specification (lib/qiita/markdown/filters/custom_block.rb) for note type normalization, subtype fallback rules, and HTML DOM structure.

### License Text

```text
The MIT License (MIT)

Copyright (c) 2014 Ryo Nakamura

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
