import clsx from 'clsx';
import { MdOutlineCheckCircleOutline as VoteIcon } from 'react-icons/md';
import classes from './ClaimPOVModule.module.css';

const ClaimPOVModule = () => {
  return (
    <>
      <div className={classes.sideCardHeader}>
        <div className={clsx(classes.icon, classes.blackIcon)}>
          <VoteIcon />
        </div>
        <div className={classes.textContainer}>
          <p className={classes.title}>Get Proof of Vote</p>
        </div>
      </div>

      <hr className={classes.divider} />

      <p className={clsx(classes.sideCardBody, classes.winnersText)}>
        Voter are eligible to mint Proof of Vote.
      </p>
    </>
  );
};

export default ClaimPOVModule;
