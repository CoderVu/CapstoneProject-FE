import React from "react";
import Banner from "../../components/Banner/Banner";
import BestSellers from "../../components/home/BestSellers/BestSellers";
import NewArrivals from "../../components/home/NewArrivals/NewArrivals";
import CategorySection from "../../components/home/Category/CategorySection";
import SpecialOffers from "../../components/home/SpecialOffers/SpecialOffers";
import YearProduct from "../../components/home/YearProduct/YearProduct";
import ViewedProducts from "../../components/home/Viewed/ViewedProducts";
import SurveyAIRecommend from "../../components/pageProps/productDetails/SurveyAIRecommend";

const Home = () => {
  return (
    <div className="w-full mx-auto">
      <Banner />
      <div className="max-w-container mx-auto px-4">
        {/* AI Match section */}
        <div className="max-w-container mx-auto px-4 pt-8 pb-8">
          {/* <SurveyAIRecommend /> */}
        </div>
        {/* Category section */}
        <div className="py-10">
          <CategorySection />
        </div>

        {/* New Arrivals section */}
        <div className="py-10 border-t border-gray-200">
          <NewArrivals />
        </div>

        {/* Best Sellers section */}
        <div className="py-10 border-t border-gray-200">
          <BestSellers />
        </div>

        {/* Recently Viewed Products */}
        <div className="py-10 border-t border-gray-200">
          <ViewedProducts />
        </div>

        {/* Year Product section */}
        <div className="py-10 border-t border-gray-200">
          <YearProduct />
        </div>

        {/* Special Offers section */}
        <div className="py-10 border-t border-gray-200">
          <SpecialOffers />
        </div>
      </div>
    </div>
  );
};

export default Home;
