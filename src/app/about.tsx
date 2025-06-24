import { Link, createFileRoute } from '@tanstack/react-router';
import clsx from 'clsx';
import type React from 'react';

import { Container } from '@/components/container';
import { MailIcon } from '@/components/icons';
import {
  GitHubIcon,
  LinkedInIcon,
  MastodonIcon,
  TwitterIcon,
} from '@/components/social-icons';

import portraitImage from '@/images/portrait.jpg';

function SocialLink({
  className,
  href,
  children,
  icon: Icon,
  rel,
}: {
  className?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  rel?: string;
}) {
  return (
    <li className={clsx(className, 'flex')}>
      <Link
        to={href}
        className="group flex font-medium text-sm text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
        rel={rel}
      >
        <Icon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500" />
        <span className="ml-4">{children}</span>
      </Link>
    </li>
  );
}

export const Route = createFileRoute('/about')({
  component: About,
});

export default function About() {
  return (
    <Container className="mt-16 sm:mt-32">
      <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
        <div className="lg:pl-20">
          <div className="max-w-xs px-2.5 lg:max-w-none">
            <img
              src={portraitImage}
              alt=""
              sizes="(min-width: 1024px) 32rem, 20rem"
              className="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800"
            />
          </div>
        </div>
        <div className="lg:order-first lg:row-span-2">
          <h1 className="font-bold text-4xl text-zinc-800 tracking-tight sm:text-5xl dark:text-zinc-100">
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
          <ul>
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
              className="mt-8 border-zinc-100 border-t pt-8 dark:border-zinc-700/40"
            >
              andy@eskridge.dev
            </SocialLink>
          </ul>
        </div>
      </div>
    </Container>
  );
}
