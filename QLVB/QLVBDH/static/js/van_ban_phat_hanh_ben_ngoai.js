(function () {
    const tableBody = document.getElementById("external-table-body");
    const modal = document.getElementById("external-modal");
    const closeButton = document.getElementById("close-external-modal");
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const recipientBody = document.getElementById("external-recipient-body");

    if (!tableBody || !modal) {
        return;
    }

    function filterRows() {
        const keyword = ((searchInput && searchInput.value) || "").trim().toLowerCase();
        tableBody.querySelectorAll("tr[data-record-id]").forEach((row) => {
            const haystack = [
                row.dataset.soVanBan,
                row.dataset.loaiVb,
                row.dataset.soKyHieu,
                row.dataset.trichYeu,
                row.dataset.noiNhan,
            ]
                .join(" ")
                .toLowerCase();
            row.classList.toggle("hidden", Boolean(keyword) && !haystack.includes(keyword));
        });
    }

    function closeModal() {
        modal.classList.remove("show");
    }

    function renderRecipients(payload) {
        let recipients = [];
        try {
            recipients = JSON.parse(payload || "[]");
        } catch (error) {
            recipients = [];
        }
        recipientBody.innerHTML = "";
        if (!recipients.length) {
            recipientBody.innerHTML = '<tr><td colspan="6" class="empty-state">Chua co noi nhan nao.</td></tr>';
            return;
        }
        recipients.forEach((recipient) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${recipient.ten_noi_nhan || ""}</td>
                <td>${recipient.dia_chi || ""}</td>
                <td>${recipient.so_dien_thoai || ""}</td>
                <td>${recipient.gmail || ""}</td>
                <td>${recipient.thong_tin_khac || ""}</td>
                <td>${recipient.thoi_gian_gui || ""}</td>
            `;
            recipientBody.appendChild(row);
        });
    }

    tableBody.addEventListener("click", function (event) {
        const row = event.target.closest("tr[data-record-id]");
        if (!row) {
            return;
        }
        document.getElementById("e-so-van-ban").value = row.dataset.soVanBan || "";
        document.getElementById("e-ngay-ban-hanh").value = row.dataset.ngayBanHanh || "";
        document.getElementById("e-loai-vb").value = row.dataset.loaiVb || "";
        document.getElementById("e-so-ky-hieu").value = row.dataset.soKyHieu || "";
        document.getElementById("e-trich-yeu").value = row.dataset.trichYeu || "";
        document.getElementById("e-file-name").value = row.dataset.fileName || "";
        const fileLink = document.getElementById("e-file-link");
        if (row.dataset.fileUrl) {
            fileLink.href = row.dataset.fileUrl;
            fileLink.classList.remove("disabled");
        } else {
            fileLink.href = "#";
            fileLink.classList.add("disabled");
        }
        renderRecipients(row.dataset.recipients);
        modal.classList.add("show");
    });

    closeButton.addEventListener("click", closeModal);
    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    if (searchInput) {
        searchInput.addEventListener("input", filterRows);
    }
    if (searchButton) {
        searchButton.addEventListener("click", filterRows);
    }
})();
