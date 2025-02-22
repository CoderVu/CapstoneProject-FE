import React from "react";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastNotification = () => {
  return (
    <ToastContainer
      position="bottom-left"
      transition={Slide}
      closeOnClick={true}
      pauseOnHover={false}
    />
  );
};

// 🟢 Toast thành công
export const showSuccessToast = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false, 
    closeButton: true,
  });
};

// 🔴 Toast lỗi
export const showErrorToast = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeButton: true,

  });
};

// 🔵 Toast thông báo (không icon)
export const showInfoToast = (message) => {
  toast.info(message, {
    position: "bottom-left",
    autoClose: 5000,
    icon: false, // Không có icon "!"
    hideProgressBar: true,
    closeButton: true,
    pauseOnFocusLoss: true,
  });
};

export const showCustomToast = ({ userName, productName, productCode, timeAgo }) => {
  toast.info(
    <div className="flex items-center">
      <img
        src="https://dbimage.blob.core.windows.net/images/c7ce4a03-1ad8-4874-9a80-292bcb88087b-orebiLogo.png"
        alt="User Avatar"
        className="w-10 h-10 rounded-full mr-2"
      />
      <div className="text-sm">
        <strong>{userName}</strong> vừa mua <span className="font-bold text-primeColor">{productName}</span>
        <br />
        <span className="text-gray-500">{productCode}</span>
        <br />
        <span className="text-gray-400 text-xs">{timeAgo}</span>
      </div>
    </div>,
    {
      position: "bottom-left",
      autoClose: 5000,
      className: "toastify-custom",
      bodyClassName: "toastify-body",
      progressClassName: "toastify-progress",
      closeButton: true,
      closeOnClick: true,
      pauseOnHover: true,
      hideProgressBar: true,
      icon: false,
    }
  );
};

export default ToastNotification;
