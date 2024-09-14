import { useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import Meta from "../components/Meta";

const HomeScreen = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  });

  return (
    <div className="home-screen-text">
      <Meta title="Seven Boughs" />
      <Row>
        <Col md={2} />
        <Col md={8}>
          <h1 style={{fontWeight:"100"}}>Welcome to Seven Boughs Woodworking.</h1>
          <p style={{ paddingTop: "20px" }}>
            We focus our efforts on custom handcrafted projects to meet your
            specific requirements. Please reach out to us via phone or email to
            discuss your next project!
          </p>
          <p>
            We also have a number of standard items listed for sale in our shop.
            These items are also handcrafted and are fully customizable with the
            final price varying based on the requested customizations.
          </p>
          <p>
            If you'd like a customized piece, please reach out in the "contact
            us" portion of the webpage or by phone. Each custom piece will have
            a variable delivery time, based on current workload, availability of
            materials, and complexity of the project. Also, unless noted
            otherwise in the product description, shipping has been included in
            the displayed costs and local deliveries are free.
          </p>
        </Col>
      </Row>

      <Row style={{ paddingTop: "20px" }}>
        <Col md={3} />
        <Col md={2}>
          <Link className="btn btn-dark home-screen-links" to="/about">
            Our Story
          </Link>
        </Col>
        <Col md={2}>
          <Link className="btn btn-dark home-screen-links" to="/contact">
            Contact Us
          </Link>
        </Col>
        <Col md={2}>
          <Link className="btn btn-dark home-screen-links" to="/shop">
            Shop
          </Link>
        </Col>
        <Col md={3} />
      </Row>
    </div>
  );
};
export default HomeScreen;
