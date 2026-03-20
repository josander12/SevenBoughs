import { Link, useParams } from "react-router-dom";
import { Card, Carousel, Col, Row } from "react-bootstrap";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Meta from "../components/Meta";
import getErrorMessage from "../utils/getErrorMessage";
import { useGetGalleryProjectDetailsQuery } from "../slices/galleryApiSlice";

const formatDate = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString();
};

const GalleryProjectScreen = () => {
  const { id: projectId } = useParams();
  const {
    data: project,
    isLoading,
    error,
  } = useGetGalleryProjectDetailsQuery(projectId);

  return (
    <>
      <Link className="btn btn-light my-3" to="/gallery">
        Back to Gallery
      </Link>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {getErrorMessage(error, "Failed to load gallery project")}
        </Message>
      ) : (
        <>
          <Meta
            title={`${project.title} | Seven Boughs`}
            description={project.description}
          />

          <section className="gallery-detail-hero">
            <h1>{project.title}</h1>
            <div className="gallery-meta">
              {project.category && (
                <span className="gallery-chip">{project.category}</span>
              )}
              {project.featured && (
                <span className="gallery-chip gallery-featured">Featured</span>
              )}
              {project.completedAt && (
                <span className="text-muted">
                  Completed {formatDate(project.completedAt)}
                </span>
              )}
            </div>
          </section>

          <Row>
            <Col lg={8}>
              <Card className="gallery-project-card">
                <div className="gallery-carousel-wrap">
                  <Carousel className="gallery-carousel" interval={4500}>
                    {(project.images || []).map((image, idx) => (
                      <Carousel.Item key={`${project._id}-${idx}`}>
                        <img
                          src={image}
                          alt={`${project.title} ${idx + 1}`}
                          loading="lazy"
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                </div>
              </Card>
            </Col>
            <Col lg={4}>
              <Card className="gallery-project-card">
                <Card.Body>
                  <Card.Title as="h3">Project Details</Card.Title>
                  <Card.Text className="gallery-detail-description">
                    {project.description}
                  </Card.Text>
                  <p className="mb-0">
                    <strong>Photos:</strong> {project.images?.length || 0}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default GalleryProjectScreen;
