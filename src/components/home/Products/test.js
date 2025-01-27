import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../../../redux/actions/productActions";

const Test = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.product.products || []);
  const loading = useSelector((state) => state.product.loading);
  const error = useSelector((state) => state.product.error);
  
  // States for pagination
  const [page, setPage] = useState(0); // current page
  const [size, setSize] = useState(1); // number of items per page

  useEffect(() => {
    dispatch(getProducts(page, size)); // Fetch products based on page and size
  }, [dispatch, page, size]);

  const handlePageChange = (newPage) => {
    setPage(newPage); // Update the page state
  };

  const handleSizeChange = (event) => {
    setSize(Number(event.target.value)); // Update the size state
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Products</h1>

      {/* Controls for page and size */}
      <div>
        <label>Items per page: </label>
        <select value={size} onChange={handleSizeChange}>
          <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={7}>7</option>
            <option value={8}>8</option>
            <option value={9}>9</option>
            <option value={10}>10</option>
            
        </select>
      </div>

      <div>
        <button onClick={() => handlePageChange(page - 1)} disabled={page <= 0}>
          Previous
        </button>
        <span>Page {page + 1}</span>
        <button onClick={() => handlePageChange(page + 1)}>
          Next
        </button>
      </div>

      <ul>
        {Array.isArray(products) && products.length > 0 ? (
          products.map((product) => (
            <li key={product.id}>
              <h2>{product.productName}</h2>
              <p>{product.description}</p>
              <p>Price: ${product.price}</p>
              {product.mainImage && product.mainImage.path ? (
                <img src={product.mainImage.path} alt={product.productName} width="100" />
              ) : (
                <p>No main image available</p>
              )}
            </li>
          ))
        ) : (
          <p>No products available</p>
        )}
      </ul>
    </div>
  );
};

export default Test;
