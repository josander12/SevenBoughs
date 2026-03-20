import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Image } from "react-bootstrap";
import { toast } from "react-toastify";
import FormContainer from "../../components/FormContainer";
import Loader from "../../components/Loader";
import Meta from "../../components/Meta";
import getErrorMessage from "../../utils/getErrorMessage";
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
} from "../../slices/productsApiSlice";

const ProductCreateScreen = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState([]);
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState(0);
  const [sortOrder, setSortOrder] = useState(0);
  const [featured, setFeatured] = useState(false);
  const [description, setDescription] = useState("");

  const [createProduct, { isLoading: loadingCreate }] =
    useCreateProductMutation();
  const [uploadProductImage, { isLoading: loadingUpload }] =
    useUploadProductImageMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!image.length) {
      toast.error("Please upload at least one image");
      return;
    }

    const payload = {
      name,
      price: Number(price),
      image,
      brand,
      category,
      countInStock: Number(countInStock),
      sortOrder: Number(sortOrder),
      featured,
      description,
    };

    try {
      await createProduct(payload).unwrap();
      toast.success("Product created");
      navigate("/admin/productlist");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create product"));
    }
  };

  const uploadFileHandler = async (e) => {
    const files = Array.from(e.target.files || []);
    const formData = new FormData();

    files.forEach((file) => formData.append("image", file));

    try {
      const res = await uploadProductImage(formData).unwrap();
      if (Array.isArray(res.images)) {
        setImage((prev) => [...prev, ...res.images]);
      } else {
        toast.error("Unexpected response format");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload image(s)"));
    }
  };

  const setMainImage = (imagePath) => {
    setImage((prev) => [imagePath, ...prev.filter((img) => img !== imagePath)]);
  };

  const removeImage = (imagePath) => {
    setImage((prev) => prev.filter((img) => img !== imagePath));
  };

  return (
    <>
      <Meta title="Create Product | Seven Boughs" />
      <Link to="/admin/productlist" className="btn btn-light my-3">
        Go Back
      </Link>

      <FormContainer>
        <h1>Create Product</h1>
        {loadingCreate && <Loader />}

        <Form onSubmit={submitHandler}>
          <Form.Group controlId="name" className="my-2">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="price" className="my-2">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
              required
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="image" className="my-2">
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="text"
              value={image.join(", ")}
              readOnly
              placeholder="No images uploaded yet"
            ></Form.Control>
            <Form.Control
              type="file"
              label="Choose files"
              multiple
              onChange={uploadFileHandler}
              required
            ></Form.Control>
          </Form.Group>
          <div className="d-flex flex-wrap gap-2 my-3">
            {image.map((imgPath, idx) => (
              <div key={imgPath} className="admin-image-tile">
                <Image
                  src={imgPath}
                  alt="product"
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
                      onClick={() => setMainImage(imgPath)}
                    >
                      Set Main
                    </Button>
                  )}
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-danger"
                    onClick={() => removeImage(imgPath)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {loadingUpload && <Loader />}

          <Form.Group controlId="brand" className="my-2">
            <Form.Label>Brand</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="countInStock" className="my-2">
            <Form.Label>Count In Stock</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter count in stock"
              value={countInStock}
              onChange={(e) => setCountInStock(e.target.value)}
              min="0"
              required
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="sortOrder" className="my-2">
            <Form.Label>Sort Order</Form.Label>
            <Form.Control
              type="number"
              placeholder="Lower numbers appear first"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="featured" className="my-2">
            <Form.Check
              type="checkbox"
              label="Featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
          </Form.Group>

          <Form.Group controlId="category" className="my-2">
            <Form.Label>Category</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="description" className="my-2">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></Form.Control>
          </Form.Group>

          <Button type="submit" variant="primary" className="my-2">
            Save Product
          </Button>
        </Form>
      </FormContainer>
    </>
  );
};

export default ProductCreateScreen;
