import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const Breadcrumbs = ({ prevLocation, title, gender }) => {
  const location = useLocation();
  const [locationPath, setLocationPath] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    const path = location.pathname.split("/")[1];
    setLocationPath(path);

    // Create breadcrumbs array
    const crumbs = [];

    // Add home
    crumbs.push({ name: "Trang chủ", path: "/" });

    // Add gender if available
    if (gender) {
      let genderPath = "";
      switch (gender) {
        case "male":
          genderPath = "/male";
          break;
        case "female":
          genderPath = "/female";
          break;
        case "kids":
          genderPath = "/kids";
          break;
        default:
          genderPath = "/";
      }
      crumbs.push({ name: getGenderText(gender), path: genderPath });
    }

    // Add current page if not gender
    if (path && path !== gender) {
      // Capitalize first letter and replace dashes with spaces
      const formattedPath = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
      crumbs.push({ name: formattedPath, path: location.pathname });
    }

    setBreadcrumbs(crumbs);
  }, [location, gender]);

  const getGenderText = (gender) => {
    switch (gender) {
      case "male":
        return "Thời trang Nam";
      case "female":
        return "Thời trang Nữ";
      case "kids":
        return "NINOMAXX KIDS";
      case "material":
        return "Tất cả sản phẩm";
      default:
        return "";
    }
  };

  return (
    <div className="w-full py-6 md:py-8 flex flex-col gap-4">
      {title && (
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl md:text-4xl text-gray-800 font-bold"
        >
          {title}
        </motion.h1>
      )}

      <div className="flex items-center flex-wrap">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="mx-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            )}

            {index === breadcrumbs.length - 1 ? (
              <span className="text-sm md:text-base font-medium text-blue-600">
                {crumb.name}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="text-sm md:text-base text-gray-500 hover:text-blue-600 hover:underline transition-colors"
              >
                {crumb.name}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>

      {gender && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-2"
        >
          <div className="inline-block bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              {gender === "male" && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}

              {gender === "female" && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}

              {gender === "kids" && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}

              <span className="text-sm md:text-base font-semibold text-gray-700">
                {getGenderText(gender)}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Breadcrumbs;
