import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastNotification = () => {
  return <ToastContainer position="bottom-left" />;
};

export const showCustomToast = ({ userName, productName, productCode, timeAgo }) => {
  toast(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "white",
        borderRadius: "8px",
        padding: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
        maxWidth: "300px",
      }}
    >
      <img
        src="https://dbimage.blob.core.windows.net/images/c7ce4a03-1ad8-4874-9a80-292bcb88087b-orebiLogo.png" // Thay bằng ảnh đại diện nếu có
        alt="User Avatar"
        style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
      />
      <div>
        <strong>{userName}</strong> vừa mua{" "}
        <span style={{ fontWeight: "bold" }}>{productName}</span>
        <br />
        <span style={{ color: "gray" }}>{productCode}</span>
        <br />
        <span style={{ fontSize: "12px", color: "gray" }}>{timeAgo}</span>
      </div>
    </div>,
    { position: "bottom-left", autoClose: 5000 }
  );
};

export default ToastNotification;