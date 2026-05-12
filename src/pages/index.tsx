import { useEffect, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import LogoSvg from '@site/static/img/logo.svg';

import styles from './index.module.css';

const providerLanguages: { name: string; color: string }[] = [
  { name: 'Python', color: '#ffd56b' },
  { name: 'Bash', color: '#6aff78' },
  { name: 'TypeScript', color: '#6b91ff' },
  { name: 'Rust', color: '#ff8c42' },
  { name: 'Ruby', color: '#ff4d6a' },
];
const holdDurationMs = 2000;
const backspaceDurationMs = 50;
const typeDurationMs = 95;

function AnimatedProviderLabel() {
  const [language, setLanguage] = useState(providerLanguages[0].name);
  const [languageIndex, setLanguageIndex] = useState(-1);
  const [activeColor, setActiveColor] = useState(providerLanguages[0].color);
  const [phase, setPhase] = useState<'holding' | 'deleting' | 'typing'>(
    'holding',
  );

  useEffect(() => {
    const timeout = window.setTimeout(
      () => {
        if (phase === 'holding') {
          setPhase('deleting');
          return;
        }

        if (phase === 'deleting') {
          if (language.length > 0) {
            setLanguage((current) => current.slice(0, -1));
            return;
          }

          const nextIndex = (languageIndex + 1) % providerLanguages.length;
          setLanguageIndex(nextIndex);
          setActiveColor(providerLanguages[nextIndex].color);
          setPhase('typing');
          return;
        }

        const targetLanguage = providerLanguages[languageIndex].name;
        if (language.length < targetLanguage.length) {
          setLanguage(targetLanguage.slice(0, language.length + 1));
          return;
        }

        setPhase('holding');
      },
      phase === 'holding'
        ? holdDurationMs
        : phase === 'deleting'
          ? backspaceDurationMs
          : typeDurationMs,
    );

    return () => window.clearTimeout(timeout);
  }, [language, languageIndex, phase]);

  return (
    <span className={styles.providerLabel}>
      Terraform Providers in{' '}
      <span
        className={styles.providerLanguage}
        style={{ '--lang-color': activeColor } as React.CSSProperties}
      >
        {language}
      </span>
    </span>
  );
}

function HomepageHeader() {
  return (
    <header className={styles.heroBanner}>
      <LogoSvg className={`${styles.heroBgLogo} ${styles.heroBgLogo1}`} />
      <LogoSvg className={`${styles.heroBgLogo} ${styles.heroBgLogo2}`} />
      <LogoSvg className={`${styles.heroBgLogo} ${styles.heroBgLogo3}`} />
      <LogoSvg className={`${styles.heroBgLogo} ${styles.heroBgLogo4}`} />
      <div className="container">
        <h1 className={styles.heroTitle}>
          <AnimatedProviderLabel />
        </h1>
        <p className={styles.heroSubtitle}>
          Lightweight custom Terraform providers
          <br />
          in the languages you already use.
        </p>
        <div className={styles.buttons}>
          <Link
            className={clsx('button button--lg', styles.primaryButton)}
            to="/docs/intro">
            Get Started
          </Link>
          <Link
            className={clsx('button button--lg', styles.secondaryButton)}
            href="https://github.com/customcrud/terraform-provider-customcrud">
            View on GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - ${siteConfig.tagline}`}
      description="Custom CRUD - terraform providers in any language!">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
