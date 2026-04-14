from django import forms
from django.contrib.auth.models import Group

from .models import GiaoVien, LoaiVanBan, MauVanBan, MucDoUuTien, ToChuyenMon, VanBanDen, VanBanDi


INCOMING_AP_DUNG_VALUES = [1, 2]
OUTGOING_AP_DUNG_VALUES = [0, 2]


class LoaiVanBanChoiceField(forms.ModelChoiceField):
    def label_from_instance(self, obj):
        return obj.ten_loai_vb


class MucDoChoiceField(forms.ModelChoiceField):
    def label_from_instance(self, obj):
        return obj.muc_do


class GiaoVienChoiceField(forms.ModelChoiceField):
    def label_from_instance(self, obj):
        return obj.ho_ten


class VanBanDenForm(forms.ModelForm):
    ma_loai_vb = LoaiVanBanChoiceField(queryset=LoaiVanBan.objects.none())
    ma_muc_do = MucDoChoiceField(queryset=MucDoUuTien.objects.none())

    class Meta:
        model = VanBanDen
        fields = [
            "ngay_nhan",
            "ngay_ky",
            "so_ky_hieu",
            "ma_loai_vb",
            "ma_muc_do",
            "co_quan_ban_hanh",
            "trich_yeu",
            "file_van_ban",
        ]
        labels = {
            "ngay_nhan": "Ngày đến",
            "ngay_ky": "Ngày ký văn bản",
            "so_ky_hieu": "Số ký hiệu văn bản",
            "ma_loai_vb": "Loại văn bản",
            "ma_muc_do": "Mức độ ưu tiên",
            "co_quan_ban_hanh": "Cơ quan ban hành",
            "trich_yeu": "Trích yếu",
            "file_van_ban": "Tải tệp scan hoặc file văn bản",
        }
        widgets = {
            "ngay_nhan": forms.DateInput(
                attrs={"type": "date", "class": "form-control", "placeholder": "Chon ngay nhan van ban"}
            ),
            "ngay_ky": forms.DateInput(
                attrs={"type": "date", "class": "form-control", "placeholder": "Chon ngay ky van ban"}
            ),
            "so_ky_hieu": forms.TextInput(
                attrs={"class": "form-control", "placeholder": "Nhap so ky hieu van ban"}
            ),
            "ma_loai_vb": forms.Select(attrs={"class": "form-control"}),
            "ma_muc_do": forms.Select(attrs={"class": "form-control"}),
            "co_quan_ban_hanh": forms.TextInput(
                attrs={"class": "form-control", "placeholder": "Nhap co quan ban hanh"}
            ),
            "trich_yeu": forms.Textarea(
                attrs={"class": "form-control", "rows": 4, "placeholder": "Nhap trich yeu van ban"}
            ),
            "file_van_ban": forms.ClearableFileInput(
                attrs={"class": "sr-only", "accept": ".pdf,.doc,.docx,image/*"}
            ),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["ma_loai_vb"].queryset = LoaiVanBan.objects.filter(ap_dung__in=INCOMING_AP_DUNG_VALUES).order_by(
            "ma_loai_vb"
        )
        self.fields["ma_muc_do"].queryset = MucDoUuTien.objects.order_by("ma_muc_do")
        self.fields["ma_loai_vb"].empty_label = "Chọn mã loại văn bản"
        self.fields["ma_muc_do"].empty_label = "Chọn mã mức độ"
        self.fields["ngay_nhan"].required = True
        self.fields["file_van_ban"].required = True

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.trang_thai_vb_den = VanBanDen.TrangThai.CHO_PHAN_CONG
        if commit:
            instance.save()
        return instance


class VanBanDenUpdateForm(forms.ModelForm):
    ma_loai_vb = LoaiVanBanChoiceField(queryset=LoaiVanBan.objects.none())
    ma_muc_do = MucDoChoiceField(queryset=MucDoUuTien.objects.none())

    class Meta:
        model = VanBanDen
        fields = [
            "trang_thai_vb_den",
            "ngay_nhan",
            "ngay_ky",
            "so_ky_hieu",
            "ma_loai_vb",
            "ma_muc_do",
            "co_quan_ban_hanh",
            "trich_yeu",
            "file_van_ban",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["ma_loai_vb"].queryset = LoaiVanBan.objects.filter(ap_dung__in=INCOMING_AP_DUNG_VALUES).order_by(
            "ten_loai_vb"
        )
        self.fields["ma_muc_do"].queryset = MucDoUuTien.objects.order_by("muc_do")
        self.fields["ma_loai_vb"].empty_label = "Chon loai van ban"
        self.fields["ma_muc_do"].empty_label = "Chon muc do uu tien"
        self.fields["ngay_nhan"].widget.attrs.update({"placeholder": "Chon ngay nhan van ban"})
        self.fields["ngay_ky"].widget.attrs.update({"placeholder": "Chon ngay ky van ban"})
        self.fields["so_ky_hieu"].widget.attrs.update({"placeholder": "Nhap so ky hieu van ban"})
        self.fields["co_quan_ban_hanh"].widget.attrs.update({"placeholder": "Nhap co quan ban hanh"})
        self.fields["trich_yeu"].widget.attrs.update({"placeholder": "Nhap trich yeu van ban"})


class VanBanDiUpdateForm(forms.ModelForm):
    ma_loai_vb = LoaiVanBanChoiceField(queryset=LoaiVanBan.objects.none())
    ma_muc_do = MucDoChoiceField(queryset=MucDoUuTien.objects.none())
    nguoi_tao = GiaoVienChoiceField(queryset=GiaoVien.objects.none())
    nguoi_ky = GiaoVienChoiceField(queryset=GiaoVien.objects.none())

    class Meta:
        model = VanBanDi
        fields = [
            "trang_thai_vb_di",
            "ngay_ban_hanh",
            "ngay_ky",
            "so_ky_hieu",
            "ma_loai_vb",
            "ma_muc_do",
            "nguoi_tao",
            "nguoi_ky",
            "noi_nhan",
            "trich_yeu",
            "ban_du_thao",
            "ban_chinh_thuc",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["ma_loai_vb"].queryset = LoaiVanBan.objects.filter(ap_dung__in=OUTGOING_AP_DUNG_VALUES).order_by(
            "ten_loai_vb"
        )
        self.fields["ma_muc_do"].queryset = MucDoUuTien.objects.order_by("muc_do")
        self.fields["nguoi_tao"].queryset = GiaoVien.objects.order_by("ho_ten")
        self.fields["nguoi_ky"].queryset = GiaoVien.objects.order_by("ho_ten")
        self.fields["nguoi_tao"].disabled = True
        self.fields["ban_du_thao"].required = False
        self.fields["ban_chinh_thuc"].required = False


class VanBanDiDangKyForm(forms.ModelForm):
    ma_loai_vb = LoaiVanBanChoiceField(queryset=LoaiVanBan.objects.none())
    ma_muc_do = MucDoChoiceField(queryset=MucDoUuTien.objects.none())
    nguoi_tao = GiaoVienChoiceField(queryset=GiaoVien.objects.none())
    nguoi_ky = GiaoVienChoiceField(queryset=GiaoVien.objects.none())

    class Meta:
        model = VanBanDi
        fields = [
            "ngay_ky",
            "so_ky_hieu",
            "ma_loai_vb",
            "ma_muc_do",
            "nguoi_tao",
            "nguoi_ky",
            "noi_nhan",
            "trich_yeu",
            "ban_chinh_thuc",
        ]
        widgets = {
            "ngay_ky": forms.DateInput(
                attrs={"type": "date", "class": "form-control", "placeholder": "Chon ngay ky van ban"}
            ),
            "so_ky_hieu": forms.TextInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "So ky hieu duoc cap tu dong khi luu dang ky",
                    "readonly": "readonly",
                }
            ),
            "ma_loai_vb": forms.Select(attrs={"class": "form-control"}),
            "ma_muc_do": forms.Select(attrs={"class": "form-control"}),
            "nguoi_tao": forms.Select(attrs={"class": "form-control"}),
            "nguoi_ky": forms.Select(attrs={"class": "form-control"}),
            "noi_nhan": forms.TextInput(attrs={"class": "form-control", "placeholder": "Nhap noi nhan"}),
            "trich_yeu": forms.Textarea(
                attrs={"class": "form-control", "rows": 4, "placeholder": "Nhap trich yeu van ban"}
            ),
            "ban_chinh_thuc": forms.FileInput(
                attrs={"class": "sr-only", "accept": ".pdf,.doc,.docx,image/*"}
            ),
        }

    def __init__(self, *args, **kwargs):
        editable = kwargs.pop("editable", True)
        create_mode = kwargs.pop("create_mode", False)
        giao_vien = kwargs.pop("giao_vien", None)
        super().__init__(*args, **kwargs)
        self.create_mode = create_mode
        self.fields["ma_loai_vb"].queryset = LoaiVanBan.objects.filter(ap_dung__in=OUTGOING_AP_DUNG_VALUES).order_by(
            "ten_loai_vb"
        )
        self.fields["ma_muc_do"].queryset = MucDoUuTien.objects.order_by("muc_do")
        self.fields["nguoi_tao"].queryset = GiaoVien.objects.order_by("ho_ten")
        self.fields["nguoi_ky"].queryset = GiaoVien.objects.order_by("ho_ten")
        self.fields["ma_loai_vb"].empty_label = "Chon loai van ban"
        self.fields["ma_muc_do"].empty_label = "Chon muc do uu tien"
        self.fields["nguoi_tao"].empty_label = "Chon nguoi soan thao"
        self.fields["nguoi_ky"].empty_label = "Chon nguoi ky"
        self.fields["ma_loai_vb"].widget.attrs.update({"class": "form-control"})
        self.fields["ma_muc_do"].widget.attrs.update({"class": "form-control"})
        self.fields["nguoi_tao"].widget.attrs.update({"class": "form-control"})
        self.fields["nguoi_ky"].widget.attrs.update({"class": "form-control"})
        self.fields["ngay_ky"].required = False
        self.fields["so_ky_hieu"].required = False
        self.fields["ban_chinh_thuc"].required = False
        self.fields["ma_muc_do"].required = False
        self.fields["noi_nhan"].required = False
        self.fields["trich_yeu"].required = False
        self.fields["so_ky_hieu"].disabled = True

        if not create_mode:
            self.fields["ma_loai_vb"].disabled = True
            self.fields["nguoi_tao"].disabled = True
            self.fields["nguoi_ky"].disabled = True
            self.fields["ma_loai_vb"].required = False
            self.fields["nguoi_tao"].required = False
            self.fields["nguoi_ky"].required = False

        if not editable:
            for field in self.fields.values():
                field.disabled = True

    def clean(self):
        cleaned_data = super().clean()
        if not self.instance.pk:
            return cleaned_data

        fallback_fields = ["ngay_ky", "ma_muc_do", "noi_nhan", "trich_yeu", "so_ky_hieu"]
        for field_name in fallback_fields:
            value = cleaned_data.get(field_name)
            if value in (None, ""):
                cleaned_data[field_name] = getattr(self.instance, field_name)
        return cleaned_data


class TaoVanBanDiForm(forms.ModelForm):
    ma_loai_vb = LoaiVanBanChoiceField(queryset=LoaiVanBan.objects.none())
    ma_muc_do = MucDoChoiceField(queryset=MucDoUuTien.objects.none())

    class Meta:
        model = VanBanDi
        fields = ["ma_loai_vb", "ma_muc_do", "noi_nhan", "trich_yeu", "ban_du_thao"]
        widgets = {
            "ma_loai_vb": forms.Select(attrs={"class": "form-control"}),
            "ma_muc_do": forms.Select(attrs={"class": "form-control"}),
            "noi_nhan": forms.TextInput(attrs={"class": "form-control"}),
            "trich_yeu": forms.Textarea(attrs={"class": "form-control", "rows": 4}),
            "ban_du_thao": forms.FileInput(attrs={"class": "sr-only", "accept": ".pdf,.doc,.docx,image/*"}),
        }

    def __init__(self, *args, **kwargs):
        self.giao_vien = kwargs.pop("giao_vien", None)
        super().__init__(*args, **kwargs)
        self.fields["ma_loai_vb"].queryset = LoaiVanBan.objects.filter(ap_dung__in=OUTGOING_AP_DUNG_VALUES).order_by(
            "ten_loai_vb"
        )
        self.fields["ma_muc_do"].queryset = MucDoUuTien.objects.order_by("muc_do")
        self.fields["ma_loai_vb"].empty_label = "Chọn loại văn bản"
        self.fields["ma_muc_do"].empty_label = "Chọn mức độ ưu tiên"
        self.fields["ma_loai_vb"].widget.attrs.update({"class": "form-control", "id": "loai-van-ban"})
        self.fields["ma_muc_do"].widget.attrs.update({"class": "form-control", "id": "muc-do-uu-tien"})
        self.fields["noi_nhan"].widget.attrs.update({"class": "form-control", "id": "noi-nhan"})
        self.fields["trich_yeu"].widget.attrs.update({"class": "form-control", "id": "trich-yeu", "rows": 4})
        self.fields["ban_du_thao"].widget.attrs.update(
            {"class": "sr-only", "id": "id_ban_du_thao", "accept": ".pdf,.doc,.docx,image/*"}
        )

    def clean(self):
        cleaned_data = super().clean()
        if self.giao_vien is None:
            raise forms.ValidationError("Tài khoản hiện tại chưa được liên kết với giáo viên.")
        return cleaned_data

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.nguoi_tao = self.giao_vien
        instance.nguoi_ky = self.giao_vien
        instance.trang_thai_vb_di = VanBanDi.TrangThai.CHO_DUYET
        instance.so_ky_hieu = ""
        if commit:
            instance.save()
        return instance


class ThemMauVanBanForm(forms.ModelForm):
    ma_loai_vb = LoaiVanBanChoiceField(queryset=LoaiVanBan.objects.none())

    class Meta:
        model = MauVanBan
        fields = ["ngay_tao", "ten_mau", "ma_loai_vb", "trang_thai", "muc_dich", "file_mau"]
        widgets = {
            "ngay_tao": forms.DateInput(attrs={"type": "date", "class": "form-control", "id": "ngay-tao"}),
            "ten_mau": forms.TextInput(attrs={"class": "form-control", "id": "ten-mau"}),
            "ma_loai_vb": forms.Select(attrs={"class": "form-control", "id": "loai-van-ban-mau"}),
            "trang_thai": forms.Select(attrs={"class": "form-control", "id": "trang-thai-mau"}),
            "muc_dich": forms.Textarea(attrs={"class": "form-control", "id": "muc-dich", "rows": 4}),
            "file_mau": forms.FileInput(
                attrs={"class": "sr-only", "id": "id_file_mau", "accept": ".pdf,.doc,.docx,image/*"}
            ),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["ma_loai_vb"].queryset = LoaiVanBan.objects.filter(ap_dung__in=OUTGOING_AP_DUNG_VALUES).order_by(
            "ten_loai_vb"
        )
        self.fields["ma_loai_vb"].empty_label = "Chọn loại văn bản"
        self.fields["ma_loai_vb"].widget.attrs.update({"class": "form-control", "id": "loai-van-ban-mau"})


class CapNhatMauVanBanForm(forms.ModelForm):
    ma_loai_vb = LoaiVanBanChoiceField(queryset=LoaiVanBan.objects.none())

    class Meta:
        model = MauVanBan
        fields = ["ngay_tao", "ten_mau", "ma_loai_vb", "trang_thai", "muc_dich", "file_mau"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["ma_loai_vb"].queryset = LoaiVanBan.objects.filter(ap_dung__in=OUTGOING_AP_DUNG_VALUES).order_by(
            "ten_loai_vb"
        )
        self.fields["file_mau"].required = False


class GiaoVienTaiKhoanForm(forms.ModelForm):
    ma_to = forms.ModelChoiceField(queryset=ToChuyenMon.objects.none(), required=False)

    class Meta:
        model = GiaoVien
        fields = ["ho_ten", "chuc_vu", "ma_to", "trang_thai_tk"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["ma_to"].queryset = ToChuyenMon.objects.order_by("ten_to")
        self.fields["trang_thai_tk"].widget = forms.Select(
            choices=[
                (GiaoVien.TrangThaiTaiKhoan.HOAT_DONG, "Hoat dong"),
                (GiaoVien.TrangThaiTaiKhoan.NGUNG_HOAT_DONG, "Ngung hoat dong"),
            ]
        )

    def clean_trang_thai_tk(self):
        trang_thai = self.cleaned_data["trang_thai_tk"]
        allowed_statuses = {
            GiaoVien.TrangThaiTaiKhoan.HOAT_DONG,
            GiaoVien.TrangThaiTaiKhoan.NGUNG_HOAT_DONG,
        }
        if trang_thai not in allowed_statuses:
            raise forms.ValidationError("Trang thai tai khoan khong hop le.")
        return trang_thai


class ThemGiaoVienForm(GiaoVienTaiKhoanForm):
    ma_gv = forms.CharField(max_length=10)

    class Meta(GiaoVienTaiKhoanForm.Meta):
        fields = ["ma_gv", "ho_ten", "chuc_vu", "ma_to", "trang_thai_tk"]

    def clean_ma_gv(self):
        ma_gv = (self.cleaned_data["ma_gv"] or "").strip()
        if not ma_gv:
            raise forms.ValidationError("Vui long nhap ma giao vien.")
        if GiaoVien.objects.filter(ma_gv=ma_gv).exists():
            raise forms.ValidationError("Ma giao vien da ton tai.")
        return ma_gv


class PhanQuyenNguoiDungForm(forms.Form):
    nhom_quyen = forms.ModelMultipleChoiceField(
        queryset=Group.objects.none(),
        required=False,
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["nhom_quyen"].queryset = Group.objects.order_by("name")
