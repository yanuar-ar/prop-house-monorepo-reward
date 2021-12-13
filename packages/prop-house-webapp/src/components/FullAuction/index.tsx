import classes from './FullAuction.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import AuctionHeader from '../AuctionHeader';
import ProposalCards from '../ProposalCards';
import AllProposalsCTA from '../AllProposalsCTA';
import { Row, Col } from 'react-bootstrap';
import { StatusPillState } from '../StatusPill';
import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';

export enum AuctionStatus {
  NotStarted,
  AcceptingProposals,
  Voting,
  Ended,
}

const FullAuction: React.FC<{
  status: AuctionStatus;
  auction: StoredAuction;
}> = (props) => {
  const { status, auction } = props;
  const showAllProposals = auction.proposals.length > 6

  const statusPillState = () => {
    switch (status) {
      case AuctionStatus.NotStarted:
        return StatusPillState.AuctionNotStarted;
      case AuctionStatus.AcceptingProposals:
        return StatusPillState.AuctionAcceptingProps;
      case AuctionStatus.Voting:
        return StatusPillState.AuctionVoting;
      case AuctionStatus.Ended:
        return StatusPillState.AuctionEnded;
    }
  };

  return (
    <Card
      bgColor={CardBgColor.LightPurple}
      borderRadius={CardBorderRadius.thirty}
    >
      <AuctionHeader
        auction={auction}
        displayCreateButton={true}
        status={statusPillState()}
      />
      <Row>
        <Col xs={4} md={2}>
          <div className={classes.proposalTitle}>Proposals</div>
        </Col>
        <Col xs={8} md={10}>
          <div className={classes.divider} />
        </Col>
      </Row>
      <ProposalCards proposals={auction.proposals} />
      {showAllProposals && <AllProposalsCTA />}
    </Card>
  );
};

export default FullAuction;
