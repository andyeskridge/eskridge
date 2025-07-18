import clsx from 'clsx';
import Image, { type ImageProps } from 'next/image';
import Link from 'next/link';
import type { ComponentPropsWithoutRef, ComponentType } from 'react';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Container } from '@/components/container';
import { ArrowDownIcon, BriefcaseIcon, MailIcon } from '@/components/icons';
import {
  GitHubIcon,
  LinkedInIcon,
  MastodonIcon,
  TwitterIcon,
} from '@/components/social-icons';
import logoAllegro from '@/images/logos/allegro.jpg';
import logoBeckTech from '@/images/logos/becktech.jpg';
import logoCenergistic from '@/images/logos/cenergistic.jpg';
import logoGwynnGroup from '@/images/logos/gwynngroup.jpg';
import logoProviderScience from '@/images/logos/providerscience.jpg';
import logoStellarElements from '@/images/logos/SE_Star_BLK.svg';
import image1 from '@/images/photos/image-1.jpg';
import image2 from '@/images/photos/image-2.jpg';
import image3 from '@/images/photos/image-3.jpg';
import image4 from '@/images/photos/image-4.jpg';
import image5 from '@/images/photos/image-5.jpg';
import { formatDate } from '@/lib/format-date';
import { getAllArticles } from '@/lib/get-all-articles';
import type { Post } from '@/tina/__generated__/types';

function Article({ article }: { article: Post }) {
  return (
    <Card as="article">
      <Card.Title href={`/articles/${article._sys.filename}`}>
        {article.title}
      </Card.Title>
      <Card.Eyebrow as="time" dateTime={article.date} decorate>
        {formatDate(article.date)}
      </Card.Eyebrow>
      <Card.Description>{article.description}</Card.Description>
      <Card.Meta category={article.category} tags={article.tags} />
      <Card.Cta>Read article</Card.Cta>
    </Card>
  );
}

function SocialLink({
  icon: Icon,
  ...props
}: ComponentPropsWithoutRef<typeof Link> & {
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link className="group -m-1 p-1" {...props}>
      <Icon className="h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300" />
    </Link>
  );
}

function Newsletter() {
  return (
    <form
      action="https://buttondown.email/api/emails/embed-subscribe/andyeskridge"
      className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40"
      method="post"
      target="popupwindow"
    >
      <h2 className="flex font-semibold text-sm text-zinc-900 dark:text-zinc-100">
        <MailIcon className="h-6 w-6 flex-none" />
        <span className="ml-3">Stay up to date</span>
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Get notified when I publish something new, and unsubscribe at any time.
      </p>
      <div className="mt-6 flex">
        <input name="embed" type="hidden" value="1" />
        <input
          aria-label="Email address"
          className="min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:text-sm dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:focus:border-teal-400 dark:focus:ring-teal-400/10 dark:placeholder:text-zinc-500"
          name="email"
          placeholder="Email address"
          required
          type="email"
        />
        <Button className="ml-4 flex-none" type="submit">
          Join
        </Button>
      </div>
    </form>
  );
}

interface Role {
  company: string;
  title: string;
  logo: ImageProps['src'];
  start: string | { label: string; dateTime: string };
  end: string | { label: string; dateTime: string };
  link: string;
}

function Role({ role }: { role: Role }) {
  const startLabel =
    typeof role.start === 'string' ? role.start : role.start.label;
  const startDate =
    typeof role.start === 'string' ? role.start : role.start.dateTime;

  const endLabel = typeof role.end === 'string' ? role.end : role.end.label;
  const endDate = typeof role.end === 'string' ? role.end : role.end.dateTime;

  return (
    <li className="flex gap-4">
      <div className="relative mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
        <Image alt="" className="h-7 w-7" src={role.logo} unoptimized />
      </div>
      <dl className="flex flex-auto flex-wrap gap-x-2">
        <dt className="sr-only">Company</dt>
        <dd className="w-full flex-none font-medium text-sm text-zinc-900 dark:text-zinc-100">
          <Link href={role.link}>{role.company}</Link>
        </dd>
        <dt className="sr-only">Role</dt>
        <dd className="text-xs text-zinc-500 dark:text-zinc-400">
          {role.title}
        </dd>
        <dt className="sr-only">Date</dt>
        <dd className="ml-auto text-xs text-zinc-400 dark:text-zinc-500">
          <time dateTime={startDate}>{startLabel}</time>{' '}
          <span aria-hidden="true">—</span>{' '}
          <time dateTime={endDate}>{endLabel}</time>
        </dd>
      </dl>
    </li>
  );
}

