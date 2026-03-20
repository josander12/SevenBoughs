import { Container, Row, Col } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { FaFacebook } from "react-icons/fa";
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
            <a
              href="https://www.facebook.com/profile.php?id=61565746715356"
              target="_blank"
              rel="noreferrer"
              className="footer-facebook-link"
              aria-label="Seven Boughs on Facebook"
            >
              <FaFacebook size={24} />
            </a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};
export default Footer;
