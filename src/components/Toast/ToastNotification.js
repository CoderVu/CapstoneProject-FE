import React from "react";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HiCheckCircle, HiXCircle, HiInformationCircle, HiX } from "react-icons/hi";

const ToastNotification = () => {
  return (
    <ToastContainer
      position="bottom-left"
      transition={Slide}
      closeOnClick={false}
      pauseOnHover={true}
      draggable={true}
      className="!z-[9999]"
      toastClassName={() => 
        "relative flex p-1 rounded-lg justify-between overflow-hidden cursor-pointer m-4 shadow-lg backdrop-blur-sm bg-white/80 border border-gray-100"
      }
    />
  );
};

// Custom Success Toast
const SuccessToast = ({ message }) => (
  <div className="flex items-center py-3 px-4 gap-3">
    <div className="flex-shrink-0">
      <HiCheckCircle className="w-6 h-6 text-emerald-500" />
    </div>
    <div className="flex-grow">
      <p className="text-gray-800 font-medium">{message}</p>
    </div>
  </div>
);

// Custom Error Toast
const ErrorToast = ({ message }) => (
  <div className="flex items-center py-3 px-4 gap-3">
    <div className="flex-shrink-0">
      <HiXCircle className="w-6 h-6 text-red-500" />
    </div>
    <div className="flex-grow">
      <p className="text-gray-800 font-medium">{message}</p>
    </div>
  </div>
);

// Custom Info Toast
const InfoToast = ({ message }) => (
  <div className="flex items-center py-3 px-4 gap-3">
    <div className="flex-shrink-0">
      <HiInformationCircle className="w-6 h-6 text-blue-500" />
    </div>
    <div className="flex-grow">
      <p className="text-gray-800 font-medium">{message}</p>
    </div>
  </div>
);

// 🟢 Toast thành công
export const showSuccessToast = (message) => {
  toast.success(<SuccessToast message={message} />, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeButton: CloseButton,
    icon: false,
    className: "border-l-4 border-l-emerald-500 !bg-gradient-to-r from-emerald-50/50 to-white/80",
    progressClassName: "!bg-gradient-to-r from-emerald-300 to-emerald-500"
  });
};

// 🔴 Toast lỗi
export const showErrorToast = (message) => {
  toast.error(<ErrorToast message={message} />, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeButton: CloseButton,
    icon: false,
    className: "border-l-4 border-l-red-500 !bg-gradient-to-r from-red-50/50 to-white/80",
    progressClassName: "!bg-gradient-to-r from-red-300 to-red-500"
  });
};

// 🔵 Toast thông báo
export const showInfoToast = (message) => {
  toast.info(<InfoToast message={message} />, {
    position: "bottom-left",
    autoClose: 5000,
    hideProgressBar: true,
    closeButton: CloseButton,
    icon: false,
    className: "border-l-4 border-l-blue-500 !bg-gradient-to-r from-blue-50/50 to-white/80"
  });
};

// Custom Close Button
const CloseButton = ({ closeToast }) => (
  <button 
    onClick={closeToast}
    className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 transition-colors duration-200 ease-in-out mr-1 mt-1 text-gray-500"
  >
    <HiX className="w-4 h-4" />
  </button>
);

// Custom notification toast
export const showCustomToast = ({ userName, productName, productCode, timeAgo }) => {
  toast(
    <div className="flex items-start py-3 px-4 gap-3">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
            src="https://dbimage.blob.core.windows.net/images/c7ce4a03-1ad8-4874-9a80-292bcb88087b-orebiLogo.png"
            alt="User Avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="flex-grow">
        <div className="text-sm">
          <span className="font-semibold text-gray-800">{userName}</span> vừa mua{" "}
          <span className="font-semibold text-indigo-600">{productName}</span>
          <div className="text-gray-500 text-xs mt-0.5">{productCode}</div>
          <div className="text-gray-400 text-xs mt-1">{timeAgo}</div>
        </div>
      </div>
    </div>,
    {
      position: "bottom-left",
      autoClose: 5000,
      closeButton: CloseButton,
      icon: false,
      hideProgressBar: true,
      className: "border-l-4 border-l-indigo-500 !bg-gradient-to-r from-indigo-50/50 to-white/80 shadow-lg"
    }
  );
};

export default ToastNotification;