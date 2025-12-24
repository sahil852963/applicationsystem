import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

export const showToast = (message, type = "success") => {
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background:
                type === "success"
                    ? "linear-gradient(to right, #00b09b, #96c93d)"
                    : type === "warning"
                        ? "linear-gradient(to right, #f7971e, #ffd200)"
                        : "linear-gradient(to right, #ff416c, #ce3115ff)",
        },
    }).showToast();
};