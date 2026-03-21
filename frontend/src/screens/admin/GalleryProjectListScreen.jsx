import { useState } from "react";
import { Button, Col, Form, Image, Row, Table } from "react-bootstrap";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { LinkContainer } from "react-router-bootstrap";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import Meta from "../../components/Meta";
import Paginate from "../../components/Paginate";
import getErrorMessage from "../../utils/getErrorMessage";
import {
  useCreateGalleryProjectMutation,
  useDeleteGalleryProjectMutation,
  useGetGalleryProjectsQuery,
  useUploadGalleryImagesMutation,
} from "../../slices/galleryApiSlice";

const initialState = {
  title: "",
  description: "",
  category: "",
  completedAt: "",
  featured: false,
  sortOrder: 0,
  images: [],
};

const GalleryProjectListScreen = () => {
  const { pageNumber } = useParams();
  const [formState, setFormState] = useState(initialState);
  const [fileInputKey, setFileInputKey] = useState(0);

  const {
    data: response = {},
    isLoading,
    error,
    refetch,
  } = useGetGalleryProjectsQuery({ pageNumber, pageSize: 12 });

  const projects = response.projects || [];
  const pages = response.pages || 1;
  const page = response.page || 1;

  const [createGalleryProject, { isLoading: creating }] =
    useCreateGalleryProjectMutation();
  const [deleteGalleryProject, { isLoading: deleting }] =
    useDeleteGalleryProjectMutation();
  const [uploadGalleryImages, { isLoading: uploading }] =
    useUploadGalleryImagesMutation();

  const resetForm = () => {
    setFormState(initialState);
    setFileInputKey((prev) => prev + 1);
  };

  const uploadFileHandler = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("image", file));

    try {
      const response = await uploadGalleryImages(formData).unwrap();
      if (Array.isArray(response.images)) {
        setFormState((prev) => ({
          ...prev,
          images: [...prev.images, ...response.images],
        }));
      } else {
        toast.error("Unexpected upload response format");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload images"));
    }
  };

  const removeImage = (imagePath) => {
    setFormState((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== imagePath),
    }));
  };

  const setMainImage = (imagePath) => {
    setFormState((prev) => ({
      ...prev,
      images: [imagePath, ...prev.images.filter((img) => img !== imagePath)],
    }));
  };

  const submitHandler = async (event) => {
    event.preventDefault();

    if (!formState.images.length) {
      toast.error("Please upload at least one image");
      return;
    }

    const payload = {
      title: formState.title,
      description: formState.description,
      category: formState.category,
      completedAt: formState.completedAt || null,
      featured: formState.featured,
      sortOrder: Number(formState.sortOrder || 0),
      images: formState.images,
    };

    try {
      await createGalleryProject(payload).unwrap();
      toast.success("Gallery project created");

      resetForm();
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save gallery project"));
    }
  };

  const deleteHandler = async (projectId, title) => {
    if (!window.confirm(`Delete gallery project "${title}"?`)) {
      return;
    }

    try {
      await deleteGalleryProject(projectId).unwrap();
      toast.success("Gallery project deleted");
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete gallery project"));
    }
  };

  return (
    <>
      <Meta title="Manage Gallery | Seven Boughs" />
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Gallery Projects</h1>
        </Col>
      </Row>

      {creating && <Loader />}
      {deleting && <Loader />}
      {uploading && <Loader />}

      <Row>
        <Col lg={5} className="mb-4">
          <h3>Create Project</h3>
          <Form onSubmit={submitHandler}>
            <Form.Group className="my-2" controlId="title">
              <Form.Label>Project Title</Form.Label>
              <Form.Control
                type="text"
                value={formState.title}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </Form.Group>

            <Form.Group className="my-2" controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={formState.description}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                required
              />
            </Form.Group>

            <Form.Group className="my-2" controlId="category">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                placeholder="Built-ins, Tables, Kitchens..."
                value={formState.category}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
              />
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="my-2" controlId="completedAt">
                  <Form.Label>Completed Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formState.completedAt}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        completedAt: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="my-2" controlId="sortOrder">
                  <Form.Label>Sort Order</Form.Label>
                  <Form.Control
                    type="number"
                    value={formState.sortOrder}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        sortOrder: Number(e.target.value),
                      }))
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="my-2" controlId="featured">
              <Form.Check
                type="switch"
                label="Feature this project"
                checked={formState.featured}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    featured: e.target.checked,
                  }))
                }
              />
            </Form.Group>

            <Form.Group className="my-2" controlId="imageUpload">
              <Form.Label>Project Images</Form.Label>
              <Form.Control
                key={fileInputKey}
                type="file"
                multiple
                onChange={uploadFileHandler}
              />
            </Form.Group>

            <div className="d-flex flex-wrap gap-2 my-3">
              {formState.images.map((image, idx) => (
                <div key={image} className="admin-image-tile">
                  <Image
                    src={image}
                    alt="project"
                    className="gallery-admin-preview"
                  />
                  <div className="admin-image-actions">
                    {idx === 0 ? (
                      <span className="admin-main-chip">Main</span>
                    ) : (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0"
                        onClick={() => setMainImage(image)}
                      >
                        Set Main
                      </Button>
                    )}
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 text-danger"
                      onClick={() => removeImage(image)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary">
                Create
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Clear
              </Button>
            </div>
          </Form>
        </Col>

        <Col lg={7}>
          <h3>Existing Projects</h3>
          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">
              {getErrorMessage(error, "Failed to load gallery projects")}
            </Message>
          ) : projects.length === 0 ? (
            <Message>No gallery projects yet.</Message>
          ) : (
            <Table striped hover responsive className="table-sm">
              <thead>
                <tr>
                  <th>TITLE</th>
                  <th>PHOTOS</th>
                  <th>FEATURED</th>
                  <th>ORDER</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project._id}>
                    <td>{project.title}</td>
                    <td>{project.images?.length || 0}</td>
                    <td>{project.featured ? "Yes" : "No"}</td>
                    <td>{project.sortOrder ?? 0}</td>
                    <td>
                      <LinkContainer
                        to={`/admin/galleryproject/${project._id}/edit`}
                      >
                        <Button variant="primary" className="btn-sm my-1">
                          <FaEdit />
                        </Button>
                      </LinkContainer>
                      <Button
                        variant="danger"
                        className="btn-sm mx-2"
                        onClick={() =>
                          deleteHandler(project._id, project.title)
                        }
                      >
                        <FaTrashAlt style={{ color: "white" }} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          <Paginate pages={pages} page={page} isAdminGallery={true} />
        </Col>
      </Row>
    </>
  );
};

export default GalleryProjectListScreen;
