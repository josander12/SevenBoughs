import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Form, Button, Image } from "react-bootstrap";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import FormContainer from "../../components/FormContainer";
import { toast } from "react-toastify";
import getOptimizedImageUrl from "../../utils/getOptimizedImageUrl";
import {
  useUpdateProductMutation,
  useGetProductDetailsQuery,
  useUploadProductImageMutation,
} from "../../slices/productsApiSlice";

const ProductEditScreen = () => {
  const { id: productId } = useParams();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState([]); // Change to array
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState(0);
  const [sortOrder, setSortOrder] = useState(0);
  const [featured, setFeatured] = useState(false);
  const [description, setDescription] = useState("");

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const [updateProduct, { isLoading: loadingUpdate }] =
    useUpdateProductMutation();

  const [uploadProductImage, { isLoading: loadingUpload }] =
    useUploadProductImageMutation();

  const navigate = useNavigate();

  useEffect(() => {
    if (product) {
      setName(product.name === "Sample Name" ? "" : product.name);
      setPrice(product.price);
      setImage(
        Array.isArray(product.image) &&
          product.image.length === 1 &&
          product.image[0] === "/images/sample.jpg"
          ? []
          : product.image || [],
      );
      setBrand(product.brand === "Sample brand" ? "" : product.brand);
      setCategory(
        product.category === "Sample category" ? "" : product.category,
      );
      setCountInStock(product.countInStock);
      setSortOrder(product.sortOrder || 0);
      setFeatured(product.featured || false);
      setDescription(
        product.description === "Sample description" ? "" : product.description,
      );
    }
  }, [product]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!image.length) {
      toast.error("Please upload at least one image");
      return;
    }

    const updatedProduct = {
      productId,
      name,
      price,
      image, // Array of images
      brand,
      category,
      countInStock,
      featured,
      sortOrder,
      description,
    };

    const result = await updateProduct(updatedProduct);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Product updated");
      refetch();
      navigate("/admin/productlist");
    }
  };

  const uploadFileHandler = async (e) => {
    const files = Array.from(e.target.files); // Convert FileList to an array
    const formData = new FormData();

    // Append each file to the FormData
    files.forEach((file) => formData.append("image", file));

    try {
      const res = await uploadProductImage(formData).unwrap();

      if (Array.isArray(res.images)) {
        setImage((prev) => [...prev, ...res.images]);
      } else {
        toast.error("Unexpected response format");
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error);
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
      <Link to="/admin/productlist" className="btn btn-light my-3">
        Go Back
      </Link>
      <FormContainer>
        <h1>Edit Product</h1>
        {loadingUpdate && <Loader />}

        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error.message.data}</Message>
        ) : (
          <Form onSubmit={submitHandler}>
            <Form.Group controlId="name" className="my-2">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Sample Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="price" className="my-2">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="image" className="my-2">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="text"
                placeholder="Sample image path"
                value={image.join(", ")} // Display the image URLs as a comma-separated string
                readOnly
              ></Form.Control>
              <Form.Control
                type="file"
                label="Choose files"
                multiple // Allow multiple file uploads
                onChange={uploadFileHandler}
              ></Form.Control>
            </Form.Group>
            <div className="d-flex flex-wrap gap-2 my-3">
              {image.map((imgPath, idx) => (
                <div key={imgPath} className="admin-image-tile">
                  <Image
                    src={getOptimizedImageUrl(imgPath, 160, 76)}
                    alt="product"
                    className="gallery-admin-preview"
                    loading="lazy"
                    decoding="async"
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
                placeholder="Sample brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="countInStock" className="my-2">
              <Form.Label>Count In Stock</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter countInStock"
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
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
                type="switch"
                label="Feature this product"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
            </Form.Group>

            <Form.Group controlId="category" className="my-2">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                placeholder="Sample category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="description" className="my-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Sample description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Button type="submit" variant="primary" className="my-2">
              Update
            </Button>
          </Form>
        )}
      </FormContainer>
    </>
  );
};
export default ProductEditScreen;
