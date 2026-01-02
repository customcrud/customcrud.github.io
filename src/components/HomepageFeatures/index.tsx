import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Terraform Everything',
    Svg: require('@site/static/img/undraw_data-processing.svg').default,
    description: (
      <>
        No provider for <strong>______</strong>? Make your own quickly, in any language.
      </>
    ),
  },
  {
    title: 'Keep your secrets, secret!',
    Svg: require('@site/static/img/undraw_security-on.svg').default,
    description: (
      <>
        Supports <a href='https://developer.hashicorp.com/terraform/language/manage-sensitive-data/write-only'>write-only</a> input, so you can use it with ephemeral resources.
      </>
    ),
  },
  {
    title: 'Developer Happiness',
    Svg: require('@site/static/img/undraw_programming.svg').default,
    description: (
      <>
        Clear logging will let you develop your hooks without needing to reach for <code>TF_LOG</code>.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
