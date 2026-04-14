(function () {
    const fileInput = document.getElementById("id_ban_chinh_thuc");
    const fileNameInput = document.getElementById("selected-file-name");
    const triggerAreas = document.querySelectorAll("[data-file-trigger], #trigger-file-button");
    const placeholder = document.getElementById("preview-placeholder");
    const imagePreview = document.getElementById("preview-image");
    const pdfPreview = document.getElementById("preview-pdf");
    const wordPreview = document.getElementById("preview-word");
    const messagePreview = document.getElementById("preview-message");
    const capSoButton = document.getElementById("btn-cap-so");
    const soKyHieuInput = document.getElementById("id_so_ky_hieu");
    const capSoUrl = document.getElementById("cap-so-url");
    const csrfTokenInput = document.querySelector("[name=csrfmiddlewaretoken]");
    const transferButton = document.getElementById("btn-luan-chuyen");
    const externalPublishButton = document.getElementById("btn-phat-hanh-ben-ngoai");
    const internalPublishButton = document.getElementById("btn-ban-hanh-noi-bo");
    const recipientModal = document.getElementById("recipient-modal");
    const closeRecipientModalButton = document.getElementById("close-recipient-modal");
    const recipientSearchInput = document.getElementById("recipient-search-input");
    const recipientItems = document.querySelectorAll(".recipient-item");
    const submitRecipientSelectionButton = document.getElementById("btn-submit-recipient-selection");
    const recipientErrorBox = document.getElementById("recipient-form-errors");

    let activeObjectUrl = null;

    function revokeObjectUrl() {
        if (activeObjectUrl) {
            URL.revokeObjectURL(activeObjectUrl);
            activeObjectUrl = null;
        }
    }

    function hideAllPreviews() {
        [placeholder, imagePreview, pdfPreview, wordPreview, messagePreview].forEach(function (element) {
            if (element) {
                element.classList.add("hidden");
            }
        });
        revokeObjectUrl();
        if (imagePreview) {
            imagePreview.removeAttribute("src");
        }
        if (pdfPreview) {
            pdfPreview.removeAttribute("src");
        }
        if (wordPreview) {
            wordPreview.innerHTML = "";
        }
        if (messagePreview) {
            messagePreview.textContent = "";
        }
    }

    function showPlaceholder(message) {
        if (!placeholder) {
            return;
        }
        hideAllPreviews();
        placeholder.textContent = message || "Chua co tep nao duoc chon.";
        placeholder.classList.remove("hidden");
    }

    function showMessage(message) {
        if (!messagePreview) {
            return;
        }
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
            mammoth
                .convertToHtml({ arrayBuffer: event.target.result })
                .then(function (result) {
                    wordPreview.innerHTML = result.value || "<p>Khong doc duoc noi dung tep Word.</p>";
                    wordPreview.classList.remove("hidden");
                })
                .catch(function () {
                    showMessage("Khong the xem truoc tep Word nay.");
                });
        };
        reader.readAsArrayBuffer(file);
    }

    function handleFileChange() {
        const file = fileInput && fileInput.files && fileInput.files[0];
        if (!file) {
            if (fileNameInput && !fileNameInput.value) {
                fileNameInput.value = "Nhan bieu tuong de tai tep chinh thuc";
            }
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
            showMessage("Tep .doc khong the xem truc tiep tren trinh duyet.");
            return;
        }

        showMessage("Dinh dang tep nay chua duoc ho tro xem truoc.");
    }

    triggerAreas.forEach(function (element) {
        element.addEventListener("click", function () {
            if (!fileInput || fileInput.disabled) {
                return;
            }
            fileInput.click();
        });
    });

    if (fileInput) {
        fileInput.addEventListener("change", handleFileChange);
    }

    if (capSoButton && soKyHieuInput && capSoUrl && csrfTokenInput) {
        capSoButton.addEventListener("click", function () {
            fetch(capSoUrl.value, {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrfTokenInput.value,
                    "X-Requested-With": "XMLHttpRequest",
                },
            })
                .then(async function (response) {
                    const payload = await response.json();
                    if (!response.ok) {
                        throw payload;
                    }
                    return payload;
                })
                .then(function (payload) {
                    soKyHieuInput.value = payload.so_ky_hieu || "";
                })
                .catch(function (payload) {
                    window.alert((payload && payload.message) || "Khong the cap so van ban.");
                });
        });
    }

    if (transferButton && csrfTokenInput) {
        transferButton.textContent = "Gui phan cong";
        transferButton.addEventListener("click", function () {
            fetch(transferButton.dataset.transferUrl, {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrfTokenInput.value,
                    "X-Requested-With": "XMLHttpRequest",
                },
            })
                .then(async function (response) {
                    const payload = await response.json();
                    if (!response.ok) {
                        throw payload;
                    }
                    return payload;
                })
                .then(function () {
                    window.location.reload();
                })
                .catch(function (payload) {
                    window.alert((payload && payload.message) || "Khong the gui phan cong van ban.");
                });
        });
    }

    if (internalPublishButton && csrfTokenInput) {
        internalPublishButton.addEventListener("click", function () {
            fetch(internalPublishButton.dataset.publishUrl, {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrfTokenInput.value,
                    "X-Requested-With": "XMLHttpRequest",
                },
            })
                .then(async function (response) {
                    const payload = await response.json();
                    if (!response.ok) {
                        throw payload;
                    }
                    return payload;
                })
                .then(function () {
                    window.location.reload();
                })
                .catch(function (payload) {
                    window.alert((payload && payload.message) || "Khong the cap nhat ban hanh noi bo.");
                });
        });
    }

    function closeRecipientModal() {
        if (!recipientModal) {
            return;
        }
        recipientModal.classList.add("hidden");
        if (recipientErrorBox) {
            recipientErrorBox.textContent = "";
        }
    }

    if (externalPublishButton && recipientModal) {
        externalPublishButton.addEventListener("click", function () {
            recipientModal.classList.remove("hidden");
            if (recipientErrorBox) {
                recipientErrorBox.textContent = "";
            }
        });
    }

    if (closeRecipientModalButton) {
        closeRecipientModalButton.addEventListener("click", closeRecipientModal);
    }

    if (recipientModal) {
        recipientModal.addEventListener("click", function (event) {
            if (event.target === recipientModal) {
                closeRecipientModal();
            }
        });
    }

    if (recipientSearchInput) {
        recipientSearchInput.addEventListener("input", function () {
            const keyword = (recipientSearchInput.value || "").trim().toLowerCase();
            recipientItems.forEach(function (item) {
                const haystack = (item.dataset.search || "").toLowerCase();
                item.classList.toggle("hidden", Boolean(keyword) && !haystack.includes(keyword));
            });
        });
    }

    if (submitRecipientSelectionButton && externalPublishButton && csrfTokenInput) {
        submitRecipientSelectionButton.addEventListener("click", function () {
            const checkedRecipients = Array.from(document.querySelectorAll(".recipient-checkbox:checked"));
            if (!checkedRecipients.length) {
                recipientErrorBox.textContent = "Vui long chon it nhat mot noi nhan.";
                return;
            }

            const formData = new FormData();
            checkedRecipients.forEach(function (checkbox) {
                formData.append("noi_nhan_ids[]", checkbox.value);
            });

            fetch(externalPublishButton.dataset.publishUrl, {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrfTokenInput.value,
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: formData,
            })
                .then(async function (response) {
                    const payload = await response.json();
                    if (!response.ok) {
                        throw payload;
                    }
                    return payload;
                })
                .then(function () {
                    closeRecipientModal();
                    window.location.reload();
                })
                .catch(function (payload) {
                    recipientErrorBox.textContent =
                        (payload && payload.message) || "Khong the phat hanh ben ngoai van ban.";
                });
        });
    }

    showPlaceholder();
})();
