import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { Container } from '@/components/Container'
import { MailIcon } from '@/components/Icons'
import {
  GitHubIcon,
  LinkedInIcon,
  MastodonIcon,
  TwitterIcon,
} from '@/components/SocialIcons'

import portraitImage from '@/images/portrait.jpg'

function SocialLink({
  className,
  href,
  children,
  icon: Icon,
  rel,
}: {
  className?: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  rel?: string
}) {
  return (
    <li className={clsx(className, 'flex')}>
      <Link
        href={href}
        className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
        rel={rel}
      >
        <Icon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500" />
        <span className="ml-4">{children}</span>
      </Link>
    </li>
  )
}

export const metadata = {
  title: 'About',
  description: 'I’m Andy, a senior engineering manager based in Dallas, TX.',
}

export default function About() {
  return (
    <Container className="mt-16 sm:mt-32">
      <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
        <div className="lg:pl-20">
          <div className="max-w-xs px-2.5 lg:max-w-none">
            <Image
              src={portraitImage}
              alt=""
              sizes="(min-width: 1024px) 32rem, 20rem"
              className="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800"
            />
          </div>
        </div>
        <div className="lg:order-first lg:row-span-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
            I’m Andy, a senior engineering manager based in Dallas, TX.
          </h1>
          <div className="mt-6 space-y-7 text-base text-zinc-600 dark:text-zinc-400">
            <p>
              I am a Senior Engineering Manager with experience managing product
              development, software engineering and quality assurance teams. I
              produce highly productive and effective teams through
              technological expertise and empathetic leadership, building value
              through trust and personal investment in team members. I have
              demonstrated success in managing growing markets, delivering
              multiple products, and producing impressive results on time. I can
              take complete ownership of the design, development, testing,
              deployment, and maintenance of software applications, systems, and
              technology projects.
            </p>
          </div>
        </div>
        <div className="lg:pl-20">
          <ul role="list">
            <SocialLink
              href="https://twitter.com/andyeskridge"
              icon={TwitterIcon}
            >
              Follow on Twitter
            </SocialLink>
            <SocialLink
              href="https://github.com/andyeskridge"
              icon={GitHubIcon}
              className="mt-4"
            >
              Follow on GitHub
            </SocialLink>
            <SocialLink
              href="https://linkedin.com/in/andyeskridge"
              icon={LinkedInIcon}
              className="mt-4"
            >
              Follow on LinkedIn
            </SocialLink>
            <SocialLink
              href="https://mastodon.social/@andy"
              icon={MastodonIcon}
              className="mt-4"
              rel="me"
            >
              Follow on Mastodon
            </SocialLink>
            <SocialLink
              href="mailto:andy@eskridge.dev"
              icon={MailIcon}
              className="mt-8 border-t border-zinc-100 pt-8 dark:border-zinc-700/40"
            >
              andy@eskridge.dev
            </SocialLink>
          </ul>
        </div>
      </div>
    </Container>
  )
}
