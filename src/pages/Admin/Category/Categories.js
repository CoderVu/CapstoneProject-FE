import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCategories } from "../../../redux/actions/categoryAction";
import { updateCategory, addCategory, deleteCategory } from "../../../redux/service/categoryService";

const Categories = () => {
    const dispatch = useDispatch();
    const categories = useSelector((state) => state.category.categories);
    const [newCategory, setNewCategory] = useState("");
    const [editCategory, setEditCategory] = useState({ id: null, name: "" });

    useEffect(() => {
        dispatch(getCategories());
    }, [dispatch]);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await addCategory({ name: newCategory });
            setNewCategory("");
            dispatch(getCategories());
        } catch (error) {
            console.error("Failed to add category:", error);
        }
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        try {
            await updateCategory(editCategory.id, { name: editCategory.name });
            setEditCategory({ id: null, name: "" });
            dispatch(getCategories());
        } catch (error) {
            console.error("Failed to update category:", error);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        try {
            await deleteCategory(categoryId);
            dispatch(getCategories());
        } catch (error) {
            console.error("Failed to delete category:", error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Categories</h1>
            <form onSubmit={handleAddCategory} className="mb-4 flex items-center">
                <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New Category"
                    className="p-2 border rounded mr-2"
                />
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                    Add
                </button>
            </form>
            <table className="min-w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-4 py-2">Category Name</th>
                        <th className="border px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category) => (
                        <tr key={category.id} className="border">
                            <td className="border px-4 py-2">
                                {editCategory.id === category.id ? (
                                    <form onSubmit={handleUpdateCategory} className="flex items-center">
                                        <input
                                            type="text"
                                            value={editCategory.name}
                                            onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                                            className="p-2 border rounded mr-2"
                                        />
                                        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
                                            Update
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditCategory({ id: null, name: "" })}
                                            className="px-4 py-2 bg-gray-500 text-white rounded ml-2"
                                        >
                                            Cancel
                                        </button>
                                    </form>
                                ) : (
                                    <span>{category.name}</span>
                                )}
                            </td>
                            <td className="border px-4 py-2 text-center">
                                {editCategory.id !== category.id && (
                                    <>
                                        <button
                                            onClick={() => setEditCategory({ id: category.id, name: category.name })}
                                            className="px-4 py-2 bg-yellow-500 text-white rounded mr-2"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(category.id)}
                                            className="px-4 py-2 bg-red-500 text-white rounded"
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Categories;