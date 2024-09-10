import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSendContactEmailMutation } from "../slices/contactApiSlice";
import { Row, Col, Container, Button, Form } from "react-bootstrap";
import Meta from "../components/Meta";

const ContactScreen = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  });

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [sendContactEmail, { isLoading, error, isSuccess }] =
    useSendContactEmailMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await sendContactEmail({ name, email, message }).unwrap();
      toast.success("Email sent successfully");
      navigate("/");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Meta title="Contact Us" />
      <Container>
        <Row className="justify-content-md-center">
          <Col xs={12} md={6}>
            <h1>Contact Us</h1>
            <p>
              Need a custom order? Have a project idea you need help with? We'd
              love to help!
            </p>
            <Form onSubmit={submitHandler}>
              <Form.Group controlId="name" className="mt-4">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="email" className="my-2">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="message" className="my-2">
                <Form.Label>Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  placeholder="Enter your message"
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="my-2">
                Submit
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
};
export default ContactScreen;
