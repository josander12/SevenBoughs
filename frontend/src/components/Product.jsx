import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import Rating from "./Rating";
import getOptimizedImageUrl from "../utils/getOptimizedImageUrl";

const Product = ({ product }) => {
  return (
    <Card className="my-3 p-3 rounded">
      <Link to={`/product/${product._id}`}>
        <div className="image-container" style={{ position: "relative" }}>
          {product.featured && (
            <span
              className="gallery-chip gallery-featured"
              style={{
                position: "absolute",
                top: "8px",
                left: "8px",
                zIndex: 1,
              }}
            >
              Featured
            </span>
          )}
          <Card.Img
            src={getOptimizedImageUrl(product.image[0], 700, 82)}
            variant="top"
            className="image"
            loading="lazy"
            decoding="async"
          />
        </div>
      </Link>

      <Card.Body>
        <Link to={`/product/${product._id}`}>
          <Card.Title as="div" className="product-title">
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>

        {product.numReviews > 0 && (
          <Card.Text as="div">
            <Rating
              value={product.rating}
              text={`${product.numReviews} reviews`}
            ></Rating>
          </Card.Text>
        )}

        <Card.Text as="h3">${product.price}</Card.Text>
      </Card.Body>
    </Card>
  );
};
export default Product;
