import React, { useState } from "react";
import Product from "../../home/Products/Product";
import { showErrorToast } from "../../Toast/ToastNotification";

// Minh họa cho survey - bạn đổi URL hoặc ảnh cục bộ theo ý thích
const surveyVisuals = {
    purpose: [
        { label: "Đi làm", img: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=600&q=80" },
        { label: "Dự tiệc", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80" },
        { label: "Hẹn hò", img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600&q=80" },
        { label: "Tập gym", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80" },
        { label: "Đi học", img: "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=600&q=80" },
        { label: "Đi biển", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80" },
        { label: "Dạo phố", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80" },
    ],
    personality: [
        { label: "Thanh lịch", img: "https://images.pexels.com/photos/1707828/pexels-photo-1707828.jpeg?auto=compress&w=400&q=80" },
        { label: "Năng động", img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80" },
        { label: "Trầm tính", img: "https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&w=400&q=80" },
        { label: "Cá tính", img: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&w=400&q=80" },
        { label: "Phóng khoáng", img: "https://images.unsplash.com/photo-1469398715555-76331a13b0b6?w=600&q=80" },
    ],
    trend: [
        { label: "Minimalism", img: "https://images.unsplash.com/photo-1425421669292-0c3da3b8f529?w=600&q=80" },
        { label: "Vintage", img: "https://th.bing.com/th?id=OIF.0fCES94V4FB4k2%2bA0Wm5Hw&w=159&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7" },
        { label: "Streetwear", img: "https://images.pexels.com/photos/12290149/pexels-photo-12290149.jpeg?auto=compress&w=400&q=80" },
        { label: "Y2K", img: "https://images.pexels.com/photos/14884681/pexels-photo-14884681.jpeg?auto=compress&w=400&q=80" },
        { label: "Sporty", img: "https://images.pexels.com/photos/3768912/pexels-photo-3768912.jpeg?auto=compress&w=400&q=80" },
        { label: "Smart-casual", img: "https://images.pexels.com/photos/2179205/pexels-photo-2179205.jpeg?auto=compress&w=400&q=80" },
    ]
};
const colors = ["Red", "Blue", "Black", "White", "Gray", "Pink", "Yellow", "Green"];
const colorVisuals = {
    Red: "#ef4444", Blue: "#3b82f6", Black: "#222", White: "#f9fafb",
    Gray: "#9ca3af", Pink: "#ec4899", Yellow: "#fde047", Green: "#22c55e"
};
const sizes = ["XS", "S", "M", "L", "XL", "XXL", "14", "42", "45", "52"];

const defaultForm = {
    purpose: "",
    personality: "",
    trend: "",
    color: "",
    size: "",
    price: "",
};

function SurveyAIRecommend() {
    const [form, setForm] = useState(defaultForm);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState("");

    // Helper chọn
    const setSelected = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setProducts([]);
        setError("");
        try {
            const response = await fetch("http://127.0.0.1:5000/api/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    price: form.price ? parseInt(form.price) : undefined,
                }),
            });
            if (!response.ok) throw new Error("Lỗi server!");
            const data = await response.json();
            if (!data.recommendations || data.recommendations.length === 0) {
                setProducts([]);
                setError("Không tìm thấy sản phẩm phù hợp.");
            } else {
                setProducts(
                    data.recommendations.map((r) =>
                        r.product
                            ? { ...r.product, recommend_score: r.score, main_image: r.main_image }
                            : r
                    )
                );
            }
        } catch (err) {
            setError("Không thể kết nối AI. Thử lại sau.");
            showErrorToast && showErrorToast("Lỗi kết nối AI!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 mt-8 border-blue-100 border">
            <h2 className="text-2xl font-extrabold mb-5 text-blue-800 text-center tracking-wide">🧑‍💼 AI Stylist - Khảo sát thời trang</h2>
            <form className="grid grid-cols-1 gap-6 mb-3" onSubmit={handleSubmit}>
                {/* --- MỤC ĐÍCH --- */}
                <div>
                    <div className="mb-2 font-medium text-blue-700">1. Bạn muốn mặc để...</div>
                    <div className="flex flex-wrap gap-3 items-center justify-center">
                        {surveyVisuals.purpose.map((opt) => (
                            <button
                                type="button"
                                key={opt.label}
                                onClick={() => setSelected("purpose", opt.label)}
                                className={`focus:outline-none flex flex-col items-center p-2 rounded-xl shadow-sm border transition-all
                  ${form.purpose === opt.label ? "ring-2 ring-blue-400 bg-blue-50 shadow-lg scale-105" : "border-gray-200 bg-gray-50 hover:shadow-md"}
                  hover:scale-105`}
                                aria-pressed={form.purpose === opt.label}
                            >
                                <img src={opt.img} className="w-12 h-12 mb-1" alt={opt.label} loading="lazy" />
                                <span className="text-[0.97rem] font-medium">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- TÍNH CÁCH --- */}
                <div>
                    <div className="mb-2 font-medium text-purple-700">2. Bạn thấy mình thuộc kiểu...</div>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {surveyVisuals.personality.map((opt) => (
                            <button
                                type="button"
                                key={opt.label}
                                onClick={() => setSelected("personality", opt.label)}
                                className={`focus:outline-none flex flex-col items-center p-2 rounded-xl shadow-sm border transition-all
                  ${form.personality === opt.label ? "ring-2 ring-purple-400 bg-purple-50 shadow-lg scale-105" : "border-gray-200 bg-gray-50 hover:shadow-md"}
                  hover:scale-105`}
                                aria-pressed={form.personality === opt.label}
                            >
                                <img src={opt.img} className="w-11 h-11 mb-1" alt={opt.label} loading="lazy" />
                                <span className="text-[0.96rem] font-medium">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- XU HƯỚNG --- */}
                <div>
                    <div className="mb-2 font-medium text-pink-700">3. Xu hướng phong cách bạn chọn:</div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {surveyVisuals.trend.map((opt) => (
                            <button
                                type="button"
                                key={opt.label}
                                onClick={() => setSelected("trend", opt.label)}
                                className={`focus:outline-none flex flex-col items-center p-2 rounded-xl shadow-sm border transition-all
                  ${form.trend === opt.label ? "ring-2 ring-pink-400 bg-pink-50 shadow-lg scale-105" : "border-gray-200 bg-gray-50 hover:shadow-md"}
                  hover:scale-105`}
                                aria-pressed={form.trend === opt.label}
                            >
                                <img src={opt.img} className="w-11 h-11 mb-1" alt={opt.label} loading="lazy" />
                                <span className="text-[0.97rem] font-medium">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- MÀU SẮC --- */}
                <div>
                    <div className="mb-2 font-medium">4. Màu sắc bạn muốn?</div>
                    <div className="flex gap-2 flex-wrap justify-center">
                        {colors.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setSelected("color", color)}
                                style={{ backgroundColor: colorVisuals[color], borderColor: '#ccc' }}
                                className={`w-8 h-8 rounded-full border-4 transition-all shadow-sm 
                  ${form.color === color ? "ring-2 ring-blue-500 scale-110 border-blue-400" : "hover:ring-2 hover:ring-blue-200"}`}
                                title={color}
                                aria-pressed={form.color === color}
                            />
                        ))}
                    </div>
                </div>

                {/* --- SIZE & PRICE --- */}
                <div className="flex gap-5 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Size</label>
                        <select
                            name="size"
                            className="w-full border rounded px-3 py-2"
                            value={form.size}
                            onChange={handleChange}
                        >
                            <option value="">Size?</option>
                            {sizes.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Giá mong muốn (VNĐ)</label>
                        <input
                            name="price"
                            type="number"
                            min={0}
                            className="w-full border rounded px-3 py-2"
                            value={form.price}
                            onChange={handleChange}
                            placeholder="Vd: 500000"
                        />
                    </div>
                </div>
                {/* --- SUBMIT BUTTON --- */}
                <button
                    type="submit"
                    className={`w-full mt-3 py-2 rounded bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold shadow-lg hover:scale-[1.03] transition-all ${loading && "opacity-60 cursor-wait"
                        }`}
                    disabled={loading || !form.purpose || !form.personality || !form.trend}
                >
                    {loading ? (
                        <div className="flex justify-center items-center">
                            <span className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-6 w-6 mr-2 animate-spin"></span>
                            Đang đề xuất...
                        </div>
                    ) : (
                        <>Nhận gợi ý từ AI</>
                    )}
                </button>
            </form>

            {/* Show error */}
            {error && <div className="text-red-600 mt-6 text-center">{error}</div>}

            {/* Show products */}
            {products.length > 0 && (
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {products.map((prod) => (
                        <Product
                            key={prod.id}
                            {...prod}
                            img={prod.mainImage ? prod.mainImage.path : (prod.images && prod.images[0] && prod.images[0].path)}
                            productName={prod.productName}
                            price={prod.price}
                            discountPrice={prod.discountPrice}
                            totalSold={prod.quantity}
                            colors={prod.images ? prod.images.map(im => im.color) : []}
                            rating={prod.rate ? prod.rate.rating : 0}
                            totalRate={prod.rate ? prod.rate.totalRate : 0}
                        />
                    ))}
                </div>
            )}

            {/* Animated CSS loader */}
            <style>{`
        .loader {
          border-top-color: #6366f1;
          border-radius: 100%;
        }
      `}</style>
        </div>
    );
}

export default SurveyAIRecommend;