import Script from 'next/script'

const modeScript = `
  let darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  updateMode()
  darkModeMediaQuery.addEventListener('change', updateModeWithoutTransitions)
  window.addEventListener('storage', updateModeWithoutTransitions)

  function updateMode() {
    let isSystemDarkMode = darkModeMediaQuery.matches
    let isDarkMode = window.localStorage.isDarkMode === 'true' || (!('isDarkMode' in window.localStorage) && isSystemDarkMode)

    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    if (isDarkMode === isSystemDarkMode) {
      delete window.localStorage.isDarkMode
    }
  }

  function disableTransitionsTemporarily() {
    document.documentElement.classList.add('[&_*]:!transition-none')
    window.setTimeout(() => {
      document.documentElement.classList.remove('[&_*]:!transition-none')
    }, 0)
  }

  function updateModeWithoutTransitions() {
    disableTransitionsTemporarily()
    updateMode()
  }
`

export default function Head() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/inline-script-id,@next/next/no-before-interactive-script-outside-document */}
      <Script id="themeScript">{modeScript}</Script>
      <link
        rel="alternate"
        type="application/rss+xml"
        href={`${process.env.NEXT_PUBLIC_SITE_URL}/feed.xml`}
      />
      <link
        rel="alternate"
        type="application/feed+json"
        href={`${process.env.NEXT_PUBLIC_SITE_URL}/feed.json`}
      />
      <title>Andy Eskridge - Senior Engineering Manager</title>
      <meta
        name="description"
        content="I’m Andy, a senior engineering manager based in Dallas, TX."
      />
    </>
  )
}
