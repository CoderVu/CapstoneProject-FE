import React, { useState } from "react";
import { addProduct } from "../../../redux/service/productService";

const AddProductForm = () => {
  const [productData, setProductData] = useState({
    productName: "",
    description: "",
    price: 0,
    discountPrice: 0,
    onSale: false,
    bestSeller: false,
    categoryName: "",
    gender: "",
    brandName: "",
    newProduct: false,
    imageFiles: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setProductData({ ...productData, [name]: checked });
    } else if (type === "file") {
      setProductData({ ...productData, [name]: Array.from(files) });
    } else {
      setProductData({ ...productData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addProduct(productData);
      console.log("Product added successfully:", response);
      // Handle success (e.g., show a success message, redirect, etc.)
    } catch (error) {
      console.error("Error adding product:", error);
      // Handle error (e.g., show an error message)
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg p-4 bg-white shadow-md rounded">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Field</th>
            <th className="py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-4 py-2">Product Name</td>
            <td className="border px-4 py-2">
              <input
                type="text"
                name="productName"
                value={productData.productName}
                onChange={handleChange}
                placeholder="Product Name"
                required
                className="w-full py-2 px-3"
              />
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Description</td>
            <td className="border px-4 py-2">
              <textarea
                name="description"
                value={productData.description}
                onChange={handleChange}
                placeholder="Description"
                required
                className="w-full py-2 px-3"
              />
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Price</td>
            <td className="border px-4 py-2">
              <input
                type="number"
                name="price"
                value={productData.price}
                onChange={handleChange}
                placeholder="Price"
                required
                className="w-full py-2 px-3"
              />
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Discount Price</td>
            <td className="border px-4 py-2">
              <input
                type="number"
                name="discountPrice"
                value={productData.discountPrice}
                onChange={handleChange}
                placeholder="Discount Price"
                className="w-full py-2 px-3"
              />
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2">On Sale</td>
            <td className="border px-4 py-2">
              <input
                type="checkbox"
                name="onSale"
                checked={productData.onSale}
                onChange={handleChange}
                className="mr-2"
              />
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Best Seller</td>
            <td className="border px-4 py-2">
              <input
                type="checkbox"
                name="bestSeller"
                checked={productData.bestSeller}
                onChange={handleChange}
                className="mr-2"
              />
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Category Name</td>
            <td className="border px-4 py-2">
              <input
                type="text"
                name="categoryName"
                value={productData.categoryName}
                onChange={handleChange}
                placeholder="Category Name"
                required
                className="w-full py-2 px-3"
              />
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Gender</td>
            <td className="border px-4 py-2">
              <input
                type="text"
                name="gender"
                value={productData.gender}
                onChange={handleChange}
                placeholder="Gender"
                required
                className="w-full py-2 px-3"
              />
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Brand Name</td>
            <td className="border px-4 py-2">
              <input
                type="text"
                name="brandName"
                value={productData.brandName}
                onChange={handleChange}
                placeholder="Brand Name"
                required
                className="w-full py-2 px-3"
              />
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2">New Product</td>
            <td className="border px-4 py-2">
              <input
                type="checkbox"
                name="newProduct"
                checked={productData.newProduct}
                onChange={handleChange}
                className="mr-2"
              />
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Image Files</td>
            <td className="border px-4 py-2">
              <input
                type="file"
                name="imageFiles"
                multiple
                onChange={handleChange}
                className="w-full py-2 px-3"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
      >
        Add Product
      </button>
    </form>
  );
};

export default AddProductForm;