import { Link, Outlet } from "react-router-dom";
import { useEffect } from "react";

export default function Dashboard() {
  useEffect(() => {
    window.addEventListener("DOMContentLoaded", (event) => {
      // Toggle the side navigation
      const sidebarToggle = document.body.querySelector("#sidebarToggle");
      if (sidebarToggle) {
        sidebarToggle.addEventListener("click", (event) => {
          event.preventDefault();
          document.body.classList.toggle("sb-sidenav-toggled");
          localStorage.setItem(
            "sb|sidebar-toggle",
            document.body.classList.contains("sb-sidenav-toggled")
          );
        });
      }
    });
  }, []);

  return (
    <div className="container-fluid px-4">
      <h1 className="mt-4">Dashboard</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item active">Dashboard</li>
      </ol>
      <div className="row">
        <div className="col-xl-3 col-md-6">
          <div className="card bg-primary text-white mb-4">
            <div className="card-body">Primary Card</div>
            <div className="card-footer d-flex align-items-center justify-content-between">
              <Link className="small text-white stretched-link" to="#">
                View Details
              </Link>
              <div className="small text-white">
                <i className="fas fa-angle-right"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}