module.exports = {
  singleQuote: true,
  semi: false,
  plugins: [
    require('@trivago/prettier-plugin-sort-imports'),
    require('prettier-plugin-tailwindcss'),
  ],
  importOrder: ['^@components/(.*)$', '^@lib/(.*)$', '^@images/(.*)$', '^[./]'],
  importOrderSeparation: true,
}
