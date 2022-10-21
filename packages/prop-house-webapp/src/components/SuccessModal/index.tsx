import React, { Dispatch, SetStateAction } from 'react';
import classes from './SuccessModal.module.css';
import clsx from 'clsx';
import Modal from 'react-modal';
import Button, { ButtonColor } from '../Button';

const SuccessModal: React.FC<{
  showSuccessModal: boolean;
  numPropsVotedFor: number;
  setShowSuccessModal: Dispatch<SetStateAction<boolean>>;
  voteModal: boolean;
  title?: string;
  message?: string;
  image?: string;
}> = props => {
  const {
    showSuccessModal,
    setShowSuccessModal,
    numPropsVotedFor,
    voteModal,
    title,
    message,
    image,
  } = props;

  return (
    <Modal
      isOpen={showSuccessModal}
      onRequestClose={() => setShowSuccessModal(false)}
      className={clsx(classes.modal)}
    >
      <div className={classes.container}>
        <div className={classes.imgContainer}>
          <img src={voteModal ? '/rednoggles.png' : `/${image}`} alt="noggles" />
        </div>

        <div className={classes.titleContainer}>
          {voteModal ? (
            <>
              <p className={classes.modalTitle}>very nounish</p>
              <p className={classes.modalSubtitle}>
                You've successfully voted for {numPropsVotedFor}{' '}
                {numPropsVotedFor === 1 ? 'prop' : 'props'}!
              </p>
            </>
          ) : (
            <>
              <p className={classes.modalTitle}>{title}</p>
              <p className={classes.modalSubtitle}>{message}</p>
            </>
          )}
        </div>
      </div>

      <hr className={classes.divider} />

      <div className={classes.buttonContainer}>
        <Button
          text="Close"
          bgColor={ButtonColor.White}
          onClick={() => {
            setShowSuccessModal(false);
          }}
        />
      </div>
    </Modal>
  );
};

export default SuccessModal;
