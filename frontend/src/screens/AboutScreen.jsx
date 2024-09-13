import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Row,
  Col,
  Image,
  ListGroup,
  Card,
  Button,
  Form,
} from "react-bootstrap";
import profilePic from "../assets/profile.jpg";
import familyPic from "../assets/family.jpg";
import Meta from "../components/Meta";

const AboutScreen = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  });
  return (
    <>
    <Meta title="About Us" />
      <h1>About Us</h1>
      <hr />
      <Row>
        <Col md={10}>
          <p style={{paddingTop:"10px"}}>
            Steven Anderson, founder of Seven Boughs Woodworking, is a husband,
            father, professional engineer, and woodworker. The origin of the
            name ‘Seven Boughs’ refers to his family (Steve has seven children
            and seven siblings) and the fact that the number seven is often used
            to symbolize completion and balance, a mark of the work he strives
            for.
          </p>
          <p>
            At Seven Boughs Woodworking, the work we do is built on three main
            values that shape our purpose:
          </p>
          <ol>
            <li>Family - We hope that the products you find here can benefit your family.</li>
            <li>Integrity - Every piece we create is built as if it were for our own family, and we expect it to be able to last a lifetime or more.</li>
            <li>Service - From standard to custom orders, we utilize a variety of wood species and finishes to meet your needs. We aim to please!</li>
          </ol>
          <p>Located in lovely La Grande, Oregon, we look forward to serving you wherever you are.</p>
          <p style={{paddingBottom:"10px"}}>Welcome to Seven Boughs Woodworking.</p>

        </Col>
        <Col md={2}>
          <Image src={profilePic} className="about" fluid rounded/>
        </Col>
      </Row>
      <Row>
        <Col md={3}></Col>
        <Col md={6}>
        <Image src={familyPic} className="about" fluid rounded />
        </Col>
        <Col md={3}></Col>
      </Row>
    </>
  );
};
export default AboutScreen;
