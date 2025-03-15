import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProductDetail } from "../../../redux/actions/productActions";
import { useParams } from "react-router-dom";
import ModalUpdateProduct from "./ModalEditProduct";
import ModalAddVariant from "./ModalAddVariant";
import ModalEditVariant from "./ModalEditVariant";
import ModalEditProductDesciption from "./ModalEditProductDesciption";
import ModalAddProductDescription from "./ModalAddProductDescription";
import ModalAddCareInstruction from "./ModalAddCareInstruction";
import ModalEditProductCareInstruction from "./ModalEditProductCareInstruction";
import { deleteVariantProduct } from "../../../redux/service/productService";

const ProductDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const product = useSelector((state) => state.productDetail.productDetail);
    const productDescription = useSelector((state) => state.productDescription.productDescription);
    const productCareInstructions = useSelector((state) => state.productCareInstructions.productCareInstructions);
    const [variantList, setVariantList] = useState(product.variants);
    const [modalState, setModalState] = useState({
        editProduct: false,
        addVariant: false,
        editVariant: false,
        editDescription: false,
        addDescription: false,
        addCareInstruction: false,
        editCareInstruction: false,
    });
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [careInstructionError, setCareInstructionError] = useState(false);
    const [productDescriptionError, setProductDescriptionError] = useState(false);

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                dispatch(getProductDetail(id));
                setCareInstructionError(false);
                setProductDescriptionError(false);
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setCareInstructionError(true);
                    setProductDescriptionError(true);
                }
            }
        };

        fetchProductDetail();
    }, [dispatch, id]);

    if (!product) return <div>Loading...</div>;

    const handleEditVariant = (variant) => {
        setSelectedVariant(variant);
        setModalState((prev) => ({ ...prev, editVariant: true }));
    };

    const handleDeleteVariant = async (variantId) => {
        try {
            await deleteVariantProduct(variantId);
            setVariantList((prev) => prev.filter((variant) => variant.id !== variantId));
            dispatch(getProductDetail(id));
        } catch (error) {
            console.error("Failed to delete variant:", error);
        }
    };

    const handleCloseModal = (modalName) => {
        setModalState((prev) => ({ ...prev, [modalName]: false }));
        dispatch(getProductDetail(id));
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{product.productName}</h1>
            <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                    {[
                        { label: "Description", value: product.description },
                        { label: "Price", value: product.price },
                        { label: "Discount Price", value: product.discountPrice },
                        { label: "Category", value: product.categoryName },
                        { label: "Brand", value: product.brandName },
                        { label: "On Sale", value: product.onSale ? "Yes" : "No" },
                        { label: "Best Seller", value: product.bestSeller ? "Yes" : "No" },
                        { label: "Gender", value: product.gender },
                        { label: "New Product", value: product.newProduct ? "Yes" : "No" },
                    ].map(({ label, value }) => (
                        <tr key={label}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{label}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Biến thể sản phẩm */}
            <table className="min-w-full border border-gray-300 mt-4">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-4 py-2">Màu sắc</th>
                        <th className="border px-4 py-2">Kích thước</th>
                        <th className="border px-4 py-2">Số lượng</th>
                        <th className="border px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(
                        product.variants.reduce((acc, variant) => {
                            if (!acc[variant.color]) acc[variant.color] = [];
                            acc[variant.color].push(variant);
                            return acc;
                        }, {})
                    ).map(([color, sizes]) => (
                        <React.Fragment key={color}>
                            {sizes.map((size, index) => (
                                <tr key={size.sizeName + color} className="border">
                                    {index === 0 && (
                                        <td rowSpan={sizes.length} className="border px-4 py-2 text-center font-semibold">
                                            {color}
                                        </td>
                                    )}
                                    <td className="border px-4 py-2 text-center">{size.sizeName}</td>
                                    <td className="border px-4 py-2 text-center">{size.quantity}</td>
                                    <td className="border px-4 py-2 text-center">
                                        <button
                                            onClick={() => handleEditVariant(size)}
                                            className="px-4 py-2 bg-yellow-500 text-white rounded mr-2"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteVariant(size.id)}
                                            className="px-4 py-2 bg-red-500 text-white rounded"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            {/* Hình ảnh sản phẩm */}
            <div className="flex flex-wrap gap-4 mt-4">
                {product.images.map((image) => (
                    <div key={image.id} className="relative">
                        <img src={image.path} alt="Product" className="w-20 h-20 object-cover rounded" />
                        {image.color && (
                            <span className="absolute bottom-0 left-0 bg-white p-1 rounded text-xs">
                                {image.color}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Các nút hành động */}
            <table className="min-w-full border border-gray-300 mt-4">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-4 py-2">Action</th>
                        <th className="border px-4 py-2">Chức năng</th>
                    </tr>
                </thead>
                <tbody>
                    {[
                        { label: "Edit", state: "editProduct", description: "Cập nhật sản phẩm", color: "yellow" },
                        { label: "Add", state: "addVariant", description: "Thêm Size, Kích Thước, Số Lượng", color: "green" },
                        { label: "Add", state: "addDescription", description: "Thêm mô tả", color: "green" },
                        { label: "Edit", state: "editDescription", description: "Cập nhật mô tả", color: "yellow" },
                        { label: "Add", state: "addCareInstruction", description: "Thêm hướng dẫn chăm sóc", color: "green" },
                        { label: "Edit", state: "editCareInstruction", description: "Cập nhật hướng dẫn chăm sóc", color: "yellow" },
                    ].map(({ label, state, description, color }) => (
                        <tr key={state}>
                            <td className="border px-4 py-2 text-center">
                                <button
                                    onClick={() => setModalState((prev) => ({ ...prev, [state]: true }))}
                                    className={`px-4 py-2 bg-${color}-500 text-white rounded`}
                                >
                                    {label}
                                </button>
                            </td>
                            <td className="border px-4 py-2">{description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Care Instructions Error */}
            {careInstructionError && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                    Care instructions not found for this product.
                </div>
            )}

            {/* Product Description Error */}
            {productDescriptionError && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                    Product description not found for this product.
                </div>
            )}

            {/* Các Modal */}
            <ModalUpdateProduct isOpen={modalState.editProduct} onRequestClose={() => handleCloseModal("editProduct")} product={product} />
            <ModalAddVariant isOpen={modalState.addVariant} onRequestClose={() => handleCloseModal("addVariant")} productId={product.id} />
            <ModalEditVariant isOpen={modalState.editVariant} onRequestClose={() => handleCloseModal("editVariant")} productId={product.id} variant={selectedVariant} onSubmit={(updatedVariant) => {
                const updatedVariants = product.variants.map((v) => (v.id === updatedVariant.id ? updatedVariant : v));
                setVariantList(updatedVariants);
            }} />
            <ModalEditProductDesciption isOpen={modalState.editDescription} onRequestClose={() => handleCloseModal("editDescription")} productId={product.id} productDescription={productDescription} />
            <ModalAddProductDescription isOpen={modalState.addDescription} onRequestClose={() => handleCloseModal("addDescription")} product={product} />
            <ModalAddCareInstruction isOpen={modalState.addCareInstruction} onRequestClose={() => handleCloseModal("addCareInstruction")} product={product} />
            <ModalEditProductCareInstruction isOpen={modalState.editCareInstruction} onRequestClose={() => handleCloseModal("editCareInstruction")} productId={product.id} productCareInstructions={productCareInstructions} />
        </div>
    );
};

export default ProductDetail;