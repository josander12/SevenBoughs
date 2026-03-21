import { Card, Col, Row } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Meta from "../components/Meta";
import Paginate from "../components/Paginate";
import { formatCalendarDate } from "../utils/calendarDate";
import getErrorMessage from "../utils/getErrorMessage";
import getOptimizedImageUrl from "../utils/getOptimizedImageUrl";
import { useGetGalleryProjectsQuery } from "../slices/galleryApiSlice";

const GalleryScreen = () => {
  const { pageNumber = 1 } = useParams();
  const { data: response = {}, isLoading, error } = useGetGalleryProjectsQuery({
    pageNumber: Number(pageNumber),
  });

  const projects = response.projects || [];
  const page = response.page || 1;
  const pages = response.pages || 1;

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
        <>
          <Row>
            {projects.map((project) => (
              <Col md={6} key={project._id}>
                <Card className="gallery-project-card gallery-project-card-clickable">
                  <Link to={`/gallery/${project._id}`}>
                    <div className="gallery-carousel-wrap">
                      <img
                        className="gallery-card-image"
                        src={getOptimizedImageUrl(project.images?.[0], 900, 82)}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
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
                          Completed {formatCalendarDate(project.completedAt)}
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
          <Paginate pages={pages} page={page} isGallery={true} />
        </>
      )}
    </>
  );
};

export default GalleryScreen;
