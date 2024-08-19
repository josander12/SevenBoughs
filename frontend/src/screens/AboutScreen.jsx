import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Image, ListGroup, Card, Button, Form } from "react-bootstrap";
import Meta from "../components/Meta";

const AboutScreen = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  });
  return <>
  <Meta title="Our Story" />
  </>
}
export default AboutScreen