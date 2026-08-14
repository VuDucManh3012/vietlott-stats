# vietlott-stats

Thu thập kết quả xổ số Vietlott từ `vietlott.vn` và thống kê tần suất. Xuất CSV + báo cáo HTML có biểu đồ.

> **Đọc kỹ trước khi dùng:** đây là công cụ **thống kê mô tả dữ liệu lịch sử**. Mỗi kỳ quay Vietlott là độc lập — kết quả các kỳ trước **không** làm thay đổi xác suất của kỳ sắp tới. Các khái niệm "số nóng", "số lạnh", "số khô hạn" trong báo cáo chỉ phản ánh quá khứ và **không có giá trị dự đoán**. Đừng dùng nó làm cơ sở để đặt cược.

## Yêu cầu

Node.js >= 18 (dùng `fetch` có sẵn). **Không cần cài package nào** — zero dependency.

## Sản phẩm hỗ trợ

| ID | Sản phẩm | Cấu trúc kết quả |
|---|---|---|
| `645` | Mega 6/45 | 6 số trong 1–45 |
| `655` | Power 6/55 | 6 số trong 1–55 + 1 số quyền lực |
| `535` | Lotto 5/35 | 5 số trong 1–35 |
| `max3d` | Max 3D | 20 bộ 3 chữ số, chia 4 giải · cược 1 bộ 3 chữ số hoặc 2 bộ (Max 3D+) |
| `max3dpro` | Max 3D Pro | 20 bộ 3 chữ số, chia 4 giải · vé luôn gồm 2 bộ = 6 chữ số |

## Cách dùng

```bash
# Lần đầu: tự động tải toàn bộ lịch sử (mất vài phút)
node src/cli.js fetch --product 645

# Các lần sau: chỉ tải kỳ mới, dừng ngay khi gặp kỳ đã có
node src/cli.js fetch --product 645

# Ép tải lại toàn bộ
node src/cli.js fetch --product 645 --all

# Tải bảng giải thưởng (số lượng giải, giá trị giải) cho các kỳ gần nhất
node src/cli.js prizes --product 645
node src/cli.js prizes --prize-limit 200      # lấy sâu hơn 100 kỳ mặc định

# In thống kê ra terminal
node src/cli.js stats --product 645

# Xuất báo cáo HTML — MỘT file duy nhất, mỗi sản phẩm một tab
node src/cli.js report

# Làm tất cả cho mọi sản phẩm
node src/cli.js all

# Sinh dãy số ngẫu nhiên không trùng kỳ cũ
node src/cli.js random --product 645 --count 5
node src/cli.js random --product 645 --mode all      # tránh trùng MỌI giải
node src/cli.js random --product max3d --count 10          # bộ 3 chữ số (cược cơ bản)
node src/cli.js random --product max3d --play d6           # bộ 6 chữ số (Max 3D+)
node src/cli.js random --product max3dpro --count 10       # Max 3D Pro: luôn là bộ 6 chữ số
```

Bỏ `--product` để chạy cho toàn bộ sản phẩm, hoặc dùng dấu phẩy: `--product 645,655`.

Cập nhật định kỳ chỉ cần chạy lại `node src/cli.js all` — chế độ bổ sung sẽ dừng ngay khi chạm kỳ đã lưu, nên rất nhanh.

### Cập nhật nhanh: bấm đôi `cap-nhat.bat`

Công cụ **không tự chạy nền**. Dữ liệu chỉ mới tới lần chạy gần nhất.

Bấm đôi `cap-nhat.bat` ở thư mục gốc là nó tải kỳ mới, dựng lại báo cáo, rồi mở luôn trong trình
duyệt. Thêm tham số `/noopen` nếu chỉ muốn cập nhật mà không mở trình duyệt.

Nội dung file .bat viết bằng tiếng Việt **không dấu** — `cmd.exe` đọc file `.bat` theo bảng mã hệ
thống nên chữ có dấu sẽ ra ký tự rác. Phần trễ cuối file dùng `ping` thay cho `timeout` vì `timeout`
đòi stdin là console, sẽ lỗi khi gọi từ script khác hoặc từ Task Scheduler.

### Xem trên điện thoại

Báo cáo tự deploy lên GitHub Pages: **https://vuducmanh3012.github.io/vietlott-stats/**

