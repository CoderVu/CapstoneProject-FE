import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Images from "../../../../assets/assets";
import "./style.css";
import "../../../../index.css";

export default function DashBoard() {
  const [selectedIndex, setSelectedIndex] = useState(
    Number(localStorage.getItem("selectedIndex"))
  );
  const [selectedTitle, setTitle] = useState("Dashboard");

  const itemDashboard = [
    {
      title: "Dashboard",
      url: "/admin/home",
      index: 0,
      icon: "fas fa-home",
    },
    {
      title: "Products",
      url: "/admin/products",
      index: 1,
      icon: "fa-solid fa-home",
    },
    {
      title: "Categories",
      url: "/admin/categories",
      index: 2,
      icon: "fa-solid fa-home",
    },
    {
      title: "Orders",
      url: "/admin/orders",
      index: 3,
      icon: "fa-solid fa-home",
    },
    {
      title: "Voucher",
      url: "/admin/voucher",
      index: 4,
      icon: "fa-solid fa-home",
    },
    {
      title: "Shipment",
      url: "/admin/shipment",
      index: 5,
      icon: "fa-solid fa-home",
    },
    {
      title: "User",
      url: "/admin/user",
      index: 6,
      icon: "fa-solid fa-home",
    },
    {
      title: "Message",
      url: "/admin/message",
      index: 7,
      icon: "fa-solid fa-home",
    },
  ];

  const itemProfile = [
    {
      title: "FlashSale event",
      url: "/admin",
      index: 9,
      icon: "fas fa-home",
    },
    {
      title: "Discount event",
      url: "/admin",
      index: 10,
      icon: "fa-solid fa-book",
    },
    {
      title: "Voucher event",
      url: "/admin/category",
      index: 11,
      icon: "fa-solid fa-book",
    },
  ];

  const navigate = useNavigate();

  const handleClickItem = (item) => {
    setSelectedIndex(item.index);
    setTitle(item.title);
    navigate(item.url);
    localStorage.setItem("selectedIndex", item.index);
  };

  useEffect(() => {
    const storedIndex = localStorage.getItem("selectedIndex");
    if (storedIndex !== null) {
      setSelectedIndex(Number(storedIndex));
    }
  }, []);

  return (
    <>
      <div className="container_admin">
        <div className="dashboard">
          <div className="logo_dashboard">
            <img
              src="https://flowbite.com/docs/images/logo.svg"
              className="w-16 h-16 bg-gray-200 rounded-full p-4"
            />
            <div className="website_name font-bold text-xl">Website Admin</div>
          </div>
          <div className="overflow-auto h-screen">
            {itemDashboard.map((item, index) => (
              <div
                className={`item_dashboard ${
                  selectedIndex === index ? "selected_dashboard" : ""
                }`}
                onClick={() => handleClickItem(item)}
                key={index}
              >
                <div className="item_icon">
                  <i className={item.icon}></i>
                </div>
                <div className="item_content">{item.title}</div>
              </div>
            ))}
            <div className="w-8/12 h-1 mx-auto rounded-lg bg-gray-200 my-5 "></div>
          </div>
        </div>
        <main className="main_body_content pl-5">
          <div className="col-auto">
            <div className="header_product ">
              <div className="title_content">
                <p className="title_big">Pages</p>
                <span className="title_small">/ {selectedTitle}</span>
              </div>
              <div className="flex justify-center alight-center">
                <div
                  className="w-60 h-12 bg-white rounded-2xl flex justify-center alight-center"
                  style={{ border: "1px solid #E2E8F0" }}
                >
                  <i className="fa-solid fa-magnifying-glass text-gray-300"></i>
                  <input
                    type="text"
                    placeholder="Type here ..."
                    className="w-40 h-full outline-none ml-3 text-sm text-gray-400"
                  />
                </div>
                <div
                  className="flex ml-4 justify-center alight-center cursor-pointer"
                  style={{ color: "#718096" }}
                >
                  <i className="fa-solid fa-user"></i>
                  <p className="ml-2 font-bold">Sign in</p>
                </div>
                <i
                  className="ml-6 fa-solid fa-gear cursor-pointer"
                  style={{ color: "#718096" }}
                ></i>
                <i
                  className="ml-6 mr-10 fa-solid fa-bell cursor-pointer"
                  style={{ color: "#718096" }}
                ></i>
              </div>
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}