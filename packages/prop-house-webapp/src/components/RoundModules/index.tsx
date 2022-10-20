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
import propHouseABI from '../../utils/prophouseABI.json';
import UserPropCard from '../UserPropCard';
import AcceptingPropsModule from '../AcceptingPropsModule';
import VotingModule from '../VotingModule';
import RoundOverModule from '../RoundOverModule';
import ClaimRewardModule from '../ClaimRewardModule';
import { Dispatch, SetStateAction, useEffect, useState, useRef } from 'react';
import { isSameAddress } from '../../utils/isSameAddress';
import { voteWeightForAllottedVotes } from '../../utils/voteWeightForAllottedVotes';

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
  const [loading, setLoading] = useState(false);

  const backendHost = useAppSelector(state => state.configuration.backendHost);
  const backendClient = useRef(new PropHouseWrapper(backendHost, provider?.getSigner()));
  // auction statuses
  const auctionNotStarted = auctionStatus(auction) === AuctionStatus.AuctionNotStarted;
  const isProposingWindow = auctionStatus(auction) === AuctionStatus.AuctionAcceptingProps;
  const isVotingWindow = auctionStatus(auction) === AuctionStatus.AuctionVoting;
  const isRoundOver = auctionStatus(auction) === AuctionStatus.AuctionEnded;

  const getVoteTotal = () =>
    proposals && proposals.reduce((total, prop) => (total = total + Number(prop.voteCount)), 0);

  const propHouseInterface = new utils.Interface(propHouseABI);
  const propHouseContractAddress = '0xf5ddc3Ab08B4f9e6907affba84C3968ed3E11A78';
  const propHouseContract = new Contract(propHouseContractAddress, propHouseInterface);

  // window.alert(JSON.stringify(propHouseContract));

  const { send: mint, state: mintState } = useContractFunction(propHouseContract as any, 'mint');

  const mintReward = async () => {
    const data = await backendClient.current.createMint(account || '', auction.id);

    setLoading(true);
    mint(auction.id, data.tokenId, account, data.signature);
    // window.alert(data.signature);
  };

  useEffect(() => {
    if (mintState.status === 'Mining') {
      window.alert('Transaction submitted');
    }

    if (mintState.status === 'Fail') {
      setLoading(false);
      window.alert('Transaction Failed. Please try again.');
    }

    if (mintState.status === 'Exception') {
      setLoading(false);
      window.alert(mintState?.errorMessage);
    }

    if (mintState.status === 'Success') {
      setLoading(false);
      window.alert('Mint success');
    }
  }, [mintState]);

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
      const checkWinner = async () => {
        const data = await backendClient.current.checkWinner(account, auction.id);

        setWinner(data.winner);
      };
      checkWinner();
    }
  }, [account, auction.id]);

  return (
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
            <ClaimRewardModule />
            {isRoundOver && !account && (
              <Button text={'Connect to claim'} bgColor={ButtonColor.Pink} onClick={connect} />
            )}

            {/* IF WINNER */}
            {isRoundOver && account && chainId === Number(CHAIN_ID) && winner ? (
              <Button
                text={loading ? 'Loading...' : 'Mint Reward'}
                bgColor={ButtonColor.Purple}
                onClick={() => mintReward()}
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
    </Col>
  );
};
export default RoundModules;
