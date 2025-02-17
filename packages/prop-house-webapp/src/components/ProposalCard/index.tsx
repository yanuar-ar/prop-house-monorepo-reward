import classes from './ProposalCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import detailedTime from '../../utils/detailedTime';
import clsx from 'clsx';
import { AuctionStatus } from '../../utils/auctionStatus';
import { ProposalCardStatus } from '../../utils/cardStatus';
import diffTime from '../../utils/diffTime';
import EthAddress from '../EthAddress';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import PropCardVotingModule from '../PropCardVotingModule';
import { cmdPlusClicked } from '../../utils/cmdPlusClicked';
import { openInNewTab } from '../../utils/openInNewTab';
import VotesDisplay from '../VotesDisplay';
import { useAppSelector } from '../../hooks';
import { nameToSlug } from '../../utils/communitySlugs';

const ProposalCard: React.FC<{
  proposal: StoredProposalWithVotes;
  auctionStatus: AuctionStatus;
  cardStatus: ProposalCardStatus;
  winner?: boolean;
}> = props => {
  const { proposal, auctionStatus, cardStatus, winner } = props;

  let navigate = useNavigate();

  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);

  const roundIsVotingOrOver = () =>
    auctionStatus === AuctionStatus.AuctionVoting || auctionStatus === AuctionStatus.AuctionEnded;
  const roundIsActive = () =>
    auctionStatus === AuctionStatus.AuctionAcceptingProps ||
    auctionStatus === AuctionStatus.AuctionVoting;

  return (
    <>
      <div
        onClick={e => {
          if (!community || !round) return;

          if (cmdPlusClicked(e)) {
            openInNewTab(`${nameToSlug(round.title)}/${proposal.id}`);
            return;
          }
          navigate(`${proposal.id}`);
        }}
      >
        <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.thirty}
          classNames={clsx(classes.proposalCard, winner && classes.winner)}
        >
          <div className={classes.textContainter}>
            <div className={classes.titleContainer}>
              <div className={classes.authorContainer}>{proposal.title}</div>
            </div>

            <ReactMarkdown
              className={classes.truncatedTldr}
              children={proposal.tldr}
              disallowedElements={['img', '']}
              components={{
                h1: 'p',
                h2: 'p',
                h3: 'p',
              }}
            ></ReactMarkdown>
          </div>

          <hr className={classes.divider} />

          <div className={classes.timestampAndlinkContainer}>
            <div className={classes.address}>
              <EthAddress address={proposal.address} truncate />

              <span className={clsx(classes.bullet, roundIsActive() && classes.hideDate)}>
                {' • '}
              </span>
              <div
                className={clsx(classes.date, roundIsActive() && classes.hideDate)}
                title={detailedTime(proposal.createdDate)}
              >
                {diffTime(proposal.createdDate)}
              </div>
            </div>

            <div
              className={clsx(
                classes.avatarAndPropNumber,
                !roundIsVotingOrOver() && classes.hideVoteModule,
              )}
            >
              <div className={classes.voteCountCopy} title={detailedTime(proposal.createdDate)}>
                {roundIsVotingOrOver() && <VotesDisplay proposal={proposal} />}
                {cardStatus === ProposalCardStatus.Voting && (
                  <div className={classes.votingArrows}>
                    <span className={classes.plusArrow}>+</span>
                    <PropCardVotingModule proposal={proposal} cardStatus={cardStatus} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default ProposalCard;
