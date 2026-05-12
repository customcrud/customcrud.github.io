import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import LogoSvg from '@site/static/img/logo.svg';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <LogoSvg className={`${styles.heroBgLogo} ${styles.heroBgLogo1}`} />
      <LogoSvg className={`${styles.heroBgLogo} ${styles.heroBgLogo2}`} />
      <LogoSvg className={`${styles.heroBgLogo} ${styles.heroBgLogo3}`} />
      <LogoSvg className={`${styles.heroBgLogo} ${styles.heroBgLogo4}`} />
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Tutorial: A Python Terraform Provider in 5 minutes ⏱️
          </Link>
        </div>
        <div className={styles.githubStars}>
          <iframe
            src="https://ghbtns.com/github-btn.html?user=customcrud&repo=terraform-provider-customcrud&type=star&count=true&size=large"
            width="170"
            height="30"
            title="GitHub Stars"
          />
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
