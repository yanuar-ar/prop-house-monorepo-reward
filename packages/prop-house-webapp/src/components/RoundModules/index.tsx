import {
  Community,
  StoredAuction,
  StoredProposalWithVotes,
} from '@nouns/prop-house-wrapper/dist/builders';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import classes from './RoundModules.module.css';
import { Col } from 'react-bootstrap';
import { useAppSelector } from '../../hooks';
import { AuctionStatus, auctionStatus } from '../../utils/auctionStatus';
import { useEthers, useContractFunction } from '@usedapp/core';
import { utils } from 'ethers';
import { Contract } from '@ethersproject/contracts';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import Button, { ButtonColor } from '../Button';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import useWeb3Modal from '../../hooks/useWeb3Modal';
import getWinningIds from '../../utils/getWinningIds';
import proofOfWinABI from '../../utils/proofOfWinABI.json';
import proofOfVoteABI from '../../utils/proofOfVoteABI.json';
import UserPropCard from '../UserPropCard';
import AcceptingPropsModule from '../AcceptingPropsModule';
import VotingModule from '../VotingModule';
import RoundOverModule from '../RoundOverModule';
import ClaimPOWModule from '../ClaimPOWModule';
import ClaimPOVModule from '../ClaimPOVModule';
import { Dispatch, SetStateAction, useEffect, useState, useRef } from 'react';
import { isSameAddress } from '../../utils/isSameAddress';
import { voteWeightForAllottedVotes } from '../../utils/voteWeightForAllottedVotes';
import ErrorModal from '../ErrorModal';
import SuccessModal from '../SuccessModal';

