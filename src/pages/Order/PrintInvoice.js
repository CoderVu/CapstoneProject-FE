import React, { useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { FaPrint, FaDownload } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

const PrintInvoice = ({ order, formatDate, formatPrice, getStatusInfo }) => {
  // Tạo ref để tham chiếu đến nội dung cần in
  const componentRef = useRef(null);
  const barcodeRef = useRef(null);

  // Tạo dữ liệu cho QR code
  const qrData = JSON.stringify({
    orderCode: order.orderCode,
    totalAmount: order.totalAmount,
    date: order.orderDate,
    status: order.status,
  });

  // Tạo barcode khi component được render
  useEffect(() => {
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, order.orderCode, {
          format: "CODE128",
          lineColor: "#000",
          width: 2,
          height: 40,
          displayValue: false
        });
      } catch (error) {
        console.error('Lỗi khi tạo barcode:', error);
      }
    }
  }, [order.orderCode]); // Chỉ chạy lại khi orderCode thay đổi


  // Hàm tạo PDF sử dụng cách tiếp cận mới để tránh lỗi hình ảnh
  const generatePDF = async () => {
    if (!componentRef.current) {
      console.error('Không tìm thấy nội dung để tạo PDF');
      return;
    }

    // Hiển thị thông báo đang tải
    alert('Đang tạo PDF, vui lòng đợi...');

    try {
      // Tạo một instance mới của jsPDF (A4: 210mm x 297mm)
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Lấy content để render
      const content = componentRef.current;

      // Clone nội dung để không ảnh hưởng đến DOM hiện tại
      const clone = content.cloneNode(true);
      // Thay thế tất cả thẻ img với thuộc tính crossorigin
      const images = clone.querySelectorAll('img');
      images.forEach(img => {
        img.setAttribute('crossOrigin', 'Anonymous');
      });

      // Thiết lập kiểu hiển thị để HTML2Canvas có thể render đúng
      clone.style.display = 'block';
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '-9999px';
      document.body.appendChild(clone);

      // Sử dụng html2canvas với cấu hình nâng cao để có kết quả tốt hơn
      const canvas = await html2canvas(clone, {
        scale: 2, // Tăng độ phân giải
        useCORS: true, // Cho phép tải hình ảnh từ domain khác
        allowTaint: true, // Cho phép sử dụng hình ảnh "tainted"
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 15000, // Tăng thời gian chờ tải hình ảnh
        onclone: (clonedDoc) => {
          // Có thể thực hiện thêm một số điều chỉnh trên bản sao trước khi render
          const clonedContent = clonedDoc.querySelector('[data-printable="true"]');
          if (clonedContent) {
            clonedContent.style.display = 'block';
          }
        }
      });

      // Xóa bỏ clone để không ảnh hưởng đến DOM
      document.body.removeChild(clone);

      // Chuyển đổi canvas sang dạng hình ảnh với chất lượng tốt hơn
      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      // Tính toán tỷ lệ để đảm bảo nội dung vừa với khổ giấy A4
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const imgWidth = pageWidth - 20; // Chừa lề 10mm mỗi bên
      const imgHeight = imgWidth / ratio;

      // Nếu nội dung rất dài, chia thành nhiều trang
      const pagesCount = Math.ceil(imgHeight / (pageHeight - 20));

      // Nếu chỉ có một trang
      if (pagesCount <= 1) {
        pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
      } else {
        // Nếu có nhiều trang
        let heightLeft = imgHeight;
        let position = 0;

        for (let i = 0; i < pagesCount; i++) {
          // Thêm trang mới nếu không phải trang đầu
          if (i > 0) {
            pdf.addPage();
          }

          // Tính toán vị trí để cắt hình ảnh
          position = -i * (pageHeight - 20);

          // Thêm hình ảnh vào PDF với vị trí phù hợp
          pdf.addImage(imgData, 'JPEG', 10, position + 10, imgWidth, imgHeight);

          heightLeft -= (pageHeight - 20);
        }
      }

      // Tải xuống PDF với tên file rõ ràng bao gồm mã đơn hàng
      pdf.save(`Hoa-don-${order.orderCode}-${new Date().toISOString().slice(0, 10)}.pdf`);

      console.log('Tạo PDF thành công!');
      alert('Tạo PDF thành công!');
    } catch (error) {
      console.error('Lỗi khi tạo PDF:', error);

      // Thử phương pháp thay thế nếu phương pháp chính thất bại
      try {
        alert('Đang thử phương pháp thay thế...');
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Tạo bảng thủ công
        pdf.setFontSize(18);
        pdf.text(`Hóa đơn #${order.orderCode}`, 105, 15, { align: 'center' });

        pdf.setFontSize(12);
        pdf.text(`Ngày đặt hàng: ${formatDate(order.orderDate)}`, 20, 30);
        pdf.text(`Trạng thái: ${getStatusInfo(order.status).text}`, 20, 40);
        pdf.text(`Địa chỉ giao hàng: ${order.deliveryAddress}`, 20, 50);
        pdf.text(`Số điện thoại: ${order.deliveryPhone}`, 20, 60);

        // Tạo bảng sản phẩm
        const tableColumn = ["STT", "Sản phẩm", "Size", "Màu", "Số lượng", "Đơn giá", "Thành tiền"];
        const tableRows = [];

        order.orderDetails.forEach((product, index) => {
          const productData = [
            index + 1,
            product.productName,
            product.size || 'N/A',
            product.color || 'N/A',
            product.quantity,
            formatPrice(product.totalPrice / product.quantity).replace(' VNĐ', ''),
            formatPrice(product.totalPrice).replace(' VNĐ', '')
          ];
          tableRows.push(productData);
        });

        pdf.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 70,
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 3 },
          columnStyles: { 0: { cellWidth: 10 } }
        });

        const finalY = pdf.lastAutoTable.finalY || 120;

        // Tổng tiền
        pdf.text(`Tổng thanh toán: ${formatPrice(order.totalAmount)}`, 150, finalY + 20, { align: 'right' });

        // Cảm ơn
        pdf.text('Cảm ơn quý khách đã mua hàng tại cửa hàng chúng tôi!', 105, finalY + 40, { align: 'center' });
        pdf.text('Đây là hóa đơn điện tử, đã được xác thực.', 105, finalY + 45, { align: 'center' });

        pdf.save(`Hoa-don-${order.orderCode}-${new Date().toISOString().slice(0, 10)}.pdf`);

        console.log('Tạo PDF thành công bằng phương pháp thay thế!');
        alert('Tạo PDF thành công!');
      } catch (fallbackError) {
        console.error('Lỗi khi sử dụng phương pháp thay thế:', fallbackError);
        alert('Đã xảy ra lỗi khi tạo PDF. Vui lòng thử lại sau.');
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={generatePDF}
        className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition-colors"
      >
        <FaDownload className="text-sm" />
        Xuất hóa đơn PDF
      </button>

      {/* Nội dung hóa đơn để in - Đảm bảo rằng nó luôn được render */}
      <div style={{ display: 'none' }}>
        <div ref={componentRef} data-printable="true" className="p-8 bg-white max-w-[210mm] mx-auto font-sans">
          {/* Header section with logo and invoice info */}
          <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-6">
            <div className="flex flex-col">
              <img
                src="https://logoipsum.com/logoipsum.png"
                alt="Logo"
                crossOrigin="anonymous"
                className="h-14"
              />
              <p className="mt-2 text-sm text-gray-600">Website thương mại điện tử</p>
              <p className="text-sm text-gray-600">www.yourdomain.com</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wider">HÓA ĐƠN</h2>
              <p className="text-gray-600 font-medium">#{order.orderCode}</p>
              <p className="text-gray-600">Ngày: {formatDate(order.orderDate)}</p>
              <div className="mt-2 inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {getStatusInfo(order.status).text}
              </div>
            </div>
          </div>

          {/* Barcode section */}
          <div className="mb-6 text-center">
            <svg className="mx-auto" ref={barcodeRef}></svg>
            <p className="text-xs text-gray-500 mt-1">#{order.orderCode}</p>
          </div>

          {/* Customer and order information */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-gray-700 font-semibold mb-3 border-b border-gray-200 pb-2">Thông tin khách hàng</h3>
              <p className="text-gray-800 font-medium mb-1">{order.deliveryName || 'Khách hàng'}</p>
              <p className="text-gray-800 mb-1">{order.deliveryAddress}</p>
              <p className="text-gray-800 mb-1">Điện thoại: {order.deliveryPhone}</p>
              <p className="text-gray-800 mb-1">Email: {order.email || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-gray-700 font-semibold mb-3 border-b border-gray-200 pb-2">Thông tin đơn hàng</h3>
              <p className="text-gray-800 mb-1">Mã đơn hàng: <span className="font-medium">#{order.orderCode}</span></p>
              <p className="text-gray-800 mb-1">Ngày đặt: <span className="font-medium">{formatDate(order.orderDate)}</span></p>
              <p className="text-gray-800 mb-1">Phương thức thanh toán: <span className="font-medium">{order.paymentMethod || "Thanh toán khi nhận hàng"}</span></p>
              <p className="text-gray-800 mb-1">Ghi chú: <span className="italic">{order.note || "Không có"}</span></p>
            </div>
          </div>

          {/* Products table */}
          <div className="mb-8 overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">STT</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Sản phẩm</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Thông tin</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Số lượng</th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Đơn giá</th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.orderDetails.map((product, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">{product.productName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {product.size && <span className="inline-block mr-2">Size: {product.size}</span>}
                      {product.color && <span className="inline-block">Màu: {product.color}</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-800">{product.quantity}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-800">
                      {formatPrice(product.totalPrice / product.quantity)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-800 font-medium">
                      {formatPrice(product.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary of costs */}
          <div className="flex justify-between mb-8">
            <div className="w-1/3 flex flex-col items-center justify-center">
              <QRCodeSVG
                value={qrData}
                size={120}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"H"}
                includeMargin={true}
              />
              <p className="text-xs text-gray-500 mt-2 text-center">Quét để xem chi tiết đơn hàng</p>
            </div>
            <div className="w-1/2 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Tổng tiền sản phẩm:</span>
                <span className="text-gray-800 font-medium">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="text-gray-800 font-medium">{formatPrice(0)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Giảm giá:</span>
                  <span className="text-gray-800 font-medium">- {formatPrice(order.discount || 0)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 font-bold text-base">
                <span className="text-gray-800">Tổng thanh toán:</span>
                <span className="text-blue-600">{formatPrice(order.totalAmount - (order.discount || 0))}</span>
              </div>
            </div>
          </div>

          {/* Terms and thank you note */}
          <div className="border-t border-gray-200 pt-6 mt-8">
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="text-blue-700 font-medium mb-2">Điều khoản & Điều kiện</h4>
              <p className="text-sm text-gray-600 mb-1">- Sản phẩm đã mua không được đổi trả sau 7 ngày kể từ ngày nhận hàng.</p>
              <p className="text-sm text-gray-600 mb-1">- Sản phẩm đổi trả phải còn nguyên tem mác, chưa qua sử dụng.</p>
              <p className="text-sm text-gray-600">- Quý khách vui lòng giữ hóa đơn này để đối chiếu khi cần thiết.</p>
            </div>

            <div className="text-center mb-4">
              <p className="text-gray-700 font-medium mb-2">Cảm ơn quý khách đã mua hàng tại cửa hàng chúng tôi!</p>
              <p className="text-sm text-gray-600">Đây là hóa đơn điện tử, đã được xác thực.</p>
            </div>

            <div className="flex justify-between text-sm text-gray-500 mt-8">
              <div>
                <p>Hotline: 1900 1234</p>
                <p>Email: support@yourdomain.com</p>
              </div>
              <div className="text-right">
                <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</p>
                <p>Website: www.yourdomain.com</p>
              </div>
            </div>
          </div>

          {/* Footer with page number */}
          <div className="text-center text-xs text-gray-400 mt-8">
            <p>Trang 1/1</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintInvoice;
