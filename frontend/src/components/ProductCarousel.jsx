import { Link } from "react-router-dom";
import { Carousel, Image, Row, Col } from "react-bootstrap";
import Message from "./Message";
import { useGetTopProductsQuery } from "../slices/productsApiSlice";

const ProductCarousel = () => {
  const { data: products, isLoading, error } = useGetTopProductsQuery();

  return isLoading ? (
    ""
  ) : error ? (
    <Message variant="danger">{error}</Message>
  ) : (
    <Carousel pause="hover" className="bg-primary mb-4 c-image-container">
      {products.map((product) => (
        <Carousel.Item key={product._id}>
          <Row>
            {/* Image Column */}
            <Col md={4}>
              <Link to={`/product/${product._id}`}>
                <Image
                  src={product.image}
                  alt={product.name}
                  fluid
                  className="c-image"
                />
              </Link>
            </Col>

            {/* Description Column */}
            <Col md={8} className="d-flex align-items-center p-5 text">
              <div>
                <h2>{product.name} (${product.price})</h2>
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
