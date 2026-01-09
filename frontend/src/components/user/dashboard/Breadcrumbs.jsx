/**
 * Component: Breadcrumbs
 *
 * Purpose:
 * - Shows navigation path (page hierarchy) to the user
 * - Improves navigation clarity inside the dashboard
 *
 * Example:
 * - Dashboard > Payments > UPI
 *
 * Key Behavior:
 * - Reads current route
 * - Displays clickable breadcrumb links
 *
 * Connected Files:
 * - Used across dashboard pages
 * - Integrated in layouts (Dashboard layout)
 *
 * Note:
 * - UI utility component
 * - Does not handle routing logic itself
 */



import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();

  // split path and remove empty strings
  const pathnames = location.pathname.split("/").filter(Boolean);

  return (
    <div
      style={{
        padding: "14px 24px",
        backgroundColor: "#f8fafc",
        borderBottom: "1px solid #e5e7eb",
        fontSize: "14px",
      }}
    >
      <Link
        to="/"
        style={{
          textDecoration: "none",
          color: "#4f46e5",
          fontWeight: "500",
        }}
      >
        Home
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return (
          <span key={to}>
            {" / "}
            {isLast ? (
              <span style={{ color: "#111827", fontWeight: "500" }}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </span>
            ) : (
              <Link
                to={to}
                style={{
                  textDecoration: "none",
                  color: "#4f46e5",
                  fontWeight: "500",
                }}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;
