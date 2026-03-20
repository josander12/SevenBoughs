import { Card, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Meta from "../components/Meta";
import getErrorMessage from "../utils/getErrorMessage";
import { useGetGalleryProjectsQuery } from "../slices/galleryApiSlice";

const formatDate = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString();
};

const GalleryScreen = () => {
  const { data: projects = [], isLoading, error } = useGetGalleryProjectsQuery();

  return (
    <>
      <Meta
        title="Project Gallery | Seven Boughs"
        description="Browse completed custom woodworking projects by Seven Boughs"
      />

      <section className="gallery-header">
        <h1>Project Gallery</h1>
        <p>
          A look at completed projects. Each project includes multiple photos so
          you can see detail, finish, and the final space.
        </p>
      </section>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {getErrorMessage(error, "Failed to load gallery projects")}
        </Message>
      ) : projects.length === 0 ? (
        <Message>No projects have been added yet.</Message>
      ) : (
        <Row>
          {projects.map((project) => (
            <Col md={6} key={project._id}>
              <Card className="gallery-project-card gallery-project-card-clickable">
                <Link to={`/gallery/${project._id}`}>
                  <div className="gallery-carousel-wrap">
                    <img
                      className="gallery-card-image"
                      src={project.images?.[0]}
                      alt={project.title}
                      loading="lazy"
                    />
                  </div>
                </Link>
                <Card.Body>
                  <div className="gallery-meta">
                    {project.category && (
                      <span className="gallery-chip">{project.category}</span>
                    )}
                    {project.featured && (
                      <span className="gallery-chip gallery-featured">
                        Featured
                      </span>
                    )}
                    {project.completedAt && (
                      <span className="text-muted">
                        Completed {formatDate(project.completedAt)}
                      </span>
                    )}
                  </div>
                  <Card.Title as="h3">
                    <Link
                      to={`/gallery/${project._id}`}
                      className="gallery-project-link"
                    >
                      {project.title}
                    </Link>
                  </Card.Title>
                  <Link
                    to={`/gallery/${project._id}`}
                    className="btn btn-outline-dark btn-sm"
                  >
                    View Project
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default GalleryScreen;
