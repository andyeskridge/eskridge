/** @type {import("prettier").Options} */
module.exports = {
  singleQuote: true,
  semi: false,
  plugins: [
    'prettier-plugin-tailwindcss',
    '@ianvs/prettier-plugin-sort-imports',
  ],
  importOrder: [
    '<BUILTIN_MODULES>',
    '<THIRD_PARTY_MODULES>',
    '',
    '^@/lib/(.*)$',
    '',
    '^@/components/(.*)$',
    '',
    '^@/tina/(.*)$',
    '',
    '^@/images/(.*)$',
    '',
    '^[./]',
  ],
  importOrderTypeScriptVersion: '5.0.0',
}
