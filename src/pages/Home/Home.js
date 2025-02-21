import React from "react";
import Banner from "../../components/Banner/Banner";
import BestSellers from "../../components/home/BestSellers/BestSellers";
import NewArrivals from "../../components/home/NewArrivals/NewArrivals";
import Sale from "../../components/home/Sale/Sale";
import SpecialOffers from "../../components/home/SpecialOffers/SpecialOffers";
import YearProduct from "../../components/home/YearProduct/YearProduct";
import ViewedProducts from "../../components/home/Viewed/ViewedProducts";

const Home = () => {
  return (
    <div className="w-full mx-auto">
      <Banner />
      <div className="max-w-container mx-auto mt-4">
        <Sale />
        <div className="mt-8">
          <NewArrivals />
        </div>
        <div>
        <ViewedProducts />
        </div>
        <div className="mt-8">
          <BestSellers />
        </div>
        <div className="mt-8">
          <YearProduct />
        </div>
        <div className="mt-8">
          <SpecialOffers />
        </div>
        
      </div>
    </div>
  );
};

export default Home;