const RoundModules: React.FC<{
  auction: StoredAuction;
  community: Community;
  setShowVotingModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { auction, community, setShowVotingModal } = props;

  const CHAIN_ID = process.env.REACT_APP_CHAIN_ID;

  const { library: provider, chainId, account } = useEthers();
  const connect = useWeb3Modal();
  const navigate = useNavigate();

  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const submittedVotes = useAppSelector(state => state.voting.numSubmittedVotes);

  const winningIds = getWinningIds(proposals, auction);
  const [userProposals, setUserProposals] = useState<StoredProposalWithVotes[]>();

  const [winner, setWinner] = useState(false);
  const [voter, setVoter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState({
    title: '',
    message: '',
    image: '',
  });
  const [successModalMessage, setSuccessModalMessage] = useState({
    title: '',
    message: '',
    image: '',
  });

  const backendHost = useAppSelector(state => state.configuration.backendHost);
  const backendClient = useRef(new PropHouseWrapper(backendHost, provider?.getSigner()));
  // auction statuses
  const auctionNotStarted = auctionStatus(auction) === AuctionStatus.AuctionNotStarted;
  const isProposingWindow = auctionStatus(auction) === AuctionStatus.AuctionAcceptingProps;
  const isVotingWindow = auctionStatus(auction) === AuctionStatus.AuctionVoting;
  const isRoundOver = auctionStatus(auction) === AuctionStatus.AuctionEnded;

  const getVoteTotal = () =>
    proposals && proposals.reduce((total, prop) => (total = total + Number(prop.voteCount)), 0);

  // Proof of Win Contract
  const proofOfWinInterface = new utils.Interface(proofOfWinABI);
  const proofOfWinContractAddress = process.env.REACT_APP_PROOF_OF_WIN_CONTRACT;
  const proofOfWinContract = new Contract(proofOfWinContractAddress || '', proofOfWinInterface);

  // Proof of Win Contract
  const proofOfVoteInterface = new utils.Interface(proofOfVoteABI);
  const proofOfVoteContractAddress = process.env.REACT_APP_PROOF_OF_VOTE_CONTRACT;
  const proofOfVoteContract = new Contract(proofOfVoteContractAddress || '', proofOfVoteInterface);

  const { send: mint, state: mintState } = useContractFunction(proofOfWinContract as any, 'mint');

  const { send: mintPOV, state: mintPOVState } = useContractFunction(
    proofOfVoteContract as any,
    'mint',
  );

  const mintProofOfWin = async () => {
    const data = await backendClient.current.createMint(account || '', auction.id);

    setLoading(true);
    mint(auction.id, data.tokenId, account, data.signature);
  };

  const mintProofOfVote = async () => {
    const data = await backendClient.current.createMintPOV(account || '', auction.id);

    setLoading(true);
    mintPOV(auction.id, data.tokenId, account, data.signature);
  };

  useEffect(() => {
    if (mintState.status === 'Fail') {
      setLoading(false);
      setErrorModalMessage({
        title: 'Failed to submit transaction',
        message: 'Please go back and try again.',
        image: 'banana.png',
      });
      setShowErrorModal(true);
    }

    if (mintState.status === 'Exception') {
      setLoading(false);
      setErrorModalMessage({
        title: 'Transaction reverted.',
        message: mintState?.errorMessage || '',
        image: 'banana.png',
      });
      setShowErrorModal(true);
    }

    if (mintState.status === 'Success') {
      setLoading(false);
      setSuccessModalMessage({
        title: 'Mint Success.',
        message: `You've successfully mint Proof of Win. Enjoy your Golden Noggle.`,
        image: 'goldennoggles.png',
      });
      setShowSuccessModal(true);
    }
  }, [mintState]);

  useEffect(() => {
    if (mintPOVState.status === 'Fail') {
      setLoading(false);
      setErrorModalMessage({
        title: 'Failed to submit transaction',
        message: 'Please go back and try again.',
        image: 'banana.png',
      });
      setShowErrorModal(true);
    }

    if (mintPOVState.status === 'Exception') {
      setLoading(false);
      setErrorModalMessage({
        title: 'Transaction reverted.',
        message: mintPOVState?.errorMessage || '',
        image: 'banana.png',
      });
      setShowErrorModal(true);
    }

    if (mintPOVState.status === 'Success') {
      setLoading(false);
      setSuccessModalMessage({
        title: 'Mint Success.',
        message: `You've successfully mint Proof of Vote`,
        image: 'rednoggles.png',
      });
      setShowSuccessModal(true);
    }
  }, [mintPOVState]);

  useEffect(() => {
    backendClient.current = new PropHouseWrapper(backendHost, provider?.getSigner());
  }, [provider, backendHost]);

  useEffect(() => {
    if (!account || !proposals) return;

    // set user props
    if (proposals.some(p => isSameAddress(p.address, account))) {
      return setUserProposals(
        proposals
          .filter(p => isSameAddress(p.address, account))
          .sort((a: { voteCount: any }, b: { voteCount: any }) =>
            Number(a.voteCount) < Number(b.voteCount) ? 1 : -1,
          ),
      );
    }
  }, [account, proposals]);

  useEffect(() => {
    //check reward eligible
    if (account) {
      const checkWinnerVoter = async () => {
        const { winner } = await backendClient.current.checkWinner(account, auction.id);
        const { voter } = await backendClient.current.checkVoter(account, auction.id);

        setVoter(voter);
        setWinner(winner);
      };
      checkWinnerVoter();
    }
  }, [account, auction.id]);

  return (
    <>
      {showErrorModal && (
        <ErrorModal
          showErrorModal={showErrorModal}
          setShowErrorModal={setShowErrorModal}
          title={errorModalMessage.title}
          message={errorModalMessage.message}
          image={errorModalMessage.image}
        />
      )}
      {showSuccessModal && (
        <SuccessModal
          showSuccessModal={showSuccessModal}
          setShowSuccessModal={setShowSuccessModal}
          numPropsVotedFor={0}
          voteModal={false}
          title={successModalMessage.title}
          message={successModalMessage.message}
          image={successModalMessage.image}
        />
      )}
      <Col xl={4} className={clsx(classes.sideCards, classes.carousel, classes.breakOut)}>
        {!auctionNotStarted && account && userProposals && userProposals.length > 0 && (
          <UserPropCard
            userProps={userProposals}
            proposals={proposals}
            numOfWinners={auction.numWinners}
            status={auctionStatus(auction)}
            winningIds={winningIds && winningIds}
          />
        )}

        <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.thirty}
          classNames={classes.sidebarContainerCard}
        >
          {/* CONTENT */}
          <div className={classes.content}>
            {/* ACCEPTING PROPS */}
            {isProposingWindow && (
              <AcceptingPropsModule auction={auction} communityName={community.name} />
            )}

            {/* VOTING WINDOW */}
            {isVotingWindow && (
              <VotingModule communityName={community.name} totalVotes={getVoteTotal()} />
            )}

            {/* ROUND ENDED */}
            {isRoundOver && (
              <RoundOverModule
                numOfProposals={proposals && proposals.length}
                totalVotes={getVoteTotal()}
              />
            )}
          </div>

          {/* BUTTONS */}
          <div className={classes.btnContainer}>
            {/* ACCEPTING PROPS */}
            {isProposingWindow &&
              (account ? (
                <Button
                  text={'Create your proposal'}
                  bgColor={ButtonColor.Green}
                  onClick={() => navigate('/create', { state: { auction, community } })}
                />
              ) : (
                <Button text={'Connect to submit'} bgColor={ButtonColor.Pink} onClick={connect} />
              ))}

            {/* VOTING WINDOW, NOT CONNECTED */}
            {isVotingWindow && !account && (
              <Button text={'Connect to vote'} bgColor={ButtonColor.Pink} onClick={connect} />
            )}

            {/* VOTING PERIOD, CONNECTED, HAS VOTES */}
            {isVotingWindow && account && votingPower ? (
              <Button
                text={'Submit votes'}
                bgColor={ButtonColor.Purple}
                onClick={() => setShowVotingModal(true)}
                disabled={
                  voteWeightForAllottedVotes(voteAllotments) === 0 || submittedVotes === votingPower
                }
              />
            ) : (
              //  VOTING PERIOD, CONNECTED, HAS NO VOTES
              <></>
            )}
          </div>
        </Card>
        {/* CLAIM REWARD */}
        {isRoundOver && (
          <Card
            bgColor={CardBgColor.White}
            borderRadius={CardBorderRadius.thirty}
            classNames={classes.sidebarContainerCard}
          >
            <div className={classes.content}>
              <ClaimPOWModule />
              {isRoundOver && !account && (
                <Button text={'Connect to claim'} bgColor={ButtonColor.Pink} onClick={connect} />
              )}

              {/* IF WINNER */}
              {isRoundOver && account && chainId === Number(CHAIN_ID) && winner ? (
                <Button
                  text={loading ? 'Loading...' : 'Mint Proof of Win'}
                  bgColor={ButtonColor.Purple}
                  onClick={() => mintProofOfWin()}
                  disabled={loading}
                />
              ) : (
                <></>
              )}

              {/* IF NOT WINNER */}
              {isRoundOver && account && chainId === Number(CHAIN_ID) && !winner ? (
                <Button text={'Not Winner'} bgColor={ButtonColor.Purple} disabled={true} />
              ) : (
                <></>
              )}
              {/* CHECK NETWORK */}
              {isRoundOver && account && chainId !== Number(CHAIN_ID) ? (
                <Button text={'Wrong Network !'} bgColor={ButtonColor.Pink} disabled={true} />
              ) : (
                <></>
              )}
            </div>
          </Card>
        )}
        {/* CLAIM Proof of Vote */}
        {isRoundOver && (
          <Card
            bgColor={CardBgColor.White}
            borderRadius={CardBorderRadius.thirty}
            classNames={classes.sidebarContainerCard}
          >
            <div className={classes.content}>
              <ClaimPOVModule />
              {isRoundOver && !account && (
                <Button text={'Connect to claim'} bgColor={ButtonColor.Pink} onClick={connect} />
              )}

              {/* IF VOTER */}
              {isRoundOver && account && chainId === Number(CHAIN_ID) && voter ? (
                <Button
                  text={loading ? 'Loading...' : 'Mint Proof of Vote'}
                  bgColor={ButtonColor.Purple}
                  onClick={() => mintProofOfVote()}
                  disabled={loading}
                />
              ) : (
                <></>
              )}

              {/* IF NOT VOTER */}
              {isRoundOver && account && chainId === Number(CHAIN_ID) && !voter ? (
                <Button text={'Not Voter'} bgColor={ButtonColor.Purple} disabled={true} />
              ) : (
                <></>
              )}
              {/* CHECK NETWORK */}
              {isRoundOver && account && chainId !== Number(CHAIN_ID) ? (
                <Button text={'Wrong Network !'} bgColor={ButtonColor.Pink} disabled={true} />
              ) : (
                <></>
              )}
            </div>
          </Card>
        )}
      </Col>
    </>
  );
};
export default RoundModules;
