import { getAllArticles } from './getAllArticles'
import { Article } from 'contentlayer/generated'

function addLeadingZero(num: string | number) {
  num = num.toString()
  while (num.length < 2) num = '0' + num
  return num
}

function buildRFC822Date(dateString: string) {
  const dayStrings = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthStrings = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  const timeStamp = Date.parse(dateString)
  const date = new Date(timeStamp)

  const day = dayStrings[date.getDay()]
  const dayNumber = addLeadingZero(date.getDate())
  const month = monthStrings[date.getMonth()]
  const year = date.getFullYear()
  const time = `${addLeadingZero(date.getHours())}:${addLeadingZero(
    date.getMinutes()
  )}:00`
  const timezone = date.getTimezoneOffset() === 0 ? 'GMT' : 'BST'

  //Wed, 02 Oct 2002 13:00:00 GMT
  return `${day}, ${dayNumber} ${month} ${year} ${time} ${timezone}`
}

function buildRssItems(items: Article[]) {
  return items
    .map((item) => {
      return `
        <item>
        <title>${item.title}</title>
        <description>${item.description}</description>
        <author>andy@eskridge.dev (Andy Eskridge)</author>
        <link>https://eskridge.dev${item.url}</link>
        <guid>https://eskridge.dev${item.url}</guid>
        <pubDate>${buildRFC822Date(item.date)}</pubDate>
        </item>
        `
    })
    .join('')
}

export function generateRssFeed() {
  let articles = getAllArticles()

  const rssFeed = `<?xml version="1.0"?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>eskridge.dev</title>
    <atom:link href="https://eskridge.dev/feed" rel="self" type="application/rss+xml" />
    <link>https://eskridge.dev</link>
    <description>eskridge.dev is a small portfolio site written by Andy Eskridge</description>
    ${buildRssItems(articles)}
  </channel>
  </rss>`

  return rssFeed
}
