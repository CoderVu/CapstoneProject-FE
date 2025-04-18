import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// Custom CSS for all toasts
const toastStyles = `
  .elegant-toast {
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(10px) !important;
    border-radius: 20px !important;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 5px 10px -5px rgba(0, 0, 0, 0.04) !important;
    overflow: hidden !important;
    padding: 0 !important;
    width: auto !important;
    max-width: 320px !important;
    min-width: 280px !important;
  }

  .elegant-toast .swal2-icon {
    margin: 1.5rem auto 0.5rem auto !important;
    transform: scale(0.9) !important;
  }

  .elegant-toast .swal2-title {
    font-size: 1rem !important;
    font-weight: 500 !important;
    padding: 0 1.5rem 1.5rem 1.5rem !important;
    margin: 0 !important;
    color: #374151 !important;
  }

  .elegant-toast .swal2-timer-progress-bar-container {
    position: absolute !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    height: 3px !important;
    opacity: 0.7 !important;
  }

  /* Custom colors for different toast types */
  .elegant-toast.success-toast {
    border-top: 3px solid #10B981 !important;
  }
  .elegant-toast.success-toast .swal2-timer-progress-bar {
    background: #10B981 !important;
  }

  .elegant-toast.error-toast {
    border-top: 3px solid #EF4444 !important;
  }
  .elegant-toast.error-toast .swal2-timer-progress-bar {
    background: #EF4444 !important;
  }

  .elegant-toast.warning-toast {
    border-top: 3px solid #F59E0B !important;
  }
  .elegant-toast.warning-toast .swal2-timer-progress-bar {
    background: #F59E0B !important;
  }

  .elegant-toast.info-toast {
    border-top: 3px solid #3B82F6 !important;
  }
  .elegant-toast.info-toast .swal2-timer-progress-bar {
    background: #3B82F6 !important;
  }

  .elegant-toast.custom-toast {
    border-top: 3px solid #8B5CF6 !important;
  }
  .elegant-toast.custom-toast .swal2-timer-progress-bar {
    background: #8B5CF6 !important;
  }

  /* Custom toast animations */
  @keyframes elegantToastIn {
    0% { transform: translateY(15px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes elegantToastOut {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-15px); opacity: 0; }
  }

  .elegant-toast {
    animation: elegantToastIn 0.3s ease-out !important;
  }

  .elegant-toast.swal2-hide {
    animation: elegantToastOut 0.3s ease-in forwards !important;
  }

  /* Custom styling for user avatar */
  .user-avatar {
    position: relative;
    display: inline-block;
    margin-bottom: 0.75rem;
  }

  .user-avatar::before {
    content: '';
    position: absolute;
    inset: -3px;
    background: linear-gradient(45deg, #8B5CF6, #3B82F6);
    border-radius: 50%;
    z-index: 0;
  }

  .user-avatar img {
    position: relative;
    z-index: 1;
    border: 2px solid white;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    object-fit: cover;
  }

  .user-avatar .badge {
    position: absolute;
    bottom: 0;
    right: 0;
    background: linear-gradient(45deg, #8B5CF6, #3B82F6);
    border-radius: 50%;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
    z-index: 2;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .user-avatar .badge svg {
    width: 8px;
    height: 8px;
    color: white;
  }
`;

// Common toast configuration
const toastConfig = {
  toast: false, // Set to false to make it appear centered like a modal
  position: "center",
  showConfirmButton: false,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
  willOpen: () => {
    // Add custom CSS styles
    if (!document.getElementById('elegant-toast-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'elegant-toast-styles';
      styleElement.innerHTML = toastStyles;
      document.head.appendChild(styleElement);
    }
  },
  heightAuto: false,
  showClass: {
    popup: 'elegant-toast'
  },
  hideClass: {
    popup: 'swal2-hide'
  }
};

// 🟢 Thành công
export const showSuccessToast = (message) => {
  MySwal.fire({
    ...toastConfig,
    icon: "success", // Use SweetAlert's built-in icon
    title: message,
    timer: 1500,
  });
};

// 🔴 Lỗi
export const showErrorToast = (message) => {
  MySwal.fire({
    ...toastConfig,
    icon: "error", // Use SweetAlert's built-in icon
    title: message,
    timer: 1500,
  });
};

// 🔵 Thông tin
export const showInfoToast = (message) => {
  MySwal.fire({
    ...toastConfig,
    icon: "info", // Use SweetAlert's built-in icon
    title: message,
    timer: 2000,
  });
};

// ⚠️ Cảnh báo
export const showWarningToast = (message) => {
  MySwal.fire({
    ...toastConfig,
    icon: "warning", // Use SweetAlert's built-in icon
    title: message,
    timer: 2000,
  });
};

// 🧑‍💼 Custom thông báo có hình ảnh và thông tin user
export const showCustomToast = ({ productImage, userName, productName, orderCode, timeAgo, productId }) => {
  MySwal.fire({
    ...toastConfig,
    toast: true,
    position: 'bottom-left',
    html: `
      <div class="px-5 pt-4 pb-5 text-center">
        <div class="user-avatar">
          <img src="${productImage}" alt="User" />
          <div class="badge">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
            </svg>
          </div>
        </div>

        <div>
          <p class="text-gray-800 font-medium mb-1" style="font-size: 0.9rem;">
            <span class="text-purple-700">${userName}</span> vừa mua
            <a href="http://localhost:3000/product/${productId}" class="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">${productName}</a>
          </p>
          <p class="text-gray-500" style="font-size: 0.8rem; margin-bottom: 0.5rem;">${orderCode}</p>
          <div style="display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #9CA3AF;">
            <svg xmlns="http://www.w3.org/2000/svg" style="width: 0.8rem; height: 0.8rem; margin-right: 0.25rem; color: #8B5CF6;" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
            ${timeAgo}
          </div>
        </div>
      </div>
    `,
    timer: 3000,
    customClass: {
      popup: 'elegant-toast custom-toast',
    },
  });
};
