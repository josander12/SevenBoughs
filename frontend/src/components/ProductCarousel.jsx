import { Link } from "react-router-dom";
import { Carousel, Image, Row, Col } from "react-bootstrap";
import Message from "./Message";
import { useGetTopProductsQuery } from "../slices/productsApiSlice";
import getErrorMessage from "../utils/getErrorMessage";
import getOptimizedImageUrl from "../utils/getOptimizedImageUrl";

const ProductCarousel = () => {
  const { data: products, isLoading, error } = useGetTopProductsQuery();

  return isLoading ? (
    ""
  ) : error ? (
    <Message variant="danger">
      {getErrorMessage(error, "Failed to load featured products")}
    </Message>
  ) : (
    <Carousel pause="hover" className="bg-primary mb-4 c-image-container">
      {products.map((product) => (
        <Carousel.Item key={product._id}>
          <Row>
            {/* Image Column */}
            <Col md={4}>
              <Link to={`/product/${product._id}`}>
                <Image
                  src={getOptimizedImageUrl(
                    Array.isArray(product.image) ? product.image[0] : product.image,
                    1000,
                    84
                  )}
                  alt={product.name}
                  fluid
                  className="c-image"
                  loading="eager"
                  decoding="async"
                />
              </Link>
            </Col>

            {/* Description Column */}
            <Col md={8} className="d-flex align-items-center p-5 text">
              <div>
                <h2>
                  {product.name} (${product.price})
                </h2>
                <p>{product.description}</p>
              </div>
            </Col>
          </Row>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};
export default ProductCarousel;
