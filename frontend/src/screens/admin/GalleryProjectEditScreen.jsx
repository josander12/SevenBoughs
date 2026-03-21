import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Form, Image } from "react-bootstrap";
import { toast } from "react-toastify";
import FormContainer from "../../components/FormContainer";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import Meta from "../../components/Meta";
import { getCalendarDateInputValue } from "../../utils/calendarDate";
import getErrorMessage from "../../utils/getErrorMessage";
import {
  useGetGalleryProjectDetailsQuery,
  useUpdateGalleryProjectMutation,
  useUploadGalleryImagesMutation,
} from "../../slices/galleryApiSlice";

const GalleryProjectEditScreen = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [featured, setFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [images, setImages] = useState([]);
  const [fileInputKey, setFileInputKey] = useState(0);

  const {
    data: project,
    isLoading,
    error,
  } = useGetGalleryProjectDetailsQuery(projectId);

  const [updateGalleryProject, { isLoading: isUpdating }] =
    useUpdateGalleryProjectMutation();
  const [uploadGalleryImages, { isLoading: isUploading }] =
    useUploadGalleryImagesMutation();

  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setDescription(project.description || "");
      setCategory(project.category || "");
      setCompletedAt(getCalendarDateInputValue(project.completedAt));
      setFeatured(Boolean(project.featured));
      setSortOrder(Number(project.sortOrder || 0));
      setImages(project.images || []);
    }
  }, [project]);

  const uploadFileHandler = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("image", file));

    try {
      const response = await uploadGalleryImages(formData).unwrap();
      if (Array.isArray(response.images)) {
        setImages((prev) => [...prev, ...response.images]);
        setFileInputKey((prev) => prev + 1);
      } else {
        toast.error("Unexpected upload response format");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload images"));
    }
  };

  const removeImage = (imagePath) => {
    setImages((prev) => prev.filter((img) => img !== imagePath));
  };

  const setMainImage = (imagePath) => {
    setImages((prev) => [
      imagePath,
      ...prev.filter((img) => img !== imagePath),
    ]);
  };

  const submitHandler = async (event) => {
    event.preventDefault();

    if (!images.length) {
      toast.error("Please keep at least one image");
      return;
    }

    try {
      await updateGalleryProject({
        projectId,
        title,
        description,
        category,
        completedAt: completedAt || null,
        featured,
        sortOrder: Number(sortOrder || 0),
        images,
      }).unwrap();

      toast.success("Gallery project updated");
      navigate("/admin/galleryprojects");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update gallery project"));
    }
  };

  return (
    <>
      <Meta title="Edit Gallery Project | Seven Boughs" />
      <Link to="/admin/galleryprojects" className="btn btn-light my-3">
        Go Back
      </Link>

      <FormContainer>
        <h1>Edit Gallery Project</h1>
        {isUpdating && <Loader />}
        {isUploading && <Loader />}

        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">
            {getErrorMessage(error, "Failed to load gallery project")}
          </Message>
        ) : (
          <Form onSubmit={submitHandler}>
            <Form.Group className="my-2" controlId="title">
              <Form.Label>Project Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="my-2" controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="my-2" controlId="category">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="my-2" controlId="completedAt">
              <Form.Label>Completed Date</Form.Label>
              <Form.Control
                type="date"
                value={completedAt}
                onChange={(e) => setCompletedAt(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="my-2" controlId="sortOrder">
              <Form.Label>Sort Order</Form.Label>
              <Form.Control
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
            </Form.Group>

            <Form.Group className="my-2" controlId="featured">
              <Form.Check
                type="switch"
                label="Feature this project"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
            </Form.Group>

            <Form.Group className="my-2" controlId="images">
              <Form.Label>Project Images</Form.Label>
              <Form.Control
                key={fileInputKey}
                type="file"
                multiple
                onChange={uploadFileHandler}
              />
            </Form.Group>

            <div className="d-flex flex-wrap gap-2 my-3">
              {images.map((image, idx) => (
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

            <Button type="submit" variant="primary" className="my-2">
              Update
            </Button>
          </Form>
        )}
      </FormContainer>
    </>
  );
};

export default GalleryProjectEditScreen;
