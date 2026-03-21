import { useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import Meta from "../components/Meta";

const HomeScreen = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-screen-text">
      <Meta title="Seven Boughs" />
      <Row>
        <Col md={2} />
        <Col md={8}>
          <h1 style={{ fontWeight: "100" }}>
            Welcome to Seven Boughs Woodworking.
          </h1>
          <p style={{ paddingTop: "20px" }}>
            We focus our efforts on custom, handcrafted projects to meet your
            specific requirements. Our work includes furniture, cabinets,
            built-ins, architectural features, and more. Please reach out to us
            via phone, email, our webpage, or facebook (links below) to discuss
            your next project!
          </p>
          <p>
            Each custom piece will have a variable delivery time, based on
            current workload, availability of materials, and complexity of the
            project. All our products include a lifetime warranty under normal
            use. If something we made ever fails because of a defect, we'll fix
            it. Regular care and normal wear are excluded, but we build our
            pieces to be easy to maintain.
          </p>
          <p>
            We also have a number of items listed for sale in our shop. These
            items are also handcrafted and are fully customizable with the final
            price varying based on the requested customizations.
          </p>
          <p>We're excited to build something for you that lasts!</p>
          <p>
            <em>Family ~ Service ~ Integrity</em>
          </p>
          <p>Licensed, bonded and insured (CCB#256039)</p>
        </Col>
      </Row>

      <Row style={{ paddingTop: "20px" }}>
        <Col md={2} />
        <Col md={2}>
          <Link className="btn btn-dark home-screen-links" to="/about">
            Our Story
          </Link>
        </Col>
        <Col md={2}>
          <Link className="btn btn-dark home-screen-links" to="/gallery">
            Gallery
          </Link>
        </Col>
        <Col md={2}>
          <Link className="btn btn-dark home-screen-links" to="/shop">
            Shop
          </Link>
        </Col>
        <Col md={2}>
          <Link className="btn btn-dark home-screen-links" to="/contact">
            Contact Us
          </Link>
        </Col>
        <Col md={2} />
      </Row>
    </div>
  );
};
export default HomeScreen;
