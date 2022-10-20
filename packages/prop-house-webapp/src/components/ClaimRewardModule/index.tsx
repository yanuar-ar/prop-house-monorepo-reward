import clsx from 'clsx';
import { MdOutlineCheckCircleOutline as VoteIcon } from 'react-icons/md';
import classes from './ClaimRewardModule.module.css';

const ClaimRewardModule = () => {
  return (
    <>
      <div className={classes.sideCardHeader}>
        <div className={clsx(classes.icon, classes.blackIcon)}>
          <VoteIcon />
        </div>
        <div className={classes.textContainer}>
          <p className={classes.title}>Get Reward</p>
        </div>
      </div>

      <hr className={classes.divider} />

      <p className={clsx(classes.sideCardBody, classes.winnersText)}>
        Winners are eligible to mint Proof of Win.
      </p>
    </>
  );
};

export default ClaimRewardModule;