function Resume() {
  const resume: Role[] = [
    {
      company: 'Stellar Elements',
      title: 'Associate Director',
      logo: logoStellarElements,
      start: '2022',
      end: {
        label: 'Present',
        dateTime: new Date().getFullYear().toString(),
      },
      link: 'https://stellarelements.com',
    },
    {
      company: 'Cenergistic',
      title: 'CTO',
      logo: logoCenergistic,
      start: '2018',
      end: '2022',
      link: 'https://cenergistic.com',
    },
    {
      company: 'Beck Technology',
      title: 'Project Leader',
      logo: logoBeckTech,
      start: '2016',
      end: '2018',
      link: 'https://beck-technology.com',
    },
    {
      company: 'ProviderScience',
      title: 'Senior Software Engineer',
      logo: logoProviderScience,
      start: '2015',
      end: '2016',
      link: 'https://providerscience.com',
    },
    {
      company: 'Gwynn Group',
      title: 'Senior Software Engineer',
      logo: logoGwynnGroup,
      start: '2015',
      end: '2015',
      link: 'https://gwynngroup.com',
    },
    {
      company: 'Allegro',
      title: 'Software Developer',
      logo: logoAllegro,
      start: '2013',
      end: '2015',
      link: 'https://iongroup.com/products/commodities/allegro/',
    },
  ];

  return (
    <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <h2 className="flex font-semibold text-sm text-zinc-900 dark:text-zinc-100">
        <BriefcaseIcon className="h-6 w-6 flex-none" />
        <span className="ml-3">Work</span>
      </h2>
      <ol className="mt-6 space-y-4">
        {resume.map((role) => (
          <Role key={role.company} role={role} />
        ))}
      </ol>
      <Button
        className="group mt-6 w-full"
        href="/AndyEskridgeResume.pdf"
        target="_blank"
        variant="secondary"
      >
        Download CV
        <ArrowDownIcon className="h-4 w-4 stroke-zinc-400 transition group-active:stroke-zinc-600 dark:group-active:stroke-zinc-50 dark:group-hover:stroke-zinc-50" />
      </Button>
    </div>
  );
}

function Photos() {
  const rotations = [
    'rotate-2',
    '-rotate-2',
    'rotate-2',
    'rotate-2',
    '-rotate-2',
  ];

  return (
    <div className="mt-16 sm:mt-20">
      <div className="-my-4 flex justify-center gap-5 overflow-hidden py-4 sm:gap-8">
        {[image1, image2, image3, image4, image5].map((image, imageIndex) => (
          <div
            className={clsx(
              'relative aspect-[9/10] w-44 flex-none overflow-hidden rounded-xl bg-zinc-100 sm:w-72 sm:rounded-2xl dark:bg-zinc-800',
              rotations[imageIndex % rotations.length]
            )}
            key={image.src}
          >
            <Image
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              sizes="(min-width: 640px) 18rem, 11rem"
              src={image}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function Home() {
  const articles = (await getAllArticles()).slice(0, 4);

  return (
    <>
      <Container className="mt-9">
        <div className="max-w-2xl">
          <h1 className="font-bold text-4xl text-zinc-800 tracking-tight sm:text-5xl dark:text-zinc-100">
            Senior Engineering Manager
          </h1>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            I’m Andy, a senior engineering manager based in Dallas, TX. I was
            raised in Florida, but I’ve lived in Texas for the last 10 years.
            I’m a husband and father of three. One of my favorite hobbies is
            running races.
          </p>
          <div className="mt-6 flex gap-6">
            <SocialLink
              aria-label="Follow on Twitter"
              href="https://twitter.com/andyeskridge"
              icon={TwitterIcon}
            />
            <SocialLink
              aria-label="Follow on GitHub"
              href="https://github.com/andyeskridge"
              icon={GitHubIcon}
            />
            <SocialLink
              aria-label="Follow on LinkedIn"
              href="https://linkedin.com/in/andyeskridge"
              icon={LinkedInIcon}
            />
            <SocialLink
              aria-label="Follow on Mastodon"
              href="https://mastodon.social/@andy"
              icon={MastodonIcon}
              rel="me"
            />
          </div>
        </div>
      </Container>
      <Photos />
      <Container className="mt-24 md:mt-28">
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2">
          <div className="flex flex-col gap-16">
            {articles.map((article) => (
              <Article article={article} key={article._sys.filename} />
            ))}
          </div>
          <div className="space-y-10 lg:pl-16 xl:pl-24">
            <Resume />
            <Newsletter />
          </div>
        </div>
      </Container>
    </>
  );
}
