import { Pagination } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

const Paginate = ({
  pages,
  page,
  isAdmin = false,
  keyword = "",
  isGallery = false,
  isAdminGallery = false,
  galleryKeyword = "",
}) => {
  return (
    pages > 1 && (
      <Pagination>
        {[...Array(pages).keys()].map((x) => (
          <LinkContainer
            key={x + 1}
            to={
              isAdminGallery
                ? `/admin/galleryprojects/${x + 1}`
                : isGallery
                  ? galleryKeyword
                    ? `/gallery/search/${encodeURIComponent(galleryKeyword)}/page/${x + 1}`
                    : `/gallery/page/${x + 1}`
                  : !isAdmin
                    ? keyword
                      ? `/search/${keyword}/page/${x + 1}`
                      : `/page/${x + 1}`
                    : `/admin/productlist/${x + 1}`
            }
          >
            <Pagination.Item active={x + 1 === page}>{x + 1}</Pagination.Item>
          </LinkContainer>
        ))}
      </Pagination>
    )
  );
};
export default Paginate;
