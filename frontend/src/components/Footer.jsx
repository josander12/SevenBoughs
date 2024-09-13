import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
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
