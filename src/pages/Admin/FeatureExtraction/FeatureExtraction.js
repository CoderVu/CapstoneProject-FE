import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiRefreshCw, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { BiImageAdd } from 'react-icons/bi';
import { MdOutlineAutoFixHigh } from 'react-icons/md';
import { Tooltip } from 'react-tooltip';
import API_CONFIG from '../../../redux/setup/config/api';

const FeatureExtraction = () => {
  // States
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [vectorDimensions, setVectorDimensions] = useState(null);
  // Config states
  const [config, setConfig] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState(2048);
  const [modalManuallyClosed, setModalManuallyClosed] = useState(false);
  const [pendingReExtract, setPendingReExtract] = useState(false);
  
  // Add state for image modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Helper function to check if vector features exist
  const hasVectorFeatures = (vectorFeatures) => {
    if (!vectorFeatures) return false;
    if (Array.isArray(vectorFeatures)) {
      return vectorFeatures.length > 0;
    }
    if (typeof vectorFeatures === 'string') {
      return vectorFeatures && vectorFeatures.trim().length > 0;
    }
    return false;
  };

  // Fetch extraction stats
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.AI.EXTRACTION.STATS}`);
      setStats(response.data);
      setError(null);
    } catch (err) {
      
    }
  };

  // Fetch config
  const fetchConfig = async () => {
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.AI.EXTRACTION.CONFIG}`);
      setConfig(res.data);
      setSelectedDimension(res.data.vector_dimensions);
    } catch (e) {
      
    }
  };

  // Fetch vector dimensions info
  const fetchVectorDimensions = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.AI.EXTRACTION.VECTOR_DIMENSIONS}`);
      setVectorDimensions(response.data);
      setError(null);
    } catch (err) {
      console.warn('Không thể lấy thông tin chiều vector:', err.message);
    }
  };

  // Fetch extraction status
  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.AI.EXTRACTION.STATUS}`);
      setStatus(response.data);
      setError(null);
    } catch (err) {
      
    }
  };

  // Fetch products data
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.AI.EXTRACTION.PRODUCTS}`);
      
      if (!response.data?.products) {
        setError('Dữ liệu sản phẩm không hợp lệ');
        return;
      }

      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể lấy danh sách sản phẩm: ' + (err.response?.data?.error || err.message));
    }
  };

  // Start polling when extraction is running
  useEffect(() => {
    if (status?.is_running) {
      const interval = setInterval(fetchStatus, 1000);
      setPollingInterval(interval);
    } else {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [status?.is_running]);

  // Initial fetch
  useEffect(() => {
    fetchStats();
    fetchStatus();
    fetchProducts();
    fetchVectorDimensions();
    fetchConfig();
  }, []);

  // Add debug logging for products state
  useEffect(() => {
    console.log('=== PRODUCTS STATE UPDATED ===');
    console.log('Products state:', {
      hasProducts: !!products,
      totalProducts: products?.total_products,
      productsArray: products?.products,
      productsLength: products?.products?.length,
      firstProduct: products?.products?.[0]
    });
  }, [products]);

  // Start extraction
  const handleStart = async (processAll = false) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Lấy danh sách sản phẩm nếu chưa có
      if (!products?.products) {
        await fetchProducts();
      }

      // Thu thập tất cả ảnh cần trích xuất từ tất cả sản phẩm
      const allImagesToProcess = products.products.flatMap(product => {
        return product.images
          .filter(img => {
            const hasValidPath = img.path || img.url;
            const needsUpdate = !hasVectorFeatures(img.vectorFeatures);
            return hasValidPath && needsUpdate;
          })
          .map(img => ({
            ...img,
            productName: product.productName
          }));
      });
      
      if (allImagesToProcess.length === 0) {
        setSuccess('Không có ảnh nào cần trích xuất');
        return;
      }

      // Gọi API để bắt đầu trích xuất
      const response = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.AI.EXTRACTION.START}`, { 
        process_all: processAll,
        images: allImagesToProcess.map(img => ({
          id: img.id,
          path: img.path || img.url
        }))
      });

      fetchStatus();
      fetchStats();
      
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  // Stop extraction
  const handleStop = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.AI.EXTRACTION.STOP}`);
      fetchStatus();
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  // Refresh stats
  const handleRefresh = () => {
    fetchStats();
    fetchStatus();
    fetchProducts();
    fetchVectorDimensions();
  };

  // Update vector features for a single image
  const handleUpdateSingleImage = async (image) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setUpdateStatus(null);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AI.EXTRACTION.UPDATE_SINGLE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: image.path || image.url,
          id: image.id
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.status === 'skipped') {
          setSuccess('Ảnh đã có vector features, không cần cập nhật');
        } else {
          setSuccess('Cập nhật vector features thành công');
        }
        
        // Clear cache after successful update
        await handleClearCache();
        
        // Refresh data
        await Promise.all([fetchStats(), fetchProducts(), fetchVectorDimensions()]);
      } else {
        setError(result.error || 'Lỗi khi cập nhật vector features');
      }

    } catch (error) {
      setError('Lỗi khi cập nhật ảnh: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update vector features for a single product
  const handleUpdateProduct = async (product) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setUpdateStatus(null);

      // Lọc ra những ảnh cần cập nhật (chưa có vector features)
      const imagesToUpdate = product.images.filter(img => {
        const hasValidPath = img.path || img.url;
        const needsUpdate = !hasVectorFeatures(img.vectorFeatures);
        return hasValidPath && needsUpdate;
      });

      if (imagesToUpdate.length === 0) {
        setSuccess('Không có ảnh nào cần cập nhật');
        return;
      }

      let successCount = 0;
      let failedCount = 0;
      const failedImages = [];

      // Xử lý từng ảnh
      for (const img of imagesToUpdate) {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AI.EXTRACTION.UPDATE_SINGLE}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              path: img.path || img.url,
              id: img.id
            }),
          });

          const result = await response.json();

          if (response.ok) {
            if (result.status === 'skipped') {
              // Ảnh đã có vector features, bỏ qua
            } else {
              successCount++;
            }
          } else {
            failedCount++;
            failedImages.push({
              id: img.id,
              path: img.path || img.url,
              error: result.error
            });
          }

          // Cập nhật trạng thái sau mỗi ảnh
          setUpdateStatus({
            total_images: imagesToUpdate.length,
            success_count: successCount,
            failed_count: failedCount,
            failed_images: failedImages,
            current_image: img.path || img.url
          });

        } catch (error) {
          failedCount++;
          failedImages.push({
            id: img.id,
            path: img.path || img.url,
            error: error.message
          });
        }
      }

      // Cập nhật UI
      if (successCount > 0) {
        setSuccess(`Đã cập nhật thành công ${successCount} ảnh${failedCount > 0 ? `, ${failedCount} ảnh thất bại` : ''}`);
      } else if (failedCount > 0) {
        setError(`Cập nhật thất bại ${failedCount} ảnh`);
      }

      // Clear cache after processing
      await handleClearCache();
      
      // Refresh data
      await Promise.all([fetchStats(), fetchProducts(), fetchVectorDimensions()]);

    } catch (error) {
      setError('Lỗi khi cập nhật sản phẩm: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update vector features for all images
  const handleUpdateAll = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setUpdateStatus(null);
    
    try {
      // Lấy danh sách sản phẩm nếu chưa có
      if (!products?.products) {
        await fetchProducts();
      }

      // Thu thập tất cả ảnh cần cập nhật từ tất cả sản phẩm
      const allImagesToUpdate = products.products.flatMap(product => {
        return product.images
          .filter(img => {
            const hasValidPath = img.path || img.url;
            const needsUpdate = !hasVectorFeatures(img.vectorFeatures);
            return hasValidPath && needsUpdate;
          })
          .map(img => ({
            ...img,
            productName: product.productName
          }));
      });

      if (allImagesToUpdate.length === 0) {
        setSuccess('Không có ảnh nào cần cập nhật');
        return;
      }

      let successCount = 0;
      let failedCount = 0;
      const failedImages = [];

      // Xử lý từng ảnh
      for (const img of allImagesToUpdate) {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AI.EXTRACTION.UPDATE_SINGLE}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              path: img.path || img.url,
              id: img.id
            }),
          });

          const result = await response.json();

          if (response.ok) {
            if (result.status === 'skipped') {
              // Ảnh đã có vector features, bỏ qua
            } else {
              successCount++;
            }
          } else {
            failedCount++;
            failedImages.push({
              id: img.id,
              path: img.path || img.url,
              error: result.error
            });
          }

          // Cập nhật trạng thái sau mỗi ảnh
          setUpdateStatus({
            total_images: allImagesToUpdate.length,
            success_count: successCount,
            failed_count: failedCount,
            failed_images: failedImages,
            current_image: img.path || img.url
          });

        } catch (error) {
          failedCount++;
          failedImages.push({
            id: img.id,
            path: img.path || img.url,
            error: error.message
          });
        }
      }

      // Cập nhật UI
      if (successCount > 0) {
        setSuccess(`Đã cập nhật thành công ${successCount} ảnh${failedCount > 0 ? `, ${failedCount} ảnh thất bại` : ''}`);
      } else if (failedCount > 0) {
        setError(`Cập nhật thất bại ${failedCount} ảnh`);
      }

      // Clear cache after processing
      await handleClearCache();
      
      // Refresh data
      await Promise.all([fetchStats(), fetchProducts(), fetchVectorDimensions()]);

    } catch (error) {
      setError('Lỗi khi cập nhật tất cả ảnh: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new function to re-extract all images
  const handleReExtractAll = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setUpdateStatus(null);
      
      console.log('=== BẮT ĐẦU TRÍCH XUẤT LẠI TOÀN BỘ ===');
      
      // Lấy danh sách sản phẩm nếu chưa có
      if (!products?.products) {
        console.log('Chưa có dữ liệu sản phẩm, đang fetch...');
        await fetchProducts();
      }

      console.log(`Tổng số sản phẩm: ${products?.products?.length || 0}`);

      // Thu thập tất cả ảnh từ tất cả sản phẩm, bỏ qua điều kiện vectorFeatures
      const allImagesToUpdate = products.products.flatMap(product => {
        return product.images
          .filter(img => {
            const hasValidPath = img.path || img.url;
            return hasValidPath; // Chỉ kiểm tra có đường dẫn hợp lệ
          })
          .map(img => ({
            ...img,
            productName: product.productName
          }));
      });

      console.log(`Tổng số ảnh cần xử lý: ${allImagesToUpdate.length}`);

      if (allImagesToUpdate.length === 0) {
        setSuccess('Không có ảnh nào để xử lý');
        return;
      }

      let successCount = 0;
      let failedCount = 0;
      const failedImages = [];

      // Xử lý từng ảnh
      for (let i = 0; i < allImagesToUpdate.length; i++) {
        const img = allImagesToUpdate[i];
        try {
          console.log(`Đang xử lý ảnh ${i + 1}/${allImagesToUpdate.length}: ${img.path || img.url}`);
          
          const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AI.EXTRACTION.UPDATE_SINGLE}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              path: img.path || img.url,
              id: img.id,
              forceUpdate: true
            }),
          });

          const result = await response.json();
          console.log(`Response cho ảnh ${img.id}:`, { status: response.status, result });

          if (response.ok) {
            successCount++;
            console.log(`✅ Thành công: ${img.id}`);
          } else {
            failedCount++;
            failedImages.push({
              id: img.id,
              path: img.path || img.url,
              error: result.error || `HTTP ${response.status}`
            });
            console.log(`❌ Thất bại: ${img.id} - ${result.error}`);
          }

          // Cập nhật trạng thái sau mỗi ảnh
          setUpdateStatus({
            total_images: allImagesToUpdate.length,
            success_count: successCount,
            failed_count: failedCount,
            failed_images: failedImages,
            current_image: img.path || img.url
          });

        } catch (error) {
          failedCount++;
          failedImages.push({
            id: img.id,
            path: img.path || img.url,
            error: error.message
          });
          console.log(`❌ Lỗi network: ${img.id} - ${error.message}`);
        }
      }

      console.log(`=== KẾT QUẢ: ${successCount} thành công, ${failedCount} thất bại ===`);

      // Cập nhật UI
      if (successCount > 0) {
        setSuccess(`Đã trích xuất lại thành công ${successCount} ảnh${failedCount > 0 ? `, ${failedCount} ảnh thất bại` : ''}`);
      } else if (failedCount > 0) {
        setError(`Trích xuất lại thất bại ${failedCount} ảnh`);
      }

      // Clear cache after processing
      console.log('Đang xóa cache...');
      await handleClearCache();
      
      // Refresh data
      console.log('Đang refresh dữ liệu...');
      await Promise.all([fetchStats(), fetchProducts(), fetchVectorDimensions()]);

    } catch (error) {
      console.error('Lỗi trong handleReExtractAll:', error);
      setError('Lỗi khi trích xuất lại toàn bộ ảnh: ' + error.message);
    } finally {
      setLoading(false);
      console.log('=== KẾT THÚC TRÍCH XUẤT LẠI TOÀN BỘ ===');
    }
  };

  // Add new function to process new images
  const handleProcessNew = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.AI.EXTRACTION.PROCESS_NEW}`);
      
      if (response.data.results) {
        const { total, success, failed, failed_images } = response.data.results;
        if (success > 0) {
          setSuccess(`Đã xử lý thành công ${success} ảnh${failed > 0 ? `, ${failed} ảnh thất bại` : ''}`);
        }
        if (failed > 0) {
          setError(`Xử lý thất bại ${failed} ảnh. Chi tiết: ${failed_images.map(f => `${f.id}: ${f.error}`).join(', ')}`);
        }
      }
      
      // Clear cache after processing
      await handleClearCache();
      
      // Refresh data
      await Promise.all([fetchStats(), fetchProducts(), fetchVectorDimensions()]);
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi xử lý ảnh mới');
    } finally {
      setLoading(false);
    }
  };

  // Add function to fix inconsistent vector dimensions
  const handleFixDimensions = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setUpdateStatus(null);
    
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.AI.EXTRACTION.FIX_DIMENSIONS}`);
      
      if (response.data) {
        const { fixed_count, failed_count, inconsistent_found } = response.data;
        
        if (inconsistent_found === 0) {
          setSuccess('Không có ảnh nào có chiều vector không nhất quán');
        } else if (fixed_count > 0) {
          setSuccess(`Đã sửa chữa thành công ${fixed_count} ảnh${failed_count > 0 ? `, ${failed_count} ảnh thất bại` : ''}`);
        } else if (failed_count > 0) {
          setError(`Sửa chữa thất bại ${failed_count} ảnh`);
        }
        
        // Update status with results
        setUpdateStatus({
          total_images: response.data.total_checked,
          success_count: fixed_count,
          failed_count: failed_count,
          failed_images: response.data.failed_images || [],
          current_image: 'Hoàn thành sửa chữa'
        });
      }
      
      // Clear cache after processing
      await handleClearCache();
      
      // Refresh data
      await Promise.all([fetchStats(), fetchProducts(), fetchVectorDimensions()]);
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi sửa chữa chiều vector');
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm xử lý phân trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi số item trên trang
  };

  // Tính toán danh sách sản phẩm cho trang hiện tại
  const getCurrentPageProducts = () => {
    if (!products?.products) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.products.slice(startIndex, endIndex);
  };

  // Tính toán tổng số trang
  useEffect(() => {
    if (products?.products) {
      setTotalPages(Math.ceil(products.products.length / itemsPerPage));
    }
  }, [products, itemsPerPage]);

  // Handle config submit
  const handleConfigSubmit = async () => {
    setLoading(true);
    try {
      let needUpdate = selectedDimension !== config.vector_dimensions;
      let res = null;
      if (needUpdate) {
        res = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.AI.EXTRACTION.CONFIG}`, {
          vector_dimensions: selectedDimension
        });
        setConfig(res.data);
        setSuccess('Đã cập nhật cấu hình chiều vector!');
        await fetchVectorDimensions();
      }
      setShowConfigModal(false);
      setModalManuallyClosed(true);
      if (pendingReExtract) {
        setPendingReExtract(false);
        await handleReExtractAll();
      } else if (res && res.data?.needs_re_extraction) {
        setSuccess('Đã đổi chiều vector, hệ thống sẽ trích xuất lại toàn bộ!');
        await handleReExtractAll();
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Lỗi khi cập nhật cấu hình');
    }
    setLoading(false);
  };

  // Thêm hàm xóa cache
  const handleClearCache = async () => {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.AI.EXTRACTION.CLEAR_CACHE}`, { cache_type: 'all' });
      if (response.data.status === 'success') {
        console.log('Đã xóa cache thành công');
        return true;
      } else {
        console.warn('Xóa cache không thành công:', response.data.error);
        return false;
      }
    } catch (err) {
      console.error('Lỗi khi xóa cache:', err.response?.data?.error || err.message);
      return false;
    }
  };

  // Thêm hàm xóa cache với UI feedback
  const handleClearCacheWithUI = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const success = await handleClearCache();
      if (success) {
        setSuccess('Đã xóa cache thành công!');
        // Reload lại dữ liệu
        await Promise.all([fetchStats(), fetchStatus(), fetchProducts(), fetchVectorDimensions()]);
      } else {
        setError('Lỗi khi xóa cache');
      }
    } catch (err) {
      setError('Lỗi khi xóa cache: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Add function to show all images of a product
  const handleShowAllImages = (product) => {
    setSelectedProduct(product);
    setShowImageModal(true);
  };

  // Add function to close image modal
  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="p-8 max-w-8xl mx-auto">

      {/* Config Modal */}
      {showConfigModal && config && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Chọn số chiều vector để trích xuất</h2>
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  setModalManuallyClosed(true);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <select
              className="w-full p-3 border rounded-lg mb-6"
              value={selectedDimension}
              onChange={e => setSelectedDimension(Number(e.target.value))}
            >
              {config?.available_dimensions?.map(dim => (
                <option key={dim} value={dim}>{dim} chiều</option>
              ))}
            </select>
            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              onClick={handleConfigSubmit}
              disabled={loading}
            >
              Xác nhận & bắt đầu trích xuất
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <FiAlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <div className="text-red-800">{error}</div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <FiInfo className="w-5 h-5 text-green-600 mr-3" />
            <div className="text-green-800">{success}</div>
          </div>
        </div>
      )}

      {/* Nút xóa cache */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleClearCacheWithUI}
          disabled={loading}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center space-x-2"
          title="Xóa toàn bộ cache hệ thống"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Xóa cache</span>
        </button>
      </div>

      {/* Main Stats Card */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">
              THỐNG KÊ TRÍCH XUẤT ĐẶC TRƯNG
            </h2>
            {stats && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="text-gray-600">Tổng số ảnh:</span>
                  <span className="font-medium text-xl">{stats.total_images}</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="text-gray-600">Đã trích xuất:</span>
                  <span className="font-medium text-xl text-green-600">{stats.images_with_features}</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="text-gray-600">Chưa trích xuất:</span>
                  <span className="font-medium text-xl text-orange-600">{stats.images_without_features}</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="text-gray-600">Tiến độ:</span>
                  <span className="font-medium text-xl text-blue-600">
                    {stats.completion_percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center items-end space-y-4">
            <div className="flex flex-col space-y-4 w-full">
              {!status?.is_running ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:border-blue-200 transition-all">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <BiImageAdd className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">Xử lý ảnh mới</h3>
                          <p className="text-sm text-gray-500">Tự động phát hiện và xử lý ảnh mới từ shop</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={handleProcessNew}
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                          data-tooltip-id="process-new-tooltip"
                          data-tooltip-content="Bắt đầu xử lý và trích xuất đặc trưng cho ảnh mới từ shop"
                        >
                          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                          <span>Bắt đầu</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:border-yellow-200 transition-all">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <MdOutlineAutoFixHigh className="w-8 h-8 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">Trích xuất lại toàn bộ</h3>
                          <p className="text-sm text-gray-500">Cập nhật lại vector đặc trưng cho tất cả ảnh</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <button
                          onClick={handleReExtractAll}
                          disabled={loading}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                          data-tooltip-id="re-extract-direct-tooltip"
                          data-tooltip-content="Trích xuất lại vector đặc trưng cho tất cả ảnh (2048 chiều)"
                        >
                          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                          <span>Trích xuất lại</span>
                        </button>
                       
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 border border-red-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-red-50 rounded-lg">
                        <FiAlertCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Đang xử lý</h3>
                        <p className="text-sm text-gray-500">Quá trình trích xuất đang được thực hiện</p>
                      </div>
                    </div>
                    <button
                      onClick={handleStop}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      <span>Dừng xử lý</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vector Dimensions Info Card */}
      {vectorDimensions && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              THÔNG TIN CHIỀU VECTOR
            </h2>
            <div className={`px-4 py-2 rounded-lg text-white font-medium ${
              vectorDimensions.is_system_consistent 
                ? 'bg-green-600' 
                : 'bg-red-600'
            }`}>
              {vectorDimensions.is_system_consistent ? 'HỆ THỐNG NHẤT QUÁN' : 'KHÔNG NHẤT QUÁN'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{vectorDimensions.expected_dimensions}</div>
                <div className="text-sm text-gray-600">Chiều vector mong đợi</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{vectorDimensions.images_with_features}</div>
                <div className="text-sm text-gray-600">Ảnh có vector features</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{vectorDimensions.inconsistent_dimensions.length}</div>
                <div className="text-sm text-gray-600">Ảnh không nhất quán</div>
              </div>
            </div>
          </div>

          {/* Dimension Statistics */}
          {Object.keys(vectorDimensions.dimension_stats).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Thống kê chiều vector:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(vectorDimensions.dimension_stats).map(([dim, count]) => (
                  <div key={dim} className={`p-3 rounded-lg border-2 ${
                    parseInt(dim) === vectorDimensions.expected_dimensions 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-red-500 bg-red-50'
                  }`}>
                    <div className="text-center">
                      <div className="text-lg font-bold">{dim} chiều</div>
                      <div className="text-sm text-gray-600">{count} ảnh</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inconsistent Images */}
          {vectorDimensions.inconsistent_dimensions.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-600">
                  Ảnh có chiều vector không nhất quán:
                </h3>
                <button
                  onClick={handleFixDimensions}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  data-tooltip-id="fix-dimensions-tooltip"
                  data-tooltip-content="Sửa chữa chiều vector không nhất quán cho tất cả ảnh"
                >
                  <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Sửa chữa</span>
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Chiều hiện tại</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Chiều mong đợi</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Sản phẩm</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vectorDimensions.inconsistent_dimensions.map((img, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{img.id}</td>
                        <td className="px-4 py-3 text-sm text-red-600 font-medium">{img.actual_dimensions}</td>
                        <td className="px-4 py-3 text-sm text-green-600 font-medium">{img.expected_dimensions}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{img.productId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Update Status Card */}
      {updateStatus && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            Kết quả cập nhật vector đặc trưng
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-lg">
              <span className="text-gray-600">Tổng số ảnh:</span>
              <span className="font-medium text-xl">{updateStatus.total_images}</span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span className="text-gray-600">Cập nhật thành công:</span>
              <span className="font-medium text-xl text-green-600">{updateStatus.success_count}</span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span className="text-gray-600">Cập nhật thất bại:</span>
              <span className="font-medium text-xl text-red-600">{updateStatus.failed_count}</span>
            </div>
          </div>
          {updateStatus.failed_images && updateStatus.failed_images.length > 0 && (
            <div className="mt-6">
              <h4 className="text-xl font-medium text-gray-800 mb-4">Chi tiết lỗi:</h4>
              <div className="max-h-80 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase">Lỗi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {updateStatus.failed_images.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-base text-gray-900">{item.id}</td>
                        <td className="px-6 py-4 text-base text-red-600">{item.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current Status Card */}
      {status?.is_running && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            Trạng thái hiện tại
          </h3>
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between text-lg">
              <span className="text-gray-600">Đang xử lý:</span>
              <span className="font-medium text-xl">{status.current_image}</span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span className="text-gray-600">Đã xử lý:</span>
              <span className="font-medium text-xl">
                {status.processed_count}/{status.total_images}
              </span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span className="text-gray-600">Thất bại:</span>
              <span className="font-medium text-xl text-red-600">{status.failed_count}</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${status.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Product Stats Table */}
      {products && products.products && products.products.length > 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              {/* <h3 className="text-2xl font-semibold text-gray-800">
                Thống kê theo sản phẩm
              </h3> */}
              <div className="flex items-center space-x-4">
                <label className="text-lg text-gray-600">Hiển thị:</label>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="5">5 sản phẩm</option>
                  <option value="10">10 sản phẩm</option>
                  <option value="20">20 sản phẩm</option>
                  <option value="50">50 sản phẩm</option>
                </select>
              </div>
            </div>
            {/* <div className="mt-4 text-lg text-gray-600">
              Tổng số sản phẩm: {products.total_products} | 
              Tổng số ảnh: {products.total_images} | 
              Đã trích xuất: {products.total_with_features} | 
              Chưa trích xuất: {products.total_without_features} | 
              Tiến độ tổng thể: {products.overall_completion.toFixed(1)}%
            </div> */}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-5 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                    Hình ảnh
                  </th>
                  <th className="px-8 py-5 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                    Tên sản phẩm
                  </th>
                  <th className="px-8 py-5 text-right text-base font-medium text-gray-500 uppercase tracking-wider">
                    Tổng số ảnh
                  </th>
                  <th className="px-8 py-5 text-right text-base font-medium text-gray-500 uppercase tracking-wider">
                    Đã trích xuất
                  </th>
                  <th className="px-8 py-5 text-right text-base font-medium text-gray-500 uppercase tracking-wider">
                    Chưa trích xuất
                  </th>
                  <th className="px-8 py-5 text-right text-base font-medium text-gray-500 uppercase tracking-wider">
                    Tiến độ
                  </th>
                  <th className="px-8 py-5 text-center text-base font-medium text-gray-500 uppercase tracking-wider">
                    Chiều vector
                  </th>
                  <th className="px-8 py-5 text-center text-base font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getCurrentPageProducts().map((product) => {
                  // Get vector dimension info for this product
                  const productDimensionInfo = vectorDimensions?.product_dimensions?.find(
                    p => p.productId === product.id
                  );
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-8 py-6 whitespace-nowrap">
                        {product.images && product.images.length > 0 && (
                          <div className="flex space-x-4">
                            {product.images.slice(0, 3).map((img, index) => (
                              <div key={index} className="relative w-24 h-24">
                                <img
                                  src={img.url || img.path}
                                  alt={`${product.productName || 'Product'} ${index + 1}`}
                                  className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/96?text=No+Image';
                                  }}
                                  title={img.url || img.path}
                                />
                                {index === 2 && product.images.length > 3 && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center text-white text-base">
                                    +{product.images.length - 3}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-lg font-medium text-gray-900">
                          {product.productName || 'Chưa có tên'}
                        </div>
                        {/* <div className="text-base text-gray-500">
                          ID: {product.id}
                        </div> */}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-lg text-gray-500 text-right">
                        {product.total_images}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-lg text-green-600 text-right">
                        {product.with_features}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-lg text-orange-600 text-right">
                        {product.without_features}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-lg text-blue-600 text-right">
                        {product.completion_percentage.toFixed(1)}%
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-center">
                        {productDimensionInfo ? (
                          <div className="space-y-1">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              productDimensionInfo.is_consistent 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {productDimensionInfo.dimensions.length > 0 
                                ? productDimensionInfo.dimensions.join(', ') + ' chiều'
                                : 'Chưa có'
                              }
                            </div>
                            {!productDimensionInfo.is_consistent && (
                              <div className="text-xs text-red-600">
                                Không nhất quán
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">Chưa có dữ liệu</div>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-lg text-center">
                        <div className="flex flex-col space-y-2">
                          {product.without_features > 0 && (
                            <button
                              onClick={() => handleUpdateProduct(product)}
                              disabled={loading}
                              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                              title="Cập nhật vector đặc trưng cho sản phẩm này"
                            >
                              Cập nhật sản phẩm
                            </button>
                          )}
                          
                          {/* Add button to show all images */}
                          <button
                            onClick={() => handleShowAllImages(product)}
                            disabled={loading}
                            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                            title="Xem tất cả ảnh của sản phẩm này"
                          >
                            Xem tất cả ảnh ({product.images.length})
                          </button>
                          
                          {/* Add individual image update buttons for first 3 images */}
                          <div className="flex flex-wrap gap-1">
                            {product.images.slice(0, 3).map((img, index) => (
                              <button
                                key={index}
                                onClick={() => handleUpdateSingleImage(img)}
                                disabled={loading}
                                className={`px-2 py-1 text-xs rounded transition-colors disabled:opacity-50 ${
                                  hasVectorFeatures(img.vectorFeatures)
                                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                                title={
                                  hasVectorFeatures(img.vectorFeatures)
                                    ? 'Ảnh đã có vector features'
                                    : 'Cập nhật vector đặc trưng cho ảnh này'
                                }
                              >
                                Ảnh {index + 1}
                              </button>
                            ))}
                            {product.images.length > 3 && (
                              <span className="px-2 py-1 text-xs text-gray-500">
                                +{product.images.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-8 flex items-center justify-between">
            <div className="text-lg text-gray-600">
              Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, products.products.length)} của {products.products.length} sản phẩm
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-lg border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &laquo;
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-lg border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &lsaquo;
              </button>
              
              {/* Page Numbers */}
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                // Hiển thị 5 trang gần nhất
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-4 py-2 text-lg border rounded-lg ${
                        currentPage === pageNumber
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  pageNumber === currentPage - 3 ||
                  pageNumber === currentPage + 3
                ) {
                  return <span key={pageNumber} className="px-2 text-lg">...</span>;
                }
                return null;
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-lg border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &rsaquo;
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-lg border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &raquo;
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center text-gray-500 text-lg">
            {loading ? (
              <p>Đang tải dữ liệu sản phẩm...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <p>Đang tải dữ liệu sản phẩm...</p>
            )}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <span className="text-xl text-gray-700">Đang xử lý...</span>
          </div>
        </div>
      )}

      {/* Add Tooltips */}
      <Tooltip id="process-new-tooltip" place="top" />
      <Tooltip id="re-extract-tooltip" place="top" />
      <Tooltip id="re-extract-direct-tooltip" place="top" />
      <Tooltip id="re-extract-config-tooltip" place="top" />
      <Tooltip id="fix-dimensions-tooltip" place="top" />

      {/* Image Modal */}
      {showImageModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Tất cả ảnh của sản phẩm: {selectedProduct.productName || 'Chưa có tên'}
              </h2>
              <button
                onClick={handleCloseImageModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedProduct.images.map((img, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="mb-3">
                    <img
                      src={img.url || img.path}
                      alt={`${selectedProduct.productName || 'Product'} ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      <strong>ID:</strong> {img.id}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Trạng thái:</strong> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs ${
                        hasVectorFeatures(img.vectorFeatures)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {hasVectorFeatures(img.vectorFeatures) ? 'Đã có vector' : 'Chưa có vector'}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleUpdateSingleImage(img)}
                      disabled={loading}
                      className={`w-full px-3 py-2 text-sm rounded transition-colors disabled:opacity-50 ${
                        hasVectorFeatures(img.vectorFeatures)
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      title={
                        hasVectorFeatures(img.vectorFeatures)
                          ? 'Ảnh đã có vector features'
                          : 'Cập nhật vector đặc trưng cho ảnh này'
                      }
                    >
                      {loading ? 'Đang xử lý...' : (hasVectorFeatures(img.vectorFeatures) ? 'Đã có vector' : 'Cập nhật vector')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseImageModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureExtraction;