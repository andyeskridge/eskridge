export function getArticleIds() {
  return require
    .context('../app/articles', true, /\/page\.mdx$/)
    .keys()
    .filter((key: string) => key.startsWith('./'))
    .map((key: string) => key.slice(2).replace(/\/page\.mdx$/, ''))
}
