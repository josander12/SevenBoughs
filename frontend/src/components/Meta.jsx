import { Helmet } from "react-helmet-async";

const Meta = ({
  title = "Seven Boughs",
  description = "Quality custom woodworking",
  keywords = "woodworking, custom woodworking, carpenter",
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
    </Helmet>
  );
};

export default Meta;
