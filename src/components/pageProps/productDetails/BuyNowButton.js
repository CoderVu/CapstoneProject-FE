import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingBag } from 'react-icons/fa';

const BuyNowButton = ({
  productId,
  selectedSize,
  selectedColor,
  quantity,
  productPrice,
  productName,
  productImage,
  disabled = false
}) => {
  const navigate = useNavigate();

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      // Alert if size or color is not selected
      alert('Vui lòng chọn kích cỡ và màu sắc trước khi mua ngay!');
      return;
    }

    // Create product order info object
    const productInfo = {
      productId,
      size: selectedSize.sizeName,
      color: selectedColor.color,
      quantity: quantity || 1,
      amount: productPrice * (quantity || 1),
      productName,
      productImage,
    };
     // Debug output
  console.log('Buy Now Product Info:', productInfo);

    // Navigate to buy now page with product info
    navigate('/buy-now', { state: { product: productInfo } });
  };



  return (
    <button
      onClick={handleBuyNow}
      disabled={disabled}
      className={` flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium
            bg-black hover:bg-primeColor duration-300 text-white ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
    
      <span className="font-medium">Mua Ngay</span>
    </button>
  );
};

export default BuyNowButton;
