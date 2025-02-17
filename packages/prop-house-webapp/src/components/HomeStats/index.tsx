import classes from './HomeStats.module.css';
import CountUp from 'react-countup';
import { StatsProps } from '../pages/Home';
import { useState } from 'react';
import TruncateThousands from '../TruncateThousands';

interface HomeStatsProps {
  stats: StatsProps;
}

const HomeStats = ({ stats }: HomeStatsProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const onEnd = () => {
    setLoading(true);
  };

  const homeStats = [
    {
      amount: stats.accEthFunded,
      text: 'ETH funded',
    },
    {
      amount: stats.accRounds,
      text: `Funding ${stats.accRounds === 1 ? 'round' : 'rounds'}`,
    },
    {
      amount: stats.accProps,
      text: `Submitted ${stats.accProps === 1 ? 'prop' : 'props'}`,
    },
  ];

  return (
    <div className={classes.statsContainer}>
      {homeStats.map(s => (
        <div className={classes.stat}>
          {!loading ? (
            <CountUp start={0} end={s.amount} suffix="+" delay={0} onEnd={onEnd}>
              {({ countUpRef }) => <span ref={countUpRef} className={classes.amount} />}
            </CountUp>
          ) : (
            <span className={classes.amount}>
              <TruncateThousands amount={s.amount} />+
            </span>
          )}
          <p className={classes.subtitle}>{s.text}</p>
        </div>
      ))}
    </div>
  );
};

export default HomeStats;
