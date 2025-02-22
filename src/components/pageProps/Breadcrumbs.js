import React, { useEffect, useState } from "react";
import { HiOutlineChevronRight } from "react-icons/hi";
import { useLocation } from "react-router-dom";

const Breadcrumbs = ({ prevLocation, title, gender }) => {
  const location = useLocation();
  const [locationPath, setLocationPath] = useState("");

  useEffect(() => {
    setLocationPath(location.pathname.split("/")[1]);
  }, [location]);

  const getGenderText = (gender) => {
    switch (gender) {
      case "male":
        return "Sản phẩm thời trang Nam";
      case "female":
        return "Sản phẩm thời trang Nữ";
      case "kids":
        return "NINOMAXX KIDS";
      case "material":
        return "Tất cả sản phẩm";
      default:
        return "";
    }
  };

  return (
    <div className="w-full py-10 xl:py-10 flex flex-col gap-3">
      <h1 className="text-5xl text-primeColor font-titleFont font-bold">
        {title}
      </h1>
      <p className="text-sm font-normal text-lightText flex items-center">
        <span>{prevLocation}</span>
        <span className="px-1">
          <HiOutlineChevronRight />
        </span>
        <span className="font-semibold text-primeColor text-2xl">
          {gender ? getGenderText(gender) : locationPath}
        </span>
      </p>
    </div>
  );
};

export default Breadcrumbs;
