import React, { useState } from 'react';
import axios from 'axios';
import './Test.css';

const Test = () => {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [newProduct, setNewProduct] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [variants, setVariants] = useState([{ sizeId: '', colorId: '' }]);

  // Handle file input change
  const handleFileChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  // Handle variant change
  const handleVariantChange = (index, e) => {
    const updatedVariants = [...variants];
    updatedVariants[index][e.target.name] = e.target.value;
    setVariants(updatedVariants);
  };

  // Add a new variant
  const handleAddVariant = () => {
    setVariants([...variants, { sizeId: '', colorId: '' }]);
  };

  // Remove a variant
  const handleRemoveVariant = (index) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    setVariants(updatedVariants);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation check before submission
    if (!productName || !description || !price || !categoryId || !brandId) {
      alert('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('productName', productName);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('categoryName', categoryId);
    formData.append('brandName', brandId);
    formData.append('newProduct', newProduct);

    // Append image files
    imageFiles.forEach((file) => {
      formData.append('imageFiles', file);
    });

    formData.append('variants', JSON.stringify(variants));

    try {
      const response = await axios.post('http://localhost:8080/api/v1/admin/products/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          "Authorization": `Bearer ${localStorage.getItem('token')}`, // Add token to the request
        },
      });

      if (response.status === 201) {
        alert('Product added successfully!');
      } else {
        alert('Failed to add product.');
      }
    } catch (error) {
      console.error('Error occurred:', error);
      alert('An error occurred while adding the product.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="form-group">
        <label>Product Name:</label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label>Price:</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label>Category ID:</label>
        <input
          type="text"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label>Brand ID:</label>
        <input
          type="text"
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label>New Product:</label>
        <input
          type="checkbox"
          checked={newProduct}
          onChange={(e) => setNewProduct(e.target.checked)}
          className="form-checkbox"
        />
      </div>

      <div className="form-group">
        <label>Select Images:</label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="form-input"
        />
      </div>

      {/* Show selected images */}
      {imageFiles.length > 0 && (
        <div className="selected-images">
          <h4>Selected Images:</h4>
          <div className="image-preview-container">
            {imageFiles.map((file, index) => (
              <div key={index} className="image-preview-item">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="preview-img"
                />
                <span>{file.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Variants Section */}
      <div className="form-group">
        <label>Variants:</label>
        {variants.map((variant, index) => (
          <div key={index} className="variant-group">
            <div>
              <label>Size:</label>
              <input
                type="text"
                name="sizeId"
                value={variant.sizeId}
                onChange={(e) => handleVariantChange(index, e)}
                className="form-input"
                required
              />
            </div>
            <div>
              <label>Color:</label>
              <input
                type="text"
                name="colorId"
                value={variant.colorId}
                onChange={(e) => handleVariantChange(index, e)}
                className="form-input"
                required
              />
            </div>
            <button type="button" onClick={() => handleRemoveVariant(index)} className="remove-variant-btn">
              Remove Variant
            </button>
          </div>
        ))}
        <button type="button" onClick={handleAddVariant} className="add-variant-btn">
          Add Variant
        </button>
      </div>

      <button type="submit" className="submit-btn">Add Product</button>
    </form>
  );
};

export default Test;
