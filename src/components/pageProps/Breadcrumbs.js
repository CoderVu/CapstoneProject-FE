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
    <div className="w-full py-4 sm:py-6 md:py-8 flex flex-col gap-3 sm:gap-4 md:gap-6 bg-gradient-to-b from-white to-gray-50">
      {title && (
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-800 font-bold tracking-tight px-2 sm:px-4"
        >
          {title}
        </motion.h1>
      )}

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-center flex-wrap bg-white rounded-lg shadow-sm p-2 sm:p-3 md:p-4 mx-2 sm:mx-4"
      >
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="mx-2 sm:mx-3 text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            )}

            {index === breadcrumbs.length - 1 ? (
              <span className="text-xs sm:text-sm md:text-base font-semibold text-blue-600 bg-blue-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                {crumb.name}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="text-xs sm:text-sm md:text-base text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full transition-all duration-200"
              >
                {crumb.name}
              </Link>
            )}
          </React.Fragment>
        ))}
      </motion.div>

      {gender && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-2 px-2 sm:px-4"
        >
          <div className="inline-block bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              {gender === "male" && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}

              {gender === "female" && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}

              {gender === "kids" && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}

              <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
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