File HTML tự chứa hoàn toàn (không CDN, không script ngoài) và đã có breakpoint cho màn hình hẹp,
nên mở trên điện thoại là dùng được ngay — thêm vào màn hình chính là có "app".

Luồng cập nhật tách làm hai nửa:

```
PC:     cap-nhat.bat  →  cào vietlott.vn  →  commit data/*.csv  →  push
GitHub: nhận push     →  node src/cli.js report  →  deploy Pages   (~2 phút)
```

Việc cào **bắt buộc** chạy ở máy cá nhân, không đưa lên Actions được: vietlott.vn đứng sau
Cloudflare và IP datacenter của runner GitHub bị trả về `403 cf-mitigated: challenge` (đo ngày
14/08/2026 — cả 3 biến thể header đều bị chặn như nhau, nên không phải lỗi thiếu header). Ngược lại
bước dựng báo cáo chỉ đọc CSV, không gọi mạng, nên chạy trên runner vô tư.

Hệ quả: trang trên điện thoại chỉ mới bằng lần bấm `cap-nhat.bat` gần nhất. Muốn nó tự cập nhật
hằng ngày thì đặt lịch chạy `cap-nhat.bat /noopen` bằng Task Scheduler của Windows.

### Lịch quay — khi nào nên chạy lại

Vietlott quay khoảng 18:00–18:30, nên chạy sau 18:30 mới có kết quả trong ngày.

| Sản phẩm | Lịch quay |
|---|---|
| Mega 6/45 | CN · T4 · T6 |
| Power 6/55 | T3 · T5 · T7 |
| Lotto 5/35 | hằng ngày, 2 kỳ/ngày |
| Max 3D | T2 · T4 · T6 |
| Max 3D Pro | T3 · T5 · T7 |

## Kết quả

```
data/645.csv           draw_id,date,numbers,bonus
data/max3d.csv         draw_id,date,prize,number,slot
data/645-prizes.csv    draw_id,play,tier,pattern,numbers,note,winners,value
reports/vietlott.html  báo cáo self-contained, mọi sản phẩm trong 1 file
```

Báo cáo là **một file duy nhất**, mỗi sản phẩm là một tab. Gộp lại để đối chiếu giữa các sản phẩm
mà không phải mở nhiều cửa sổ, và để CSS + JS chỉ xuất hiện một lần thay vì lặp lại theo số tab.
Dùng `--product` để giới hạn sản phẩm đưa vào file, ví dụ `--product 645,655`.

### Vì sao bảng giải tách thành file riêng

Số lượng giải và giá trị giải **không có** trong phản hồi của WebPart danh sách — trang đó chỉ trả về
ngày, kỳ và bộ số. Dữ liệu này chỉ nằm trên trang chi tiết của **từng kỳ**, nên mỗi kỳ tốn một request
riêng. Vì vậy `prizes` chỉ tải một cửa sổ kỳ gần đây (mặc định 100) thay vì toàn bộ lịch sử: 5.630 kỳ
sẽ mất gần một tiếng, trong khi hầu như không ai kéo danh sách kết quả xuống sâu đến vậy.

Cột `play` phân biệt lối chơi của Max 3D (`d3` = bộ 3 chữ số, `d6` = bộ 6) vì một kỳ Max 3D có **hai**
cơ cấu giải khác nhau. Cột `pattern` chỉ dùng cho nhóm lotto (`OOOOO|O` — sau dấu `|` là số đặc biệt,
dấu `/` ngăn các cách trúng thay thế nhau); cột `numbers` chỉ dùng cho Max 3D.

Cột `slot` trong file Max 3D là thứ tự của bộ số trong giải. Nó cần thiết vì **một giải hoàn toàn có thể ra trùng hai bộ số giống nhau** — nếu khóa chỉ gồm (kỳ, giải, số) thì bản ghi trùng sẽ bị khử nhầm.

## Báo cáo có gì

**Mega 6/45 và Power 6/55**
- Biểu đồ tần suất từng số, kèm đường kỳ vọng lý thuyết và dải nhiễu ±2σ
- Biểu đồ độ lệch so với kỳ vọng (cột hai chiều quanh mức 0)
- Số kỳ liên tiếp chưa xuất hiện ("khô hạn") của từng số
- Bảng ra nhiều nhất / ít nhất / khô hạn lâu nhất / cặp số hay đi cùng
- Ma trận nhiệt các cặp số, kèm mức kỳ vọng cho mỗi cặp
- Tần suất số quyền lực (riêng 6/55)

