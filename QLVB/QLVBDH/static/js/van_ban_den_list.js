(function () {
    const page = document.querySelector(".van-ban-page");
    const modal = document.getElementById("document-modal");
    const tableBody = document.getElementById("data-table-body");
    const editForm = document.getElementById("document-edit-form");
    const closeModalButton = document.getElementById("close-modal-btn");
    const editButton = document.getElementById("btn-edit");
    const cancelButton = document.getElementById("btn-cancel");
    const editActions = document.getElementById("edit-actions");
    const updateUrlInput = document.getElementById("update-url");
    const publishUrlInput = document.getElementById("publish-url");
    const errorBox = document.getElementById("modal-form-errors");
    const notificationOverlay = document.getElementById("notification-overlay");
    const notificationMessage = document.getElementById("notification-message");
    const publishButton = document.getElementById("btn-publish");
    const unpublishButton = document.getElementById("btn-unpublish");
    const fileLink = document.getElementById("m-file-link");
    const fileUploadInput = document.getElementById("m-file-upload");
    const fileUploadTrigger = document.getElementById("m-file-upload-trigger");
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");

    if (!modal || !tableBody || !editForm) {
        return;
    }

    const canManageDocuments = !page || page.dataset.canManage === "1";

    let activeRow = null;

    const fieldMap = {
        "m-so-den": "soDen",
        "m-trang-thai": "trangThai",
        "m-ngay-nhan": "ngayNhan",
        "m-ngay-ky": "ngayKy",
        "m-so-ky-hieu": "soKyHieu",
        "m-trich-yeu": "trichYeu",
        "m-co-quan": "coQuan",
        "m-loai-vb": "loaiVbId",
        "m-muc-do": "mucDoId",
        "m-file-name": "fileName",
    };

    function normalizeStatus(status) {
        return (status || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toLowerCase();
    }

    function canEditStatus(status) {
        return normalizeStatus(status) === "cho phan cong";
    }

    function updateActionButtons(status, isEditing, isPublished) {
        const canPublish = canManageDocuments && !isEditing && !isPublished;
        const canUnpublish = canManageDocuments && !isEditing && isPublished;
        if (publishButton) {
            publishButton.classList.toggle("hidden", !canPublish);
        }
        if (unpublishButton) {
            unpublishButton.classList.toggle("hidden", !canUnpublish);
        }
    }

    function convertDisplayDateToInput(displayDate) {
        const parts = displayDate.split("/");
        if (parts.length !== 3) {
            return displayDate;
        }
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    function convertInputDateToDisplay(inputDate) {
        const parts = inputDate.split("-");
        if (parts.length !== 3) {
            return inputDate;
        }
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function setEditMode(enabled) {
        const allowEdit = canManageDocuments && activeRow ? canEditStatus(activeRow.dataset.trangThai) : false;
        const editable = enabled && allowEdit;
        const editableInputs = editForm.querySelectorAll("input[name], textarea[name], select[name]");
        editableInputs.forEach((field) => {
            if (field.id === "m-so-den") {
                return;
            }

            if (field.matches("select")) {
                field.disabled = !editable;
            } else {
                if (editable) {
                    if (field.dataset.dateInput !== undefined) {
                        const currentValue = field.value;
                        field.type = "date";
                        if (currentValue) {
                            field.value = convertDisplayDateToInput(currentValue);
                        }
                    }
                    field.removeAttribute("readonly");
                } else {
                    if (field.dataset.dateInput !== undefined && field.value) {
                        if (field.type === "date") {
                            field.value = convertInputDateToDisplay(field.value);
                        }
                        field.type = "text";
                    }
                    field.setAttribute("readonly", "readonly");
                }
            }

            field.classList.toggle("editable", editable);
        });

        fileUploadTrigger.disabled = !editable;
        if (editButton) {
            editButton.classList.toggle("hidden", editable || !allowEdit);
        }
        editActions.classList.toggle("hidden", !editable);
        updateActionButtons(
            activeRow ? activeRow.dataset.trangThai : "",
            editable,
            activeRow ? activeRow.dataset.daBanHanhNoiBo === "1" : false
        );
        errorBox.textContent = "";
    }

    function populateModalFromRow(row) {
        const ngayNhanField = document.getElementById("m-ngay-nhan");
        const ngayKyField = document.getElementById("m-ngay-ky");
        ngayNhanField.type = "text";
        ngayKyField.type = "text";

        const data = {
            soDen: row.dataset.soDen,
            trangThai: row.dataset.trangThai,
            daBanHanhNoiBo: row.dataset.daBanHanhNoiBo === "1",
            ngayNhan: row.dataset.ngayNhan,
            ngayKy: row.dataset.ngayKy,
            soKyHieu: row.dataset.soKyHieu,
            trichYeu: row.dataset.trichYeu,
            coQuan: row.dataset.coQuan,
            loaiVbId: row.dataset.loaiVbId,
            mucDoId: row.dataset.mucDoId,
            fileName: row.dataset.fileName,
            fileUrl: row.dataset.fileUrl,
        };

        Object.entries(fieldMap).forEach(([elementId, key]) => {
            const field = document.getElementById(elementId);
            if (field) {
                field.value = data[key] || "";
            }
        });

        updateUrlInput.value = row.dataset.updateUrl;
        publishUrlInput.value = row.dataset.publishUrl;
        if (data.fileUrl) {
            fileLink.href = data.fileUrl;
            fileLink.classList.remove("disabled");
        } else {
            fileLink.href = "#";
            fileLink.classList.add("disabled");
        }
        fileUploadInput.value = "";
        updateActionButtons(data.trangThai, false, data.daBanHanhNoiBo);
        errorBox.textContent = "";
    }

    function closeModal() {
        modal.classList.remove("show");
        setEditMode(false);
        activeRow = null;
    }

    function showNotification(message) {
        notificationMessage.textContent = message;
        notificationOverlay.classList.remove("hidden");
        window.setTimeout(() => {
            notificationOverlay.classList.add("hidden");
        }, 1600);
    }

    function filterRows() {
        if (!searchInput) {
            return;
        }

        const keyword = (searchInput.value || "").trim().toLowerCase();
        const rows = tableBody.querySelectorAll("tr[data-update-url]");
        rows.forEach(function (row) {
            const haystack = [
                row.dataset.soDen,
                row.dataset.ngayNhan,
                row.dataset.ngayKy,
                row.dataset.soKyHieu,
                row.dataset.trichYeu,
                row.dataset.coQuan,
                row.dataset.trangThai,
                row.dataset.loaiVb,
                row.dataset.mucDo,
            ]
                .join(" ")
                .toLowerCase();
            row.classList.toggle("hidden", keyword !== "" && !haystack.includes(keyword));
        });
    }

    function applyUpdatedRow(documentData) {
        if (!activeRow) {
            return;
        }

        activeRow.dataset.trangThai = documentData.trang_thai_vb_den;
        activeRow.dataset.ngayNhan = documentData.ngay_nhan;
        activeRow.dataset.ngayKy = documentData.ngay_ky;
        activeRow.dataset.soKyHieu = documentData.so_ky_hieu;
        activeRow.dataset.trichYeu = documentData.trich_yeu;
        activeRow.dataset.coQuan = documentData.co_quan_ban_hanh;
        activeRow.dataset.loaiVb = documentData.ten_loai_vb;
        activeRow.dataset.loaiVbId = document.getElementById("m-loai-vb").value;
        activeRow.dataset.mucDo = documentData.muc_do;
        activeRow.dataset.mucDoId = document.getElementById("m-muc-do").value;
        activeRow.dataset.fileName = documentData.file_name;
        activeRow.dataset.daBanHanhNoiBo = documentData.da_ban_hanh_noi_bo ? "1" : "0";
        if (documentData.file_url) {
            activeRow.dataset.fileUrl = documentData.file_url;
        }
        updateActionButtons(documentData.trang_thai_vb_den, false, Boolean(documentData.da_ban_hanh_noi_bo));

        activeRow.querySelector('[data-col="ngay-nhan"]').textContent = documentData.ngay_nhan;
        activeRow.querySelector('[data-col="ngay-ky"]').textContent = documentData.ngay_ky;
        activeRow.querySelector('[data-col="so-ky-hieu"]').textContent = documentData.so_ky_hieu;
        activeRow.querySelector('[data-col="trich-yeu"]').textContent = documentData.trich_yeu;
        activeRow.querySelector('[data-col="co-quan"]').textContent = documentData.co_quan_ban_hanh;

        const statusCell = activeRow.querySelector('[data-col="trang-thai"]');
        statusCell.textContent = documentData.trang_thai_vb_den;
        statusCell.classList.remove("status-pending", "status-processing", "status-done");
        statusCell.classList.add(documentData.status_class);
        if (window.applyStatusThemes) {
            window.applyStatusThemes();
        }
    }

    tableBody.addEventListener("click", function (event) {
        const row = event.target.closest("tr[data-update-url]");
        if (!row) {
            return;
        }
        activeRow = row;
        populateModalFromRow(row);
        setEditMode(false);
        modal.classList.add("show");
    });

    if (editButton) {
        editButton.addEventListener("click", function () {
            setEditMode(true);
        });
    }

    cancelButton.addEventListener("click", function () {
        if (activeRow) {
            populateModalFromRow(activeRow);
        }
        setEditMode(false);
    });

    closeModalButton.addEventListener("click", closeModal);
    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    fileUploadTrigger.addEventListener("click", function () {
        if (!fileUploadTrigger.disabled) {
            fileUploadInput.click();
        }
    });

    fileUploadInput.addEventListener("change", function () {
        const file = fileUploadInput.files && fileUploadInput.files[0];
        if (file) {
            document.getElementById("m-file-name").value = file.name;
        }
    });

    function submitPublishToggle() {
        const csrfToken = editForm.querySelector("[name=csrfmiddlewaretoken]").value;
        fetch(publishUrlInput.value, {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken,
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
                applyUpdatedRow(payload.document);
                populateModalFromRow(activeRow);
                showNotification(payload.message || "Cập nhật thành công!");
            })
            .catch(function (payload) {
                errorBox.textContent = (payload && payload.message) || "Không thể cập nhật trạng thái ban hành nội bộ.";
            });
    }

    if (publishButton) {
        publishButton.addEventListener("click", submitPublishToggle);
    }

    if (unpublishButton) {
        unpublishButton.addEventListener("click", submitPublishToggle);
    }

    if (searchInput) {
        searchInput.addEventListener("input", filterRows);
    }

    if (searchButton) {
        searchButton.addEventListener("click", filterRows);
    }

    editForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const csrfToken = editForm.querySelector("[name=csrfmiddlewaretoken]").value;
        const formData = new FormData(editForm);

        fetch(updateUrlInput.value, {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken,
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
            .then(function (payload) {
                applyUpdatedRow(payload.document);
                populateModalFromRow(activeRow);
                setEditMode(false);
                showNotification(payload.message || "Lưu thành công!");
            })
            .catch(function (payload) {
                if (payload && payload.errors) {
                    const firstError = Object.values(payload.errors)[0];
                    errorBox.textContent = Array.isArray(firstError) ? firstError[0] : "Dữ liệu không hợp lệ.";
                    return;
                }
                errorBox.textContent = "Không thể lưu dữ liệu. Vui lòng thử lại.";
            });
    });
})();
