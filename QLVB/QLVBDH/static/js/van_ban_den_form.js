(function () {
    const fileInput = document.getElementById("id_file_van_ban");
    const fileNameInput = document.getElementById("selected-file-name");
    const triggerAreas = document.querySelectorAll("[data-file-trigger], #trigger-file-button");
    const placeholder = document.getElementById("preview-placeholder");
    const imagePreview = document.getElementById("preview-image");
    const pdfPreview = document.getElementById("preview-pdf");
    const wordPreview = document.getElementById("preview-word");
    const messagePreview = document.getElementById("preview-message");

    if (!fileInput) {
        return;
    }

    let activeObjectUrl = null;

    function revokeObjectUrl() {
        if (activeObjectUrl) {
            URL.revokeObjectURL(activeObjectUrl);
            activeObjectUrl = null;
        }
    }

    function hideAllPreviews() {
        [placeholder, imagePreview, pdfPreview, wordPreview, messagePreview].forEach((element) => {
            element.classList.add("hidden");
        });
        revokeObjectUrl();
        imagePreview.removeAttribute("src");
        pdfPreview.removeAttribute("src");
        wordPreview.innerHTML = "";
        messagePreview.textContent = "";
    }

    function showPlaceholder(message) {
        hideAllPreviews();
        placeholder.textContent = message || "Chưa có tệp nào được chọn.";
        placeholder.classList.remove("hidden");
    }

    function showMessage(message) {
        hideAllPreviews();
        messagePreview.textContent = message;
        messagePreview.classList.remove("hidden");
    }

    function previewImage(file) {
        hideAllPreviews();
        activeObjectUrl = URL.createObjectURL(file);
        imagePreview.src = activeObjectUrl;
        imagePreview.classList.remove("hidden");
    }

    function previewPdf(file) {
        hideAllPreviews();
        activeObjectUrl = URL.createObjectURL(file);
        pdfPreview.src = activeObjectUrl;
        pdfPreview.classList.remove("hidden");
    }

    function previewDocx(file) {
        hideAllPreviews();
        const reader = new FileReader();
        reader.onload = function (event) {
            mammoth.convertToHtml({ arrayBuffer: event.target.result })
                .then(function (result) {
                    wordPreview.innerHTML = result.value || "<p>Không đọc được nội dung tệp Word.</p>";
                    wordPreview.querySelectorAll("table").forEach(function (table) {
                        table.removeAttribute("width");
                    });
                    wordPreview.querySelectorAll("[style]").forEach(function (element) {
                        if (element.style.width) {
                            element.style.maxWidth = "100%";
                        }
                    });
                    wordPreview.classList.remove("hidden");
                })
                .catch(function () {
                    showMessage("Không thể xem trước tệp Word này.");
                });
        };
        reader.readAsArrayBuffer(file);
    }

    function handleFileChange() {
        const file = fileInput.files && fileInput.files[0];
        if (!file) {
            fileNameInput.value = "Nhấn biểu tượng để tải tệp PDF, Word hoặc ảnh scan";
            showPlaceholder();
            return;
        }

        const lowerName = file.name.toLowerCase();
        fileNameInput.value = file.name;

        if (file.type.startsWith("image/")) {
            previewImage(file);
            return;
        }

        if (file.type === "application/pdf" || lowerName.endsWith(".pdf")) {
            previewPdf(file);
            return;
        }

        if (
            file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            lowerName.endsWith(".docx")
        ) {
            previewDocx(file);
            return;
        }

        if (file.type === "application/msword" || lowerName.endsWith(".doc")) {
            showMessage("Tệp .doc không thể xem trực tiếp trên trình duyệt. Hãy dùng .docx, PDF hoặc ảnh scan để xem trước.");
            return;
        }

        showMessage("Định dạng tệp này chưa được hỗ trợ xem trước.");
    }

    triggerAreas.forEach((element) => {
        element.addEventListener("click", function () {
            fileInput.click();
        });
    });

    fileInput.addEventListener("change", handleFileChange);
    document.querySelector(".btn-cancel")?.addEventListener("click", function () {
        window.setTimeout(function () {
            showPlaceholder();
            fileNameInput.value = "Nhấn biểu tượng để tải tệp PDF, Word hoặc ảnh scan";
        }, 0);
    });

    showPlaceholder();
})();
