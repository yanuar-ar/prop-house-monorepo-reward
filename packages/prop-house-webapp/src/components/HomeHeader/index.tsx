import { Col, Row, Image } from 'react-bootstrap';
import Button, { ButtonColor } from '../Button';
import classes from './HomeHeader.module.css';
import { Link } from 'react-router-dom';
import grempBulb from '../../assets/gremp-lightbulb.png';

const HomeHeader = () => {
  return (
    <Row className={classes.wrapper}>
      <Col lg={7} className={classes.leftCol}>
        <div className={classes.poweredByNouns}>
          Powered by{' '}
          <a href="https://nouns.wtf" target="_blank" rel="noreferrer">
            NounsDAO
          </a>
        </div>
        <h1>Supercharge your nounish community</h1>
        <p>
          Unleash your community's potential by running your very own Prop
          House. Anyone can submit a proposal, your community votes on who gets
          funded.
        </p>
        <div className={classes.btnsContainer}>
          <Col xs={6} md="auto">
            <Link to="/learn">
              <Button text="Learn more" bgColor={ButtonColor.Pink} />
            </Link>
          </Col>
          <Col xs={6} md="auto">
            <Link to={`/explore`}>
              <Button text="View houses" bgColor={ButtonColor.White} />
            </Link>
          </Col>
        </div>
      </Col>
      <Col lg={{ span: 4, offset: 1 }} className={classes.rightCol}>
        <Image src={grempBulb} fluid />
        <p>Artwork by @supergremplin</p>
      </Col>
    </Row>
  );
};

export default HomeHeader;
