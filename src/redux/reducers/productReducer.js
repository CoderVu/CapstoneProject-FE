import types from "../types";

const initialState = {
  products: [],
  allProducts: [], // Store all products
  filteredProducts: [], // Store filtered products
  productsOnSale: [],
  totalPages: 0,
  totalElements: 0,
  loading: false,
  error: null,
};

const productReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_PRODUCT_REQUEST:
    case types.FETCH_ALL_PRODUCTS_REQUEST:
    case types.FILTER_PRODUCTS_REQUEST:
    case types.FETCH_PRODUCT_ON_SALE_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_ALL_PRODUCTS_SUCCESS:
      const allProducts = Array.isArray(action.payload.allProducts) ? action.payload.allProducts : [];
      return {
        ...state,
        loading: false,
        allProducts,
        filteredProducts: allProducts,
        products: allProducts,
        totalElements: allProducts.length,
        totalPages: Math.ceil(allProducts.length / 12), // Assuming default page size is 12
      };

    case types.FILTER_PRODUCTS_LOCAL:
      const filters = action.payload;
      let filtered = Array.isArray(state.allProducts) ? [...state.allProducts] : [];

      if (filtered.length > 0) {
        // Apply filters only if we have products
        if (filters.gender && filters.gender !== "") {
          filtered = filtered.filter(product => product.gender === filters.gender);
        }

        if (filters.categoryProduct && filters.categoryProduct !== "") {
          filtered = filtered.filter(product => product.categoryName === filters.categoryProduct);
        }

        if (filters.brandProduct && filters.brandProduct !== "") {
          filtered = filtered.filter(product => product.brandName === filters.brandProduct);
        }

        if (filters.colorProduct && filters.colorProduct !== "") {
          filtered = filtered.filter(product => {
            // Check mainImage color
            if (product.mainImage && product.mainImage.color === filters.colorProduct) {
              return true;
            }
            // Check variants colors
            return product.variants && Array.isArray(product.variants) &&
              product.variants.some(variant => variant.color === filters.colorProduct);
          });
        }

        if (filters.priceMin && !isNaN(parseFloat(filters.priceMin))) {
          const minPrice = parseFloat(filters.priceMin);
          filtered = filtered.filter(product => {
            const price = product.discountPrice || product.price;
            return price >= minPrice;
          });
        }

        if (filters.priceMax && !isNaN(parseFloat(filters.priceMax))) {
          const maxPrice = parseFloat(filters.priceMax);
          filtered = filtered.filter(product => {
            const price = product.discountPrice || product.price;
            return price <= maxPrice;
          });
        }

        if (filters.sizeProduct && filters.sizeProduct !== "") {
          filtered = filtered.filter(product => 
            product.variants && Array.isArray(product.variants) &&
            product.variants.some(variant => variant.sizeName === filters.sizeProduct)
          );
        }
      }

      return {
        ...state,
        filteredProducts: filtered,
        products: filtered,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / 12), // Assuming default page size is 12
      };

    case types.FETCH_PRODUCT_SUCCESS:
    case types.FILTER_PRODUCTS_SUCCESS:
      return {
        ...state,
        loading: false,
        products: Array.isArray(action.payload.products) ? action.payload.products : [],
        totalPages: action.payload.totalPages || 0,
        totalElements: action.payload.totalElements || 0,
      };

    case types.FETCH_PRODUCT_ON_SALE_SUCCESS:
      return {
        ...state,
        loading: false,
        productsOnSale: Array.isArray(action.payload) ? action.payload : [],
      };

    case types.FETCH_PRODUCT_ERROR:
    case types.FETCH_ALL_PRODUCTS_ERROR:
    case types.FILTER_PRODUCTS_ERROR:
    case types.FETCH_PRODUCT_ON_SALE_ERROR:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default productReducer;