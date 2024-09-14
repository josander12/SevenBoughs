import { Container, Row, Col } from "react-bootstrap";
import { useLocation } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <footer className={isHomePage ? "home-screen-footer" : ""}>
      <Container>
        <Row>
          <Col className="text-center py-3">
            <p>SevenBoughs &copy; {currentYear}</p>
            <p>Steve Anderson | stevea@sevenboughs.com | 541-962-5208</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};
export default Footer;
