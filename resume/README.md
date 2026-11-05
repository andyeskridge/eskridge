# Historical resume source

`archive/2025/AndyEskridgeResume.typ` preserves the source conversion requested
in PR #1559. Its facts and dates were checked against the historical PDF at
`public/AndyEskridgeResume.pdf` in commit
`e51615516650d9fc4f7b8a6a7be303e9bf443423` (PDF blob
`3ff0a9ccb29bcbeff6610c6ffcd6c3a92af521d7`).

This is a historical repository snapshot. Employment dates, contact details,
and the word "Present" are retained from that source and are not claims that
the resume is current. The company's shared employment range is shown once
for its grouped roles, as in the original PDF.

The source stays outside Astro's `public` directory. The retired
`/AndyEskridgeResume.pdf` route remains `410`; this archive does not add a live
download, navigation link, or CMS content.

Compile with Typst 0.15.1 after creating the ignored `output/pdf` directory:

```sh
typst compile resume/archive/2025/AndyEskridgeResume.typ output/pdf/AndyEskridgeResume-2025.pdf
```

The default font is Times New Roman. On another platform, choose an installed
font with `--input 'font=Liberation Serif'` (or another available family). Keep
generated PDFs and rendered review images under ignored `output/`.
