import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTable } from "react-table";
import { getProducts } from "../../../redux/actions/productActions";
import ModalUpdateProduct from "./ModalEditProduct";
import ModalAddVariant from "./ModalAddVariant";
import ModalEditProductDesciption from "./ModalEditProductDesciption";
import ModalAddProductDescription from "./ModalAddProductDescription";
import ModalAddCareInstruction from "./ModalAddCareInstruction";
import ModalEditProductCareInstruction from "./ModalEditProductCareInstruction";

const ProductTable = () => {
    const dispatch = useDispatch();
    const { products, loading, error } = useSelector((state) => state.product);
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCareInstructionModalOpen, setIsCareInstructionModalOpen] = useState(false);
    const [isEditCareInstructionModalOpen, setIsEditCareInstructionModalOpen] = useState(false);
    const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);


    useEffect(() => {
        dispatch(getProducts(0, 10));
    }, [dispatch]);

    const columns = useMemo(
        () => [
            {
                Header: "Product Name",
                accessor: "productName",
            },
            {
                Header: "Description",
                accessor: "description",
                Cell: ({ value }) => (
                    <div className="truncate w-full" title={value}>
                        {value}
                    </div>
                ),
            },
            {
                Header: "Price",
                accessor: "price",
            },
            {
                Header: "Discount Price",
                accessor: "discountPrice",
            },
            {
                Header: "On Sale",
                accessor: "onSale",
                Cell: ({ value }) => (value ? "Yes" : "No"),
            },
            {
                Header: "Category",
                accessor: "categoryName",
            },
            {
                Header: "Brand",
                accessor: "brandName",
            },
            {
                Header: "Main Image",
                accessor: "mainImage.path",
                Cell: ({ value }) => (
                    <img
                        src={value}
                        alt="Main"
                        className="w-12 h-12 object-cover rounded-md"
                    />
                ),
            },
            {
                Header: "Action",
                accessor: "id",
                Cell: ({ row }) => (
                    <div className="flex space-x-2">
                    <button
                        onClick={() => {    
                            setIsEditProductModalOpen(true);
                            setSelectedProduct(row.original);
                        }}
                        className="bg-blue-500 text-white px-4 py-1 rounded-md"
                    >
                        Edit
                    </button>
                        <button
                            onClick={() => {
                                setIsVariantModalOpen(true);
                                setSelectedProduct(row.original);
                            }}
                            className="bg-blue-500 text-white px-4 py-1 rounded-md"
                        >
                            Add Variant
                        </button>
                        <button
                            onClick={() => {
                                setIsUpdateModalOpen(true);
                                setSelectedProduct(row.original);
                            }}
                            className="bg-yellow-500 text-white px-4 py-1 rounded-md"
                        >
                            Update Description
                        </button>
                        <button
                            onClick={() => {
                                setIsAddModalOpen(true);
                                setSelectedProduct(row.original);
                            }}
                            className="bg-green-500 text-white px-4 py-1 rounded-md"
                        >
                            Add Description
                        </button>
                        <button
                            onClick={() => {
                                setIsCareInstructionModalOpen(true);
                                setSelectedProduct(row.original);
                            }}
                            className="bg-red-500 text-white px-4 py-1 rounded-md"  
                        >
                            Add Care Instruction
                        </button>

                        <button
                            onClick={() => {
                                setIsEditCareInstructionModalOpen(true);
                                setSelectedProduct(row.original);
                            }}
                            className="bg-red-500 text-white px-4 py-1 rounded-md"
                        >
                            Edit Care Instruction
                        </button>

                    </div>
                ),
            },
        ],
        []
    );

    const data = useMemo(() => products, [products]);
    console.log("Products id selected", selectedProduct?.id);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data });

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="ml-0 p-6">
            <div className="shadow overflow-x-auto border-b border-gray-200 sm:rounded-lg">
                <table
                    {...getTableProps()}
                    className="min-w-full divide-y divide-gray-200 table-fixed"
                >
                    <thead className="bg-gray-50">
                        {headerGroups.map((headerGroup) => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map((column) => (
                                    <th
                                        {...column.getHeaderProps()}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px] truncate"
                                    >
                                        {column.render("Header")}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody
                        {...getTableBodyProps()}
                        className="bg-white divide-y divide-gray-200"
                    >
                        {rows.map((row) => {
                            prepareRow(row);
                            return (
                                <tr {...row.getRowProps()}>
                                    {row.cells.map((cell) => (
                                        <td
                                            {...cell.getCellProps()}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-[150px] overflow-hidden text-ellipsis"
                                            title={cell.value}
                                        >
                                            {cell.render("Cell")}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {/* Modal Edit Product */}
            <ModalUpdateProduct

                isOpen={isEditProductModalOpen}
                onRequestClose={() => setIsEditProductModalOpen(false)}
                product={selectedProduct}
            />

            {/* Modal Add Variant */}
            <ModalAddVariant
                isOpen={isVariantModalOpen}
                onRequestClose={() => setIsVariantModalOpen(false)}
                productId={selectedProduct?.id}
            />

            {/* Modal Edit Product Description */}
            <ModalEditProductDesciption
                isOpen={isUpdateModalOpen}
                onRequestClose={() => setIsUpdateModalOpen(false)}
                product={selectedProduct}
            />

            {/* Modal Add Product Description */}
            <ModalAddProductDescription
                isOpen={isAddModalOpen}
                onRequestClose={() => setIsAddModalOpen(false)}
                product={selectedProduct}
            />
            
            {/* Modal Add Care Instruction */}
            <ModalAddCareInstruction
                isOpen={isCareInstructionModalOpen}
                onRequestClose={() => setIsCareInstructionModalOpen(false)}
                product={selectedProduct}
            />
            
            {/* Modal Edit Care Instruction */}
            <ModalEditProductCareInstruction
                isOpen={isEditCareInstructionModalOpen}
                onRequestClose={() => setIsEditCareInstructionModalOpen(false)}
                product={selectedProduct}
            />
        </div>
    );
};

export default ProductTable;
