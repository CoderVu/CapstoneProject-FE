import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastNotification = () => {
  return <ToastContainer position="bottom-left" />;
};

export const showCustomToast = ({ userName, productName, productCode, timeAgo }) => {
  toast(
    <div className="flex items-center bg-white rounded-lg p-2 shadow-md max-w-xs">
      <img
        src="https://dbimage.blob.core.windows.net/images/c7ce4a03-1ad8-4874-9a80-292bcb88087b-orebiLogo.png" 
        alt="User  Avatar"
        className="w-10 h-10 rounded-full mr-2"
      />
      <div>
        <strong className="font-semibold">{userName}</strong> vừa mua{" "}
        <span className="font-bold">{productName}</span>
        <br />
        <span className="text-gray-500">{productCode}</span>
        <br />
        <span className="text-gray-400 text-xs">{timeAgo}</span>
      </div>
    </div>,
    { position: "bottom-left", autoClose: 5000 }
  );
};

export default ToastNotification;