**Mọi sản phẩm — cột kết quả các kỳ (bên phải)**
- Danh sách kỳ từ gần nhất đến xa nhất, **cuộn riêng** khỏi phần thống kê bên trái
- Mỗi thẻ: số kỳ, thứ/ngày, bộ số trúng, và bảng giải đầy đủ (số lượng giải + giá trị từng giải)
- Chỉ hiện các kỳ đã có bảng giải — tăng độ sâu bằng `prizes --prize-limit N`
- Dưới 1080px thì cột xếp xuống dưới nhưng vẫn giữ vùng cuộn riêng

**Max 3D và Max 3D Pro**
- Tần suất từng chữ số theo từng vị trí (3 biểu đồ), kèm dải nhiễu ±2σ
- Top 20 bộ số ra nhiều nhất / ít nhất
- Phân bố theo giải
- Sinh dãy số theo đúng lối chơi của từng sản phẩm (bộ 3 hoặc 6 chữ số)

### Kiểm tra giả thuyết "không thể có 2 kỳ trùng giải cao nhất"

Mỗi sản phẩm có một mục kiểm tra giả thuyết này bằng chính dữ liệu lịch sử. Kết quả tại thời điểm
thu thập (tháng 8/2026):

| Sản phẩm | Kết quả khả dĩ | Kỳ vọng trùng | Xác suất ≥1 cặp | **Thực tế** |
|---|---|---|---|---|
| Mega 6/45 | 8.145.060 | 0,15 cặp | 13,7% | 0 cặp |
| Power 6/55 | 28.989.675 | 0,03 cặp | 3,2% | **1 cặp** |
| Lotto 5/35 | 324.632 | 1,03 cặp | 64,4% | **1 cặp** |
| Max 3D | 500.500 | 1,25 cặp | 71,2% | **2 cặp** |
| Max 3D Pro | 500.500 | 0,58 cặp | 44,1% | 0 cặp |

**Giả thuyết sai.** Power 6/55 đã từng ra trùng cả 6 số jackpot: kỳ 00647 (16/11/2021) và kỳ 00993
(06/02/2024) đều ra `08 19 27 34 46 51` — chỉ khác số quyền lực (02 và 24). Đã đối chiếu trực tiếp
với trang chi tiết trên vietlott.vn, không phải lỗi thu thập.

Lotto 5/35 cũng có một cặp: kỳ 00538 (24/03/2026) và kỳ 00728 (27/06/2026) đều ra `08 19 23 27 32`.
Nhưng ở đây trùng là chuyện **dự kiến** (kỳ vọng 1,03 cặp), không có gì đáng ngạc nhiên — khác hẳn
trường hợp 6/55.

Lý do bản năng thấy "không thể" là vì ta nghĩ theo kiểu "xác suất trùng một bộ số cụ thể". Nhưng
phép so là **mọi cặp kỳ với nhau** — 1.383 kỳ tạo ra 955.653 cặp, tăng theo bình phương số kỳ.
Đây chính là bài toán trùng ngày sinh.

Riêng Max 3D thì trùng là chuyện gần như chắc chắn (xác suất 71%), vì giải Đặc biệt chỉ có
500.500 kết quả khả dĩ — ít hơn số cặp kỳ đem so.

### Tiện ích sinh dãy số ngẫu nhiên

Dùng được ở **hai nơi**:

- **Trong báo cáo HTML** — mỗi tab sản phẩm có khối "Sinh dãy số ngẫu nhiên": chọn chế độ, số dãy,
  bấm nút là ra. Dữ liệu kỳ cũ được nhúng thẳng vào trang (~150KB) nên chạy được offline.
- **Ở terminal** — `node src/cli.js random`.

Thuật toán **không viết hai lần**: `report-page.js` đọc thẳng mã nguồn `random-picker.js` rồi nhúng
vào trang (bỏ từ khóa `export`), nên CLI và trang web chạy đúng cùng một mã.

#### Lối chơi của Max 3D / Max 3D Pro

Vé Max 3D có **hai lối chơi**, không gian đặt cược khác hẳn nhau — chọn bằng `--play`:

| `--play` | Vé cược | Không gian | Sản phẩm |
|---|---|---|---|
| `d3` | 1 bộ 3 chữ số (cược cơ bản) | 1.000 | Max 3D |
| `d6` | 2 bộ 3 chữ số = bộ 6 chữ số (Max 3D+) | 1.000.000 | Max 3D, **Max 3D Pro** |

