import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { showSuccessToast, showErrorToast } from "../../components/Toast/ToastNotification";
import FavoritesList from "./FavoritesList";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { getFavorite, removeFavorite } from "../../redux/service/userService";
import { fetchProductDetail } from "../../redux/service/productService";

const Favorites = () => {
  const { auth } = useSelector((state) => state.auth);
  const navigate = useNavigate(); // Hook for navigation
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!auth) {
      navigate("/signin", {
        state: { from: "/favorite", message: "Vui lòng đăng nhập để xem danh sách yêu thích" },
      });
    }
  }, [auth, navigate]);

  // Function to fetch favorites
  const fetchFavorites = async () => {
    if (auth) {
      try {
        setLoading(true);
        // Call the getFavorite API to get the list of favorite products
        const response = await getFavorite();
        const favoriteData = response; // Access data from API

        if (favoriteData.length === 0) {
          setFavoriteProducts([]);
          setLoading(false);
          return;
        }

        // Get product details for each productId
        const productDetails = await Promise.all(
          favoriteData.map(async (favorite) => {
            const productResponse = await fetchProductDetail(favorite.productId);
            return {
              ...productResponse,
              favoriteId: favorite.productId, // Add favoriteId information
            };
          })
        );

        setFavoriteProducts(productDetails); // Save favorite products list
      } catch (error) {
        console.error("Error fetching favorites:", error);
        showErrorToast("Có lỗi khi tải danh sách yêu thích");
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetch favorites when the page loads if the user is logged in
  useEffect(() => {
    fetchFavorites();
  }, [auth]);

  // Handle removing a favorite
  const handleRemoveFavorite = async (productId) => {
    try {
      // Remove from server
      await removeFavorite(productId);

      // Update local state by filtering out the removed product
      setFavoriteProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productId)
      );
    } catch (error) {
      console.error("Error removing favorite:", error);
      showErrorToast("Có lỗi khi xóa sản phẩm khỏi danh sách yêu thích");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-container mx-auto px-2 sm:px-4 md:px-6 lg:px-8"
    >
      <Breadcrumbs title="Danh sách yêu thích" />

      <div className="py-4 sm:py-6 md:py-8 lg:py-10">
        {loading ? (
          <div className="flex justify-center items-center py-12 sm:py-16 md:py-20">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <FavoritesList
            favoriteProducts={favoriteProducts}
            onRemoveFavorite={handleRemoveFavorite}
          />
        )}
      </div>

      {/* Recommendations section could be added here */}
    </motion.div>
  );
};

export default Favorites;