**Max 3D Pro chỉ có `d6`** — vé của sản phẩm này luôn gồm hai bộ 3 chữ số, không có lối chơi 3 chữ
số nào. Với `d6`, **thứ tự có ý nghĩa**: trúng đúng thứ tự là giải Đặc biệt, ngược thứ tự là giải
Phụ Đặc biệt — nên cả hai chiều đều bị coi là "đã từng ra".

Hai chế độ:

- `--mode top` (mặc định) — chỉ tránh trùng **giải cao nhất**: với lotto là không trùng y hệt bộ số
  jackpot của bất kỳ kỳ nào; với Max 3D là bộ số chưa từng trúng giải Đặc biệt (với `d6` tính cả
  giải Phụ Đặc biệt).
- `--mode all` — tránh trùng **mọi giải**: với lotto là trùng dưới ngưỡng giải thấp nhất (mặc định
  3 số, đổi bằng `--min-match N`); với Max 3D là chưa từng trúng bất kỳ giải nào.

Với `d6`, `--mode all` chỉ phủ **tới giải Ba** (các giải ăn theo bộ 6 chữ số). Giải Tư/Năm/Sáu chỉ
cần trùng *một* bộ 3 chữ số, mà cả 1.000 bộ 3 chữ số đều đã từng ra — không tránh được, và công cụ
nói rõ điều đó thay vì im lặng.

**Chế độ `all` thường bất khả thi**, và công cụ báo thẳng thay vì quay vòng vô hạn:

| Sản phẩm | `--mode top` | `--mode all` |
|---|---|---|
| Mega 6/45 | được | **không** — thử 20.000 dãy, không dãy nào trùng dưới 3 số với cả 1.547 kỳ |
| Max 3D `d3` | được — còn 103/1.000 bộ số | **không** — cả 1.000 bộ 3 chữ số đều đã từng ra |
| Max 3D `d6` | được — còn 997.770/1.000.000 | được — còn 894.991/1.000.000 (tới giải Ba) |
| Max 3D Pro `d6` | được — còn 998.472/1.000.000 | được — còn 926.790/1.000.000 (tới giải Ba) |

Với Mega 6/45, công cụ trả về dãy tốt nhất tìm được (trùng nhiều nhất 3 số) kèm giải thích.
Lý do: mỗi dãy mới phải so với 1.547 kỳ cũ, mà xác suất trùng ≥3 số với *một* kỳ đã là ~2,4% —
nên gần như chắc chắn có ít nhất một kỳ trùng đủ để trúng giải thấp nhất.

> Tránh trùng kỳ cũ **không** làm tăng cơ hội trúng. Mọi dãy số đều có xác suất y hệt nhau ở kỳ
> sắp tới — tiện ích này chỉ phục vụ sở thích "không đặt lại dãy đã từng ra".

### Dải nhiễu ±2σ — vì sao có

Mỗi biểu đồ đều vẽ một vùng nền xám là dải dao động ±2 độ lệch chuẩn quanh mức kỳ vọng, tính theo
phân phối nhị thức. Một bộ số **hoàn toàn ngẫu nhiên** cũng sẽ có ~95% số cột nằm trong vùng này.

Đây là phần quan trọng nhất của báo cáo: nếu không có nó, người đọc nhìn bảng xếp hạng
"số ra nhiều nhất" và tưởng đã tìm ra quy luật. Thực tế với 1.547 kỳ Mega 6/45, kỳ vọng là 206,3 lần
mỗi số và dải nhiễu là ±26,7 — chênh lệch giữa số "nóng nhất" (227) và "lạnh nhất" (179)
nằm gọn trong mức mà ngẫu nhiên thuần túy tạo ra.

Điều này áp dụng cho mọi thứ trong báo cáo: số khô hạn, cặp số hay đi cùng, bộ số hay trúng.
Không có mục nào trong đây dự đoán được kỳ sau.

### Thiết kế biểu đồ

Bảng màu lấy từ bộ tham chiếu đã qua kiểm định tự động: dải độ sáng, sàn chroma, độ tách biệt
dưới mô phỏng mù màu (protan/deutan), và tương phản với nền — kiểm ở **cả hai** chế độ sáng/tối.
Màu chế độ tối được chọn riêng cho nền tối, không phải đảo ngược màu sáng.

**Màu định danh theo sản phẩm.** Mỗi sản phẩm có một màu riêng, đổi tab là cả trang đổi màu:
tiêu đề mục, ô KPI, khối số dẫn dắt, và cột biểu đồ.

| Sản phẩm | Sáng | Tối |
|---|---|---|
| Mega 6/45 | `#2a78d6` xanh dương | `#3987e5` |
| Power 6/55 | `#eb6834` cam | `#d95926` |
| Lotto 5/35 | `#1baf7a` lục | `#199e70` |
| Max 3D | `#eda100` hổ phách | `#c98500` |
| Max 3D Pro | `#e87ba4` hồng | `#d55181` |

Đây là ô màu 1–5 theo **đúng thứ tự** của bộ tham chiếu, không phải tự chọn. Thứ tự đó chính là cơ
chế an toàn mù màu — một bộ 5 màu tự chọn (xanh/cam/lục/tím/đỏ) đã bị validator đánh trượt: đỏ vs
cam chỉ chênh ΔE 7,1, tím vs xanh trong chế độ tối chỉ 1,9.

Chấm màu trên thanh tab **chỉ tô ở tab đang chọn**. Cho cả 5 chấm mang màu định danh thì 5 màu hiện
đồng thời, và bộ này không đạt ngưỡng khi xét mọi cặp — tệ nhất là hồng vs lục chênh 1,6 ΔE dưới mù
màu deutan, tức nhìn như nhau.

Quy ước áp dụng:
- Một chuỗi dữ liệu → **một màu** cho mọi cột. Tô màu theo giá trị sẽ tiêu phí kênh màu để lặp
  lại điều mà chiều cao cột đã nói.
- Biểu đồ độ lệch giữ cặp màu đối lập (đỏ/xanh) vì ở đó màu mã hoá **dấu**, không phải danh tính.
- Ma trận nhiệt giữ thang xanh đơn sắc: bộ tham chiếu chỉ có thang tuần tự đã kiểm định cho màu
  xanh, không có thang cho các màu còn lại.
- Ma trận nhiệt dùng thang **đơn sắc** (một màu, nhạt → đậm), không dùng cầu vồng.
- Cột chặn ở 24px, bo tròn 4px ở đầu mút dữ liệu và vuông ở đường gốc.
- Lưới kẻ là nét liền mảnh, lùi về sau; chỉ đường kỳ vọng mới dùng nét đứt (vì nó là ngưỡng).
- Mỗi biểu đồ đều có bảng số liệu đi kèm (`<details>`) — biểu đồ không đọc được bằng trình đọc
  màn hình, và tooltip không được phép là đường duy nhất để lấy số.
- Điều hướng bàn phím: ← → để chuyển tab, hoặc để duyệt từng cột khi focus vào biểu đồ.

### Tooltip

Rê chuột vào **cột biểu đồ**, **dòng bảng**, hoặc **ô KPI** đều hiện chú thích. Nội dung tooltip
luôn phải nói thêm điều gì đó, không lặp lại con số đã hiện — với báo cáo này thứ đáng nói thêm
nhất là *con số đó có vượt mức nhiễu ngẫu nhiên hay không*, vì đó mới là điều quyết định nó có
ý nghĩa hay không.

Câu phán quyết còn tính cả **số phép so sánh**. Khi rà 990 cặp số, việc vài cặp vượt 2σ là chắc
chắn xảy ra kể cả với dữ liệu ngẫu nhiên thuần túy — nếu bỏ qua yếu tố này, tooltip sẽ biến một
kết quả bình thường thành "phát hiện đặc biệt".

Ô KPI có `tabindex` nên focus được bằng bàn phím. Dòng bảng thì không: nội dung tooltip của chúng
chỉ là diễn giải suy ra từ chính các ô đang hiển thị, nên không có số liệu nào bị khóa sau thao
tác rê chuột.

## Cách hoạt động

`vietlott.vn` chạy ASP.NET AjaxPro. Trang kết quả phân trang bằng cách POST tới endpoint `/ajaxpro/<WebPart>,Vietlott.PlugIn.WebParts.ashx` kèm header `X-AjaxPro-Method: ServerSideDrawResult`, trả về JSON chứa HTML của trang đó.

Mỗi sản phẩm là một WebPart riêng, và **signature không đồng nhất**:

| Sản phẩm | WebPart | Tham số đặc thù |
|---|---|---|
| Mega 6/45 | `Game645CompareWebPart` | `Key` cố định theo trang, `ArrayNumbers` **6 mảng × 18 ô rỗng** |
| Power 6/55 | `Game655CompareWebPart` | `ArrayNumbers` **5 mảng × 18** |
| Lotto 5/35 | `Game535CompareWebPart` | `ArrayNumbers` **5 mảng × 35** |
| Max 3D | `GameMax3DCompareWebPart` | có `CheckMulti` |
| Max 3D Pro | `GameMax3DProCompareWebPart` | **không** có `CheckMulti` |

`ArrayNumbers` là lưới ô dò số trên giao diện, kích thước **khác nhau từng sản phẩm** — không dùng
chung một lưới được. Sai số lượng hoặc kích thước tham số thì server trả `Error: true` kèm
"Index was outside the bounds of the array", không nói rõ nguyên nhân.

Vietlott còn 2 sản phẩm nữa chưa hỗ trợ: **Bingo18** (`GameBingoCompareWebPart`,
`winning-number-bingo18`) và **Keno** (`GameKenoCompareWebPart`, `winning-number-keno`).
Keno quay ~96 lần/ngày nên dữ liệu rất lớn.

Lưu ý Max 3D Pro có trang và WebPart riêng (`winning-number-max-3dpro`). Truyền `GameId=7` vào WebPart của Max 3D **không** đổi được dữ liệu — nó vẫn trả kết quả Max 3D.

Mỗi request cách nhau 400ms, retry 3 lần với backoff lũy tiến.

## Cấu trúc mã

```
cap-nhat.bat          bấm đôi để tải kỳ mới + mở báo cáo
src/
├── cli.js            điểm vào, phân tích tham số dòng lệnh
├── products.js       cấu hình từng sản phẩm (endpoint, WebPart, khoảng số)
├── http-client.js    gọi AjaxPro + throttle + retry
├── crawler.js        vòng lặp phân trang, dừng sớm ở chế độ bổ sung
├── parse-lotto.js    parse HTML 6/45, 6/55
├── parse-max3d.js    parse HTML Max 3D, Max 3D Pro
├── parse-prize.js    parse bảng giải trên trang chi tiết một kỳ
├── crawl-prizes.js   tải bảng giải cho cửa sổ kỳ gần nhất
├── csv-store.js      đọc/ghi CSV, gộp khử trùng
├── stats-lotto.js    tần suất, khô hạn, cặp số, dải nhiễu ±2σ
├── stats-max3d.js    tần suất bộ số, tần suất chữ số theo vị trí
├── stats-duplicates.js  kiểm tra trùng giải cao nhất giữa các kỳ
├── random-picker.js     sinh dãy ngẫu nhiên (dùng chung cho CLI và trang web)
├── report-picker.js     khối giao diện sinh dãy + nén dữ liệu kỳ cũ
├── report-picker-js.js  phần chạy trên trình duyệt của khối sinh dãy
├── print-stats.js    in bảng ra terminal
├── chart-primitives.js  thang trục, đường bao cột, escape HTML
├── chart-bars.js        biểu đồ cột và cột hai chiều
├── chart-heatmap.js     ma trận nhiệt + chú giải thang màu
├── report-style.js      CSS và bảng màu
├── report-interaction.js  tooltip, hover, bàn phím, chuyển tab, đổi giao diện
├── report-page.js       khung trang, bảng, KPI, cảnh báo
├── report-tips.js       nội dung tooltip cho bảng và ô KPI
├── report-duplicates.js mục kiểm tra giả thuyết trùng kỳ
├── report-sections.js   nội dung từng sản phẩm (dạng mảnh HTML)
├── report-draws.js      cột kết quả các kỳ + bảng giải (cuộn riêng)
└── report-html.js       ghép các mảnh + thanh tab thành 1 file
```

Parse bằng regex thay vì thư viện DOM: markup của vietlott.vn rất đều nên regex là đủ, và giữ được zero dependency. Đổi lại, **nếu vietlott.vn đổi giao diện thì các file `parse-*.js` sẽ hỏng** — đó là chỗ cần sửa đầu tiên khi số kỳ thu về bằng 0.

## Công cụ tự dùng, không liên kết với Vietlott.
