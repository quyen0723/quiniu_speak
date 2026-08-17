# **Báo Cáo Thiết Kế Sản Phẩm Và Hệ Thống: Ứng Dụng Đọc Văn Bản Song Ngữ Cá Nhân (Personal Bilingual TTS Reader)**

## **Tầm Nhìn Sản Phẩm (Product Vision)**

Dự án này hướng tới việc kiến tạo một hệ thống chuyển đổi văn bản thành giọng nói (Text-to-Speech \- TTS) cá nhân hóa, phục vụ nhu cầu nghe đọc văn bản song ngữ (Tiếng Việt và Tiếng Anh) với chất lượng tiệm cận giọng người thật. Tầm nhìn cốt lõi là xây dựng một công cụ tối giản, loại bỏ hoàn toàn sự cồng kềnh của các phần mềm dạng dịch vụ (SaaS) thương mại hiện nay. Thay vì hướng tới việc phục vụ hàng triệu người dùng với các kiến trúc vi dịch vụ (microservices) phức tạp hay hệ thống thanh toán đa tầng, sản phẩm này đặt người dùng cá nhân vào trung tâm của thiết kế. Trọng tâm tuyệt đối được đặt vào tốc độ tương tác, chi phí vận hành tiệm cận mức không (zero-cost), và một trải nghiệm thính giác mượt mà được cá nhân hóa thông qua việc kết hợp giọng đọc AI với nhạc nền tùy chỉnh.

## **Tuyên Bố Vấn Đề (Problem Statement)**

Người dùng cá nhân khi có nhu cầu chuyển đổi các đoạn văn bản dài thành giọng nói thường phải đối mặt với ba rào cản lớn từ các giải pháp hiện có trên thị trường. Thứ nhất, chi phí sử dụng các API chất lượng cao (như OpenAI, ElevenLabs hay Google Cloud TTS) thường rất đắt đỏ khi khối lượng văn bản tăng lên, có thể lên tới hàng đô la cho mỗi giờ âm thanh1. Thứ hai, các ứng dụng mã nguồn mở chạy cục bộ (như Bark hay Tortoise) lại đòi hỏi kiến thức thiết lập phần mềm phức tạp và phần cứng máy tính mạnh mẽ (GPU cao cấp), đồng thời hỗ trợ ngôn ngữ Tiếng Việt rất hạn chế3. Thứ ba, trải nghiệm người dùng (UX) của các nền tảng thương mại thường bị nhồi nhét quá nhiều tính năng quản lý tài khoản, bảng điều khiển (dashboard) phức tạp và giới hạn ký tự khắt khe, làm đứt gãy luồng công việc tự nhiên của người dùng khi họ chỉ đơn giản muốn "dán văn bản và nghe".

## **Đối Tượng Người Dùng (Target User)**

Hệ thống được thiết kế đo ni đóng giày cho một đối tượng duy nhất: Một người dùng cá nhân (Primary User). Sự thu hẹp tập khách hàng này mang lại một lợi thế thiết kế khổng lồ, cho phép loại bỏ toàn bộ các tính năng không mang lại giá trị trực tiếp cho việc nghe đọc văn bản.  
Hệ thống sẽ không bao gồm luồng đăng nhập (Login), đăng ký (Register), xác thực qua mạng xã hội (Social Login), quản lý gói cước (Subscription), tích hợp cổng thanh toán (Payment), hay bảng điều khiển quản trị (Admin Dashboard). Việc áp dụng kiến trúc đa khách hàng (Multi-tenant architecture) cũng bị loại trừ hoàn toàn. Bằng cách định nghĩa tập người dùng là số một (N=1), các quyết định về bảo mật, định tuyến dữ liệu và mở rộng hệ thống (scalability) được đơn giản hóa tối đa, đúng với nguyên tắc "xây dựng hệ thống nhỏ nhất có thể giải quyết tốt vấn đề".

## **Hành Trình Người Dùng (User Journey)**

Hành trình trải nghiệm được thiết kế theo một đường thẳng liền mạch, tối thiểu hóa số lần nhấp chuột (clicks) và độ trễ nhận thức (cognitive load).  
Khi người dùng mở ứng dụng, họ ngay lập tức nhìn thấy một vùng nhập liệu lớn. Hành động đầu tiên là dán (Paste) một đoạn văn bản tiếng Việt hoặc tiếng Anh vào vùng này. Hệ thống hiển thị số lượng từ và ký tự ngay lập tức. Tiếp theo, người dùng có thể điều chỉnh ngôn ngữ và giọng đọc thông qua các trình đơn thả xuống (dropdown) với phản hồi âm thanh xem trước (preview voice) nhanh chóng. Khi người dùng nhấn nút "Generate Speech", một quá trình xử lý ngầm diễn ra, và gần như ngay lập tức, nút "Play" sáng lên báo hiệu âm thanh đã sẵn sàng. Trong quá trình nghe, người dùng có thể tùy ý bấm tạm dừng (Pause), tiếp tục (Resume), hoặc sử dụng thanh trượt để tua tới lui (Seek). Nếu muốn tăng sự tập trung hoặc thư giãn, người dùng gạt nút bật nhạc nền, chọn một bản nhạc Lofi hoặc Piano, và điều chỉnh thanh trượt âm lượng nhạc nền sao cho hài hòa với âm lượng giọng đọc, tạo ra một không gian thính giác hoàn hảo.

## **Yêu Cầu Chức Năng (Functional Requirements)**

Hệ thống phải đáp ứng tập hợp các yêu cầu chức năng sau đây để đảm bảo luồng công việc cốt lõi hoạt động trơn tru:

* **Quản lý văn bản đầu vào:** Cung cấp vùng nhập liệu văn bản lớn, hỗ trợ thao tác dán nhanh, tự động đếm ký tự/số từ và tính năng xóa trắng toàn bộ (Clear) bằng một nút bấm.  
* **Cấu hình Text-to-Speech:** Cho phép người dùng chọn ngôn ngữ giữa Tiếng Việt và Tiếng Anh một cách thủ công. Tương ứng với mỗi ngôn ngữ, cung cấp danh sách các giọng đọc chất lượng cao (nam/nữ) và khả năng điều chỉnh tốc độ đọc.  
* **Trình phát âm thanh (Audio Player):** Cung cấp bộ điều khiển hoàn chỉnh với các chức năng: Phát, Tạm dừng, Tiếp tục, Dừng hẳn, Tua tới, Tua lui, hiển thị thanh tiến trình (Progress bar), thời gian hiện tại (Current time), tổng thời lượng (Duration) và thay đổi âm lượng giọng đọc.  
* **Hệ thống nhạc nền (Background Music):** Tích hợp tính năng trộn âm thanh, cho phép bật/tắt nhạc nền, chọn các bài nhạc có sẵn, lặp lại vô hạn (Loop music) và điều chỉnh âm lượng nhạc độc lập với giọng AI.

## **Yêu Cầu Phi Chức Năng (Non-functional Requirements)**

Việc thiết kế không nhắm tới chuẩn mực doanh nghiệp (enterprise-level), thay vào đó tập trung vào tính thực dụng cá nhân:

* **Hiệu năng (Performance):** Độ trễ tạo âm thanh (Audio generation latency) phải ở mức chấp nhận được, lý tưởng là thời gian chờ dưới 2-3 giây cho đến byte âm thanh đầu tiên (Time-to-First-Byte) kể từ khi nhấn Generate, bất kể văn bản dài hay ngắn5.  
* **Độ tin cậy (Reliability):** Ứng dụng không được phép treo (crash) hoặc tràn bộ nhớ khi người dùng dán các đoạn văn bản rất dài (ví dụ: một chương sách 10.000 từ).  
* **Chi phí (Cost):** Tổng chi phí vận hành hàng tháng phải cực thấp, ưu tiên tuyệt đối các giải pháp miễn phí hoàn toàn (Free).  
* **Khả năng sử dụng (Usability):** Giao diện phải tuân theo nguyên tắc thiết kế trực quan, đảm bảo người dùng mới hiểu toàn bộ cách vận hành chỉ trong vài giây quan sát.  
* **Quyền riêng tư (Privacy):** Người dùng phải nắm rõ và có quyền kiểm soát đối với việc dữ liệu văn bản của họ được xử lý cục bộ hay gửi qua các API bên thứ ba.

## **Phân Định Phạm Vi MVP (MVP Scope) và Tương Lai (Future Scope)**

Để tránh hiện tượng over-engineering, các tính năng được phân chia khắt khe thành các giai đoạn phát triển. Phiên bản Sản phẩm Khả thi Tối thiểu (MVP) chỉ bao gồm những gì thực sự cần thiết để ứng dụng mang lại giá trị.

| Tính Năng | Trạng Thái | Mô Tả / Lý Do |
| :---- | :---- | :---- |
| **Nhập văn bản & Clear** | MVP | Hành động cốt lõi không thể thiếu. |
| **Chọn Tiếng Việt/Anh & Chọn Giọng** | MVP | Đảm bảo chất lượng phát âm đúng ngôn ngữ. |
| **Chuyển đổi TTS & Điều chỉnh tốc độ** | MVP | Cấu hình thính giác cơ bản. |
| **Play/Pause/Resume/Seek** | MVP | Điều khiển luồng phát lại bắt buộc. |
| **Nhạc nền & Điều chỉnh âm lượng** | MVP | Tạo ra trải nghiệm thính giác khác biệt so với các app thông thường. |
| **Tự động nhận diện ngôn ngữ** | V1 | Gắn cờ Optional, yêu cầu thư viện NLP phụ, làm tăng dung lượng tải trang không cần thiết lúc này. |
| **Lịch sử đọc & Bookmark** | V2 | Yêu cầu quản lý state phức tạp hơn và thiết kế UI riêng biệt, không cấp bách cho MVP. |
| **Highlight câu đang đọc** | V2 | Đòi hỏi đồng bộ hóa chính xác giữa tiến trình âm thanh và chỉ mục văn bản (Word/Sentence Timestamps), làm tăng độ phức tạp kỹ thuật đáng kể. |
| **Export MP3 (Mix nhạc \+ Lời)** | Future | Yêu cầu xử lý FFmpeg hoặc Web Audio API rendering phức tạp, trái với mục tiêu đơn giản hóa ban đầu. |
| **File Upload (PDF, EPUB, DOCX)** | Future | Cần các bộ giải mã (parsers) nặng nề, nằm ngoài phạm vi cốt lõi của một hệ thống dán văn bản. |

## **Thiết Kế Trải Nghiệm và Giao Diện Người Dùng (UX/UI Design)**

Triết lý thiết kế UI cho ứng dụng là Tối giản (Minimal), Sạch sẽ (Clean), Hiện đại (Modern) và Thân thiện (Friendly). Ứng dụng hoạt động theo cơ chế Single-Page Application (SPA), không có thanh điều hướng phức tạp, không có pop-up quảng cáo hay menu lồng ghép. Giao diện được thiết kế tương thích với thiết bị di động (Mobile-friendly) thông qua hệ thống lưới phản hồi (responsive grid).  
Bố cục chính được chia thành ba khu vực xếp dọc (Vertical Stack), phản ánh chính xác luồng tư duy của người dùng: Nhập liệu \-\> Cấu hình \-\> Tiêu thụ.

* **Vùng Nhập Liệu (Input Zone):** Một textarea chiếm phần lớn diện tích nửa trên màn hình, với viền mỏng và bo góc nhẹ. Khi focus, viền sẽ đổi màu nhẹ nhàng. Góc dưới bên phải hiển thị bộ đếm ký tự mờ ảo.  
* **Vùng Tương Tác (Action Zone):** Ngay bên dưới là một thanh công cụ ngang (Toolbar) chứa các menu thả xuống phẳng (flat dropdowns) để chọn Ngôn ngữ, Giọng đọc, và Tốc độ. Nút trung tâm "GENERATE SPEECH" được thiết kế to, màu sắc tương phản cao (primary color) để thu hút sự chú ý.  
* **Vùng Phát Nhạc (Playback Zone):** Bao gồm hai track riêng biệt. Track trên dành cho Giọng đọc (Voice) với thanh tiến trình dày dặn, hiển thị thời gian số, cùng các nút Play/Pause và Tua. Track dưới dành cho Nhạc nền (Music) với biểu tượng nốt nhạc, tên bản nhạc hiện tại, và một thanh trượt âm lượng ngang.

Sự tách biệt rõ ràng này giúp người dùng nhận thức ngay lập tức rằng họ có hai luồng âm thanh độc lập có thể kiểm soát, loại bỏ hoàn toàn sự nhầm lẫn thường thấy ở các giao diện bảng điều khiển (dashboard) âm thanh phức tạp.

## **So Sánh Các Nhà Cung Cấp Text-to-Speech (TTS Provider Comparison)**

Việc lựa chọn động cơ TTS quyết định phần lớn sự thành bại của kiến trúc. Dưới đây là phân tích chi tiết dựa trên các tiêu chí: Chất lượng giọng nói (Voice Quality), Chi phí (Cost), Tính khả dụng API (API Availability), Độ trễ (Latency), Mức độ dễ tích hợp (Ease of Integration), và Hỗ trợ Tiếng Việt (Vietnamese Support).

| Nhóm Giải Pháp | Đại Diện Tiêu Biểu | Ưu Điểm Nổi Bật | Hạn Chế / Nhược Điểm | Đánh Giá Hỗ Trợ Tiếng Việt |
| :---- | :---- | :---- | :---- | :---- |
| **Cloud TTS** | OpenAI TTS, Google Cloud TTS, ElevenLabs | Chất lượng âm thanh tiệm cận mức hoàn hảo (Near-human), API cực kỳ ổn định, tài liệu rõ ràng1. | Phụ thuộc kết nối internet, tính phí dựa trên số lượng ký tự hoặc thời lượng sử dụng, dễ vượt ngân sách1. | Rất tốt (Nhiều giọng đọc tự nhiên, xử lý ngữ điệu tốt)1. |
| **Local TTS** | Kokoro-TTS, Piper, MeloTTS | Miễn phí trọn đời, bảo mật tuyệt đối (100% offline), tốc độ suy luận nhanh trên CPU hiện đại (Piper, MeloTTS)4. | Cài đặt môi trường phức tạp (Python, PyTorch), yêu cầu tải xuống các mô hình nặng hàng trăm MB, chất lượng giọng phụ thuộc vào phần cứng6. | Đang phát triển (Kokoro có bản fork Kokoro-Vietnamese tích hợp vig2p nhưng giọng đọc chưa đa dạng bằng Cloud)3. |
| **Free / Low-cost API** | Edge-TTS (Microsoft Edge Engine) | Chất lượng giọng Neural cao cấp tương đương dịch vụ trả phí, hoàn toàn miễn phí, kho giọng đọc khổng lồ, dễ triển khai qua các công cụ mã nguồn mở8. | Là API không chính thức (reverse-engineered) nên có rủi ro bị Microsoft khóa bất cứ lúc nào, yêu cầu internet10. | Xuất sắc (Sở hữu các giọng chuẩn như vi-VN-HoaiMyNeural, vi-VN-NamMinhNeural)11. |

### **Giải Pháp Được Đề Xuất (Recommended TTS)**

Dựa trên nguyên tắc ưu tiên "Đơn giản \-\> Rẻ \-\> Chất lượng", **Edge-TTS** được chọn làm giải pháp chính thức. Công cụ này tận dụng dịch vụ tổng hợp giọng nói trực tuyến của Microsoft Edge, cung cấp chất lượng âm thanh cao cấp mà không yêu cầu API key hay thẻ tín dụng8. Hệ thống cung cấp các giọng đọc Tiếng Việt tự nhiên và hỗ trợ trả về âm thanh định dạng MP3 hoặc WAV dạng luồng (streaming) thông qua các Wrapper mã nguồn mở5. Đây là sự cân bằng hoàn hảo giữa chi phí bằng 0 và trải nghiệm âm thanh hạng nhất.

### **Lựa Chọn Thay Thế (Alternative TTS)**

**Kokoro-TTS (Vietnamese Fork)** là phương án dự phòng số một. Nếu Microsoft thay đổi giao thức khiến Edge-TTS ngừng hoạt động, người dùng có thể ngay lập tức chuyển sang Kokoro-TTS thông qua container Kokoro-FastAPI6. Mô hình này nhỏ gọn (82 triệu tham số), cung cấp API tương thích 100% với chuẩn của OpenAI và đã có cộng đồng phát triển hỗ trợ Tiếng Việt thông qua bộ xử lý ngữ âm vig2p3. Việc tích hợp này đảm bảo hệ thống có vòng đời dài hạn bất chấp các yếu tố ngoại cảnh.

## **Phân Tích Chi Phí (Cost Analysis)**

Chi phí là một trong những ràng buộc khắt khe nhất của dự án. Dưới đây là ước tính chi phí hàng tháng (Monthly Estimated Cost) cho ba kịch bản sử dụng dựa trên kiến trúc đề xuất (Edge-TTS) so với một giải pháp Cloud thương mại như OpenAI TTS.

| Kịch Bản Sử Dụng (Scenario) | Lượng Ký Tự / Tháng | Chi Phí OpenAI TTS (Mức tham chiếu $15/1M ký tự) | Chi Phí Edge-TTS (Đề xuất) | Chi Phí Local Kokoro-TTS (Thay thế) |
| :---- | :---- | :---- | :---- | :---- |
| **Light Usage** (Đọc báo, email ngắn) | 100.000 ký tự | \~$1.50 | **$0** (Free) | $0 |
| **Normal Usage** (Đọc tài liệu, bài viết blog) | 500.000 ký tự | \~$7.50 | **$0** (Free) | $0 |
| **Heavy Personal Usage** (Nghe sách, học ngoại ngữ) | 2.000.000+ ký tự | \~$30.00+ | **$0** (Free) | $0 (Tốn chi phí điện năng máy tính cá nhân) |

Do sử dụng thư viện edge-tts giao tiếp trực tiếp với endpoint miễn phí của Microsoft9, chi phí trên mỗi ký tự (Cost per character) và chi phí trên mỗi yêu cầu (Cost per request) đều bằng 0\. Người dùng không bao giờ phải lo lắng về việc chạm ngưỡng giới hạn (Free tier limits) hay đối mặt với hóa đơn bất ngờ cuối tháng.

## **Kiến Trúc Hệ Thống (System Architecture)**

Nguyên tắc thiết kế cốt lõi là không xây dựng hệ thống enterprise cho một ứng dụng cá nhân, từ chối sự phức tạp của Kubernetes, Autoscaling hay Microservices. Phân tích ba lựa chọn kiến trúc:

* **Option A: Frontend \+ Cloud TTS API.** Giao diện web gọi thẳng lên Google/OpenAI. Rủi ro lộ API Key trong mã nguồn Frontend rất cao, và tốn kém chi phí1.  
* **Option B: Frontend \+ Small Backend \+ Free TTS Provider (Edge-TTS).** Sử dụng một backend nhẹ nhàng (chạy bằng Python FastAPI trên Docker) đóng vai trò trung gian, tiếp nhận yêu cầu từ Frontend và gọi lên dịch vụ Edge-TTS, sau đó trả file âm thanh về5.  
* **Option C: Frontend \+ Local Inference.** Tích hợp mô hình AI bằng WebAssembly để chạy ngay trên trình duyệt, hoặc chạy mô hình Python/PyTorch nặng trên máy tính3. Chất lượng WebAssembly Tiếng Việt hiện tại rất kém, trong khi cài đặt PyTorch đi ngược lại tiêu chí "dễ triển khai".

### **Kiến Trúc Được Chọn (Recommended Architecture)**

**Option B** là kiến trúc tối ưu nhất, bao gồm ba thành phần chính phối hợp nhịp nhàng:

> 1. **Giao Diện Web (Web UI):** Xây dựng dưới dạng Single-Page Application (SPA) không máy chủ, chịu trách nhiệm xử lý văn bản, điều khiển trình phát âm thanh và quản lý logic trộn nhạc nền thời gian thực.  
> 2. **Dịch Vụ TTS Nội Bộ (Small Backend / TTS Service):** Triển khai thông qua một Docker container duy nhất sử dụng image travisvn/openai-edge-tts9. Container này thiết lập một máy chủ FastAPI đóng vai trò dịch các API Call theo chuẩn OpenAI thành các lệnh gọi nội bộ tới máy chủ của Microsoft10, sau đó luân chuyển luồng âm thanh định dạng MP3/WAV về UI5.  
> 3. **Lưu Trữ Cục Bộ (Storage):** Trình duyệt sử dụng IndexedDB để lưu trữ bộ đệm (cache) âm thanh, hoàn toàn loại bỏ nhu cầu về cơ sở dữ liệu truyền thống ở backend.

Sự phân chia trách nhiệm này đảm bảo Frontend luôn nhẹ bén, trong khi Backend hoàn toàn phi trạng thái (stateless), có thể khởi động hoặc tắt đi trong nháy mắt.

## **Kiến Trúc Luồng Dữ Liệu Văn Bản và Âm Thanh (Data Flow & Text-to-Audio Architecture)**

Hệ thống phải xử lý khéo léo tình huống người dùng nhập vào một đoạn văn bản rất dài. Nếu gửi toàn bộ văn bản 5.000 từ lên Edge-TTS trong một request duy nhất, hai vấn đề nghiêm trọng sẽ xảy ra: giới hạn ký tự của API bị vi phạm5, và độ trễ chờ đợi (Time-to-First-Byte) sẽ kéo dài lên đến vài phút, phá hủy hoàn toàn UX. Do đó, kiến trúc xử lý luồng dữ liệu (Data Flow) dựa trên cơ chế phân mảnh (Chunking) và Hàng đợi phát lại (Playback Queue) là bắt buộc.

### **Chiến Lược Phân Mảnh (Chunking Strategy)**

Phân tích các phương pháp phân mảnh:

* **Char limit (Giới hạn ký tự tĩnh):** Cắt ngẫu nhiên cứ mỗi 200 ký tự. Phương pháp này tệ nhất vì nó cắt ngang từ hoặc giữa câu, tạo ra giọng đọc bị đứt quãng, sai ngữ điệu một cách thảm họa.  
* **Paragraph (Theo đoạn văn):** Tốt hơn, nhưng các đoạn văn dài vẫn có thể tạo ra độ trễ cao (hơn 5-10 giây) trước khi người dùng nghe được câu đầu tiên.  
* **Sentence (Theo câu):** Đây là giải pháp hoàn hảo. Hệ thống sử dụng Biểu thức chính quy (Regex) để nhận diện các dấu chấm câu (., ?, \!, ;) làm ranh giới tách văn bản.

Luồng xử lý chi tiết (Flow):

> 1. **Text Preprocessing:** Frontend tiếp nhận chuỗi đầu vào, loại bỏ các ký tự trắng thừa, chuẩn hóa định dạng dòng.  
> 2. **Chunking:** Chia văn bản thành danh sách tuần tự các câu: \[Chunk 1, Chunk 2, ..., Chunk n\].  
> 3. **Hàng Đợi API (Concurrent API Requests):** Frontend thực hiện tối ưu hóa tốc độ bằng cách gọi API song song cho các chunk đầu tiên. Khi Chunk 1 đang được gửi đi, Chunk 2 và Chunk 3 cũng được chuẩn bị để gọi API nền, giảm thiểu tối đa thời gian chờ giữa các câu.  
> 4. **Playback Queue:** Các tệp âm thanh (Audio Segments) trả về dưới dạng Blob được đưa vào hàng đợi tuần tự. Trình phát âm thanh (Audio Player) đăng ký sự kiện onended để ngay khi Chunk 1 kết thúc, Chunk 2 lập tức được phát nối tiếp (gapless playback).

## **Kiến Trúc Trộn Âm Thanh (Audio Mixing Architecture)**

Tính năng kết hợp Giọng đọc (Voice) và Nhạc nền (Background Music) tạo nên giá trị cốt lõi của ứng dụng cá nhân này. Có hai phương pháp thiết kế để đạt được "Final listening experience".

* **Option A: Trộn Thời Gian Thực (Real-time mixing)** tại trình duyệt bằng Web Audio API.  
* **Option B: Trộn Trước (Pre-mix)** tại Backend bằng các công cụ xử lý tệp như FFmpeg trước khi trả về trình duyệt.

So sánh chi tiết:

* **Độ phức tạp (Complexity):** Option B đòi hỏi backend phải quản lý các tệp âm thanh tạm, thực hiện lệnh hệ thống (subprocess) gọi FFmpeg, và tốn tài nguyên tính toán. Option A sử dụng các hàm API tiêu chuẩn có sẵn của HTML5 Web Audio16, không cần cài đặt thêm phần mềm.  
* **Độ trễ (Latency):** Option B tạo ra nút thắt cổ chai lớn vì quá trình render lại âm thanh mất nhiều giây. Option A có độ trễ bằng không.  
* **Trải nghiệm người dùng (UX):** Option A cho phép người dùng thay đổi âm lượng nhạc nền trong lúc đang nghe, và hiệu ứng diễn ra ngay lập tức. Nếu dùng Option B, bất kỳ thay đổi cấu hình nào cũng đòi hỏi tải lại toàn bộ tệp âm thanh từ đầu.

Dựa trên nguyên tắc "không over-engineering", **Option A** được lựa chọn tuyệt đối. Frontend sẽ thiết lập một AudioContext chứa hai luồng: một BufferSource cho nhạc nền (phát lặp vòng loop) và một luồng động cho hệ thống hàng đợi giọng đọc. Hai luồng này đi qua các GainNode độc lập (nút điều chỉnh âm lượng) trước khi được hòa âm và xuất ra thiết bị (AudioDestination)16.

## **Thiết Kế Lưu Trữ Và Bộ Đệm (Storage Design & Caching)**

Vì người dùng có thói quen nghe đi nghe lại các đoạn văn bản (như học từ vựng, nghe bài viết ưa thích), việc gọi lại API TTS cho cùng một văn bản là sự lãng phí băng thông và tạo ra độ trễ vô ích. Một cơ chế bộ đệm (Caching) ở mức Frontend là yêu cầu bắt buộc.

### **Quyết Định Về Cơ Sở Dữ Liệu (Database)**

Hệ thống **không sử dụng Cơ sở dữ liệu truyền thống** (Không có MySQL, PostgreSQL, SQLite hay Redis) trên Backend. Việc thiết lập một Database chỉ để lưu trữ lịch sử cache cho một người dùng cục bộ đi ngược lại tiêu chí "dễ triển khai". Backend hoàn toàn phi trạng thái.

### **Cơ Chế Caching Cục Bộ (IndexedDB)**

Trình duyệt của người dùng sẽ gánh vác trách nhiệm lưu trữ thông qua **IndexedDB**, một API lưu trữ NoSQL cục bộ vô cùng mạnh mẽ, có khả năng chứa hàng trăm Megabytes dữ liệu nhị phân (Binary Blobs) mà không làm tắc nghẽn bộ nhớ như localStorage. Thư viện localForage được khuyến nghị sử dụng để bọc IndexedDB thành các Promise dễ thao tác.  
**Luồng Caching:**

> 1. **Hash Generation:** Hàm băm mã hóa SHA-256 biến chuỗi nhận diện (Chunk Text \+ Language \+ Voice ID \+ Speed) thành một mã khóa duy nhất (Unique Key).  
> 2. **Cache Lookup:** Hệ thống truy vấn IndexedDB với Key trên.  
   * *Trường hợp CÓ (YES):* Truy xuất trực tiếp đối tượng Blob âm thanh, gửi vào hàng đợi phát (Tốc độ mili-giây, bypass mạng).  
   * *Trường hợp KHÔNG (NO):* Gọi API TTS, tải Blob về, lưu vào IndexedDB với Key đã tạo, rồi gửi vào hàng đợi phát.

## **Quyền Riêng Tư Và Bảo Mật (Privacy & Security)**

Dù ứng dụng chỉ phục vụ duy nhất bản thân kỹ sư phát triển, các ranh giới bảo mật và quyền riêng tư vẫn phải được đánh giá minh bạch.

### **Rủi Ro Về Quyền Riêng Tư (Privacy Implications)**

Văn bản đầu vào **được gửi tới một API của bên thứ ba** (Third-party TTS API) là hạ tầng đám mây của Microsoft thông qua thư viện edge-tts4. Mặc dù hệ thống không lưu vết (logging) tại Backend nội bộ của người dùng, không thể khẳng định chắc chắn 100% rằng Microsoft không lưu trữ tạm thời hoặc phân tích các đoạn văn bản này để cải thiện dịch vụ của họ.

* **Giải pháp ứng phó:** Người dùng phải tự ý thức phân loại dữ liệu. Ứng dụng này lý tưởng cho việc đọc báo, tài liệu học thuật, tiểu thuyết. Tuyệt đối không dán các thông tin định danh cá nhân nhạy cảm (PII), mật khẩu, mã nguồn công ty, hay tài liệu pháp lý nội bộ. Nếu có nhu cầu cao về privacy, phải chuyển thiết lập sang sử dụng Kokoro-TTS cục bộ (Local inference)6.

### **Bảo Mật Hệ Thống (Security)**

Ứng dụng cá nhân không cần hệ thống chống DDoS tinh vi (rate limiting phức tạp) hay tường lửa chuyên dụng, nhưng phải khóa các lỗ hổng cơ bản:

* **API Key Exposure:** Bằng cách sử dụng Edge-TTS qua một backend Docker nội bộ, hệ thống không đòi hỏi API Key. Nếu sau này chuyển sang sử dụng OpenAI thực sự, API Key sẽ được truyền thông qua biến môi trường (Environment Variables) .env ở Backend, đảm bảo mã nguồn Frontend hoàn toàn "sạch" và không làm lộ bí mật9.  
* **XSS (Cross-Site Scripting):** Mọi văn bản dán vào hệ thống đều được xem là untrusted input. Tuy nhiên, việc sử dụng các framework hiện đại như React xử lý việc binding dữ liệu ({text}) thay vì render HTML thô (innerHTML) sẽ vô hiệu hóa hoàn toàn các kịch bản mã độc nhúng trong văn bản.  
* **Ngăn chặn Abuse:** Container Backend chỉ lắng nghe ở địa chỉ localhost:5050 (hoặc 127.0.0.1), cô lập hoàn toàn hệ thống khỏi mạng Internet công cộng9.

## **Giao Diện Lập Trình Ứng Dụng (API Design)**

Backend cung cấp một giao diện API tối thiểu. Đặc biệt, để tối đa hóa tính linh hoạt, API được thiết kế dựa trên tiêu chuẩn /v1/audio/speech của OpenAI9. Sự tương thích này là một "nước cờ" kiến trúc chiến lược: nó cho phép Frontend giao tiếp với Backend Edge-TTS, Kokoro-FastAPI14, hoặc cả OpenAI thực sự1 mà không cần sửa một dòng mã nào ở trình duyệt.  
**Endpoint:** POST http://localhost:5050/v1/audio/speech  
\[cite: 9, 15\]  
**Request Payload:**

JSON  
{  
  "model": "tts-1",  
  "input": "Xin chào, tôi là trợ lý AI ảo của bạn.",  
  "voice": "vi-VN-HoaiMyNeural",  
  "response\_format": "mp3",  
  "speed": 1.0  
}

**Response:**

* Hệ thống phản hồi lại dữ liệu âm thanh dạng nhị phân luồng (Audio Binary Stream \- audio/mpeg hoặc audio/wav), giúp tiết kiệm bộ nhớ cho Backend và đẩy âm thanh xuống Frontend trong thời gian thực10. Nếu hệ thống gặp lỗi, nó sẽ trả về mã trạng thái HTTP tiêu chuẩn (như 400 Bad Request, 500 Internal Error) kèm theo JSON mô tả lỗi chi tiết15.

## **Lựa Chọn Ngăn Xếp Công Nghệ (Technology Stack)**

Ngăn xếp công nghệ được lựa chọn cẩn thận nhằm giảm thiểu tối đa "Implementation effort" (công sức triển khai).

* **Frontend:**  
  * **React \+ Vite:** Mang lại tốc độ khởi động cực nhanh và trải nghiệm phát triển mượt mà. TypeScript được sử dụng để kiểm soát chặt chẽ các kiểu dữ liệu của hàm băm và hàng đợi âm thanh.  
  * **Tailwind CSS:** Loại bỏ nhu cầu viết CSS tùy chỉnh dài dòng, cho phép thiết kế giao diện theo phong cách tối giản chỉ bằng các utility classes trực tiếp trong JSX.  
  * **Web Audio API (HTML5):** Xử lý luồng âm thanh native16.  
  * **localForage:** Giao tiếp với IndexedDB để làm caching.  
* **Backend:**  
  * Không yêu cầu lập trình Node.js hay FastAPI từ đầu. Giải pháp tận dụng Image Docker có sẵn: travisvn/openai-edge-tts9. Image này sử dụng Python, gói gọn thư viện edge-tts thành một API hoàn chỉnh, đã tối ưu hóa xử lý lỗi và hỗ trợ nhiều định dạng âm thanh (mp3, wav)9.  
* **Cơ sở hạ tầng & Lưu trữ (Infrastructure & Storage):**  
  * Docker Desktop (cho Windows/Mac) hoặc Colima/Docker Engine (cho Linux).  
  * Trình duyệt lưu trữ Cache nội bộ. Hệ thống không sử dụng Filesystem lưu trữ âm thanh vĩnh viễn, tránh lãng phí ổ cứng.

## **Đánh Giá Đánh Đổi (Trade-offs)**

Mọi kiến trúc đều là sự thỏa hiệp. Dự án này chấp nhận các đánh đổi sau:

* **Hy sinh Tính Toàn vẹn Lập lịch Ngữ điệu (Prosody Integrity) đổi lấy Tốc độ (Speed):** Bằng cách cắt văn bản thành các câu riêng lẻ (chunking) để gọi API, ngữ điệu (intonation) giữa các câu có thể không hoàn toàn liền mạch tự nhiên như khi xử lý toàn bộ đoạn văn. Tuy nhiên, điều này mang lại tốc độ phát lại gần như tức thì, điều mà một ứng dụng cá nhân ưu tiên hơn so với tính chuẩn xác của studio.  
* **Hy sinh Quyền Riêng Tư Ngoại Tuyến (Offline Privacy) đổi lấy Dung Lượng Nhỏ & Chất Lượng Cao:** Việc dùng Edge-TTS buộc thiết bị phải có kết nối mạng để gửi chữ đi4, nhưng đổi lại không bắt máy tính cá nhân phải tải về hàng chục Gigabytes dung lượng mô hình âm thanh nặng nề.

## **Kế Hoạch Triển Khai Step-by-Step (Implementation Plan)**

Kế hoạch này cung cấp lộ trình thực thi từ số 0 đến hệ thống hoàn thiện, thiết kế cho một kỹ sư thực hiện trong thời gian ngắn (ước tính 3-5 ngày).

### **Step 1: Project Setup (Thiết lập cơ sở)**

* *Mục tiêu:* Có nền tảng Backend chạy thành công và Frontend kết nối được.  
* *Implementation:* Tạo tệp docker-compose.yml định nghĩa service sử dụng travisvn/openai-edge-tts:latest ánh xạ cổng 50509. Cấu hình REQUIRE\_API\_KEY=False trong file .env cục bộ. Chạy npm create vite@latest để tạo khung dự án React.  
* *Expected Output:* Docker container đang chạy; Frontend React hiển thị trang chào mừng trên localhost:5173.  
* *Acceptance Criteria:* Gọi lệnh cURL tới localhost:5050/v1/audio/speech và nhận lại tệp MP3.

### **Step 2: Build Text Input (Khung nhập liệu)**

* *Mục tiêu:* Thiết kế UI cho thao tác dán văn bản và chọn cấu hình cơ bản.  
* *Implementation:* Sử dụng Tailwind CSS tạo một \<textarea\> chiếm 50% màn hình, tích hợp các bộ đếm trạng thái useState (Text Count). Thiết kế ba dropdown: Ngôn ngữ, Giọng đọc, Tốc độ.  
* *Expected Output:* Giao diện nhập liệu sạch sẽ, phản hồi tức thời số lượng ký tự.  
* *Acceptance Criteria:* Textarea hoạt động mượt mà ngay cả khi dán vào đoạn văn 20.000 từ. Nút Clear xóa hoàn toàn nội dung.

### **Step 3: Integrate TTS (Tích hợp luồng API)**

* *Mục tiêu:* Chuyển chuỗi văn bản thành dữ liệu Blob âm thanh.  
* *Implementation:* Viết một hàm fetchTTSAudio(text, voice, speed) gửi POST request (dạng JSON) lên cổng 5050, nhận arraybuffer và chuyển nó thành Blob9.  
* *Expected Output:* Logic kết nối mạng hoàn thiện. Nhấn nút "Generate" có thể log ra URL Blob của âm thanh.  
* *Acceptance Criteria:* Quản lý đúng các trạng thái loading, success, error. Hiển thị thông báo nếu API bị sập.

### **Step 4: Caching (Bộ nhớ đệm thông minh)**

* *Mục tiêu:* Lưu trữ âm thanh, tiết kiệm tài nguyên và băng thông.  
* *Implementation:* Cài đặt localforage. Viết hàm wrapper: tạo mã hash SHA-256 từ thông số đầu vào. Kiểm tra IndexedDB trước khi gọi fetchTTSAudio(). Nếu gọi API thành công, ghi đè Blob vào IndexedDB.  
* *Expected Output:* Khả năng lưu cache hoàn thiện, không ảnh hưởng UX.  
* *Acceptance Criteria:* Bấm Generate lần một (tốn thời gian gọi mạng). Bấm Generate lần hai (với cùng nội dung), hệ thống xuất Blob ngay lập tức mà không có request mạng nào phát sinh.

### **Step 5: Chunking & Audio Player (Phân mảnh & Trình phát)**

* *Mục tiêu:* Xử lý mượt mà văn bản siêu dài bằng hàng đợi phát.  
* *Implementation:* Cài đặt thuật toán Regex chia đoạn theo dấu câu (., ?, \!). Xây dựng lớp AudioQueueManager bằng TypeScript để quản lý mảng các Blobs. Khi chunk n kết thúc (dựa trên event onended), tự động nạp Blob n+1 vào thẻ \<audio\>.  
* *Expected Output:* Một hệ thống trình phát liên tục.  
* *Acceptance Criteria:* Có thể phát đoạn văn bản dài 100 câu mượt mà, không bị khựng giữa chừng.

### **Step 6: Pause/Resume/Seek (Điều khiển nâng cao)**

* *Mục tiêu:* Cho phép người dùng toàn quyền điều khiển thời gian phát.  
* *Implementation:* Kết nối các nút UI (Play, Pause, Forward, Backward) với API của thẻ \<audio\>. Việc tua (seek) đòi hỏi tính toán ước lượng vị trí tương đối của ký tự dựa trên tổng tỷ lệ tiến trình, sau đó định vị lại index của Chunk trong Hàng đợi.  
* *Expected Output:* Nút Pause hoạt động. Thanh tiến trình trượt theo thời gian thực.  
* *Acceptance Criteria:* Nhấn Pause âm thanh dừng lập tức; Nhấn Resume phát tiếp không bị lỗi giật. Tua tới 50% văn bản, hệ thống ngắt chunk hiện tại và nhảy tới chunk tương ứng một cách chính xác.

### **Step 7: Background Music & Audio Mixing (Hòa âm)**

* *Mục tiêu:* Hoàn thiện trải nghiệm thính giác "Nghe AI đọc cùng nhạc nền".  
* *Implementation:* Đặt sẵn 2-3 bài nhạc Lofi mp3 trong thư mục public. Khởi tạo AudioContext. Tạo MediaElementAudioSourceNode từ \<audio\> nhạc nền, nối qua GainNode (để chỉnh volume), rồi nối ra destination16.  
* *Expected Output:* Nhạc nền phát lặp song song với lời đọc.  
* *Acceptance Criteria:* Trượt thanh volume nhạc nền sẽ thay đổi âm lượng nhạc ngay lập tức mà không làm ảnh hưởng đến âm lượng của giọng đọc AI.

## **Chiến Lược Kiểm Thử (Testing Strategy)**

Việc viết test script tự động là không cần thiết, nhưng một danh sách các Test Cases thủ công cần được thực hiện nghiêm ngặt để đảm bảo sự bền bỉ của ứng dụng.

| Hạng Mục | Kịch Bản Kiểm Thử (Test Cases) | Hành Vi Mong Đợi (Expected Outcome) |
| :---- | :---- | :---- |
| **Văn Bản Đầu Vào** | Dán văn bản trống (Empty text) | Nút "Generate Speech" bị mờ (disabled). |
|  | Dán đoạn văn bản khổng lồ (20.000 từ) | Giao diện không bị treo, bộ đếm ký tự cập nhật, Chunking chia nhỏ văn bản trong dưới 50ms. |
|  | Văn bản đầy ký tự đặc biệt, dấu câu hỗn loạn | Thuật toán Regex nhận diện dấu an toàn, API Edge-TTS không báo lỗi. |
| **Hệ Thống TTS** | Đổi ngôn ngữ sang Tiếng Việt | Giọng mặc định đổi thành vi-VN-NamMinhNeural hoặc tương tự1. Âm thanh phát ra tròn vành, rõ chữ. |
|  | Tắt Docker (API Error/Timeout) | Hệ thống hiển thị thông báo "Không kết nối được dịch vụ TTS", không bị treo cục bộ. |
| **Trình Phát (Player)** | Bấm Play / Pause liên tục 10 lần | Âm thanh phản hồi ngay, không bị chồng chéo luồng âm (Audio overlapping). |
|  | Đổi tốc độ đọc (Speed 1.5x) | Edge-TTS nhận dạng tham số speed9, trả về âm thanh có nhịp điệu nhanh tương ứng. |
| **Hệ Thống Nhạc Nền** | Bật nhạc (Music Enable) | Nhạc tự động phát, lặp lại khi hết bài (Loop \= true)16. |
|  | Chỉnh cân bằng âm lượng (Volume Balance) | Kéo Volume lời xuống 0, Volume nhạc 100 \-\> Chỉ nghe nhạc. Hai luồng không ảnh hưởng lẫn nhau. |

## **Chiến Lược Triển Khai (Deployment Strategy)**

Là một ứng dụng cá nhân, hệ thống không cần được triển khai lên Vercel, AWS hay bất kỳ dịch vụ Cloud nào. Chiến lược triển khai bao gồm:

> 1. Đóng gói toàn bộ Frontend bằng lệnh npm run build của Vite.  
> 2. Chứa thư mục tĩnh dist và một file docker-compose.yml chung vào một thư mục gốc.  
> 3. Tạo thêm một service Caddy/Nginx trong docker-compose.yml để phục vụ Frontend tĩnh.  
> 4. Tại bất kỳ máy tính cá nhân nào, người dùng chỉ cần gõ docker compose up \-d, sau đó mở trình duyệt truy cập localhost:8080. Mọi thứ (Frontend, TTS Backend) sẽ hoạt động tức thì, tự động khởi động cùng hệ điều hành.

## **Rủi Ro Kỹ Thuật (Risks)**

Đánh giá 3 rủi ro lớn nhất và kịch bản đối phó:

> 1. **Giao thức của Microsoft thay đổi (Microsoft API Breakage):**  
   * *Mô tả:* Edge-TTS phụ thuộc vào việc gọi ngầm API dịch vụ của trình duyệt Edge. Nếu Microsoft thắt chặt bảo mật hoặc đổi giao thức WebSocket nội bộ, toàn bộ luồng TTS sẽ sập10.  
   * *Đối phó:* Kiến trúc tuân thủ chuẩn API OpenAI là phao cứu sinh9. Người dùng ngay lập tức có thể thay thế dòng image travisvn/openai-edge-tts bằng image của Kokoro-FastAPI (chạy local 100%) hoặc OpenAI API thật, hệ thống hồi sinh mà không cần sửa Frontend14.  
> 2. **Lỗ hổng ghép nối âm thanh (Chunking Audio Gap):**  
   * *Mô tả:* Khi hệ thống phát nối tiếp hai tệp MP3 riêng biệt (2 chunks), trình duyệt có thể mất vài mili-giây để giải mã thẻ \<audio\> tiếp theo, tạo ra một tiếng "cạch" nhỏ hoặc độ trễ nhẹ giữa các câu, làm mất tính tự nhiên.  
   * *Đối phó:* Nâng cấp logic ở V1: Sử dụng Web Audio API để chuyển các Blobs MP3 thành bộ đệm (AudioBuffers) trong bộ nhớ, cho phép phát liền mạch theo chuỗi thời gian chính xác xác định (Precise scheduling) thay vì dựa vào sự kiện onended kém ổn định của thẻ \<audio\>.  
> 3. **Phình to dung lượng trình duyệt (IndexedDB Bloat):**  
   * *Mô tả:* Liên tục lưu Cache cho các đoạn văn bản dài có thể khiến dung lượng IndexedDB phình to bất thường, cảnh báo hết dung lượng đĩa ảo.  
   * *Đối phó:* Thiết lập một thói quen xóa cache thủ công hoặc viết thêm một hàm dọn rác (Garbage Collector) chạy ngầm lúc khởi động ứng dụng, tự động xóa các Blobs cũ hơn 14 ngày.

## **Khuyến Nghị Cuối Cùng (Final Recommendation)**

Trả lời dứt điểm 7 câu hỏi then chốt theo quy tắc ra quyết định (Quy tắc số 24):

> 1. **Recommended Product (Ứng dụng nên được xây dựng như thế nào?):** Xây dựng một Single-Page Application theo chuẩn tối giản. Giao diện chia ba vùng tĩnh (Văn bản \-\> Nút hành động \-\> Trình phát âm thanh độc lập & Trình phát nhạc nền). Loại bỏ mọi tính năng quản lý, phân trang, đăng nhập.  
> 2. **Recommended TTS (Dùng model/service nào?):** Dùng **Edge-TTS** để tổng hợp tiếng Việt và tiếng Anh9. Nó thỏa mãn hoàn hảo tiêu chí: giọng tự nhiên, tốc độ cao, đa ngôn ngữ, không yêu cầu GPU và không tốn chi phí (Free).  
> 3. **Recommended Architecture (Kiến trúc thế nào?):** Kiến trúc 3 trụ cột: Frontend bằng React/Web Audio xử lý việc trộn âm thanh và hàng đợi; một Backend Docker cực nhỏ (image mở sẵn có) làm proxy chuyển tiếp yêu cầu tới máy chủ Edge; và IndexedDB cục bộ của trình duyệt làm cơ sở dữ liệu lưu cache.  
> 4. **Estimated Cost (Chi phí dự kiến?):$0/tháng**. Không tốn chi phí máy chủ vì chạy trên máy cá nhân, không tốn chi phí API vì dùng công cụ miễn phí, không tốn chi phí cơ sở dữ liệu.  
> 5. **MVP Scope (Chính xác những feature nào?):** Nhập văn bản, chọn ngôn ngữ/giọng, chuyển đổi TTS thông qua cơ chế phân mảnh (Chunking), lưu cache, trình phát (Play, Pause, Resume, Seek) và khả năng bật/tắt/chỉnh âm lượng một bản nhạc nền mp3.  
> 6. **Implementation Time (Ước tính bao lâu?):** Trong điều kiện tập trung cao độ, 1 kỹ sư có thể hoàn tất từ khâu tạo khung dự án, thiết kế UI, kết nối Docker, lập trình hàng đợi âm thanh và hoàn thiện logic trộn nhạc nền trong khoảng **3 đến 5 ngày làm việc**.  
> 7. **Biggest Risks (3 rủi ro lớn nhất?):** Một là rủi ro bị khóa giao thức từ phía Microsoft10. Hai là rủi ro về độ giật cục âm thanh giữa các mảnh ghép văn bản nếu xử lý hàng đợi thiếu chính xác. Ba là nguy cơ người dùng dán vào các thông tin mật cá nhân, vô tình gửi lên hạ tầng mạng đám mây.

**Tại sao lại chọn kiến trúc này?** Thay vì đâm đầu vào một hệ thống "to và xịn", chúng ta sử dụng một chiến lược kết hợp tài nguyên cực kỳ khôn ngoan. Bằng cách dùng Docker gói sẵn một dịch vụ TTS9, bạn né được hàng giờ đồng hồ cấu hình môi trường ngôn ngữ lập trình phức tạp. Bằng cách dùng Web Audio API của trình duyệt16, bạn biến ngay chiếc laptop cá nhân thành một bộ hòa âm thời gian thực xuất sắc mà không cần cài phần mềm nặng như FFmpeg. Bằng cách bắt chước chuẩn giao tiếp của OpenAI, bạn giữ lại sự kiểm soát thiết kế hoàn hảo: hôm nay ứng dụng dùng Edge-TTS miễn phí, ngày mai nếu muốn, chỉ cần thay URL và đổi mã khóa là ứng dụng đột nhiên có sức mạnh của các mô hình AI đắt tiền nhất thế giới mà không cần viết lại mã nguồn giao diện14. Kiến trúc này thỏa mãn 100% nguyên tắc: đơn giản, rẻ, cực kỳ dễ dùng và hoàn toàn phù hợp để tự động hóa một nhu cầu rất cá nhân.

#### **Works cited**

> 1. GitHub \- phuc-nt/my-translator: Real-time speech translation — macOS & Windows, free TTS, no server, your API keys only, [https://github.com/phuc-nt/my-translator](https://github.com/phuc-nt/my-translator)  
> 2. Google Cloud Text-to-Speech Pricing 2026 \- Capterra, [https://www.capterra.com/p/253632/Google-Cloud-Text-to-Speech/pricing/](https://www.capterra.com/p/253632/Google-Cloud-Text-to-Speech/pricing/)  
> 3. anphunl/Kokoro-Vietnamese \- Hugging Face, [https://huggingface.co/anphunl/Kokoro-Vietnamese](https://huggingface.co/anphunl/Kokoro-Vietnamese)  
> 4. Self-Hosted TTS in 2026: Run Your Own AI Voice Server \- OfflineTTS, [https://offlinetts.com/blog/self-hosted-tts-guide-2026/](https://offlinetts.com/blog/self-hosted-tts-guide-2026/)  
> 5. Professional Text-to-Speech API built using Microsoft Edge TTS. · GitHub, [https://github.com/rsuppersahabatan/Edge-TTS-API](https://github.com/rsuppersahabatan/Edge-TTS-API)  
> 6. Kokoro FastAPI \- Self Hosted Text to Speech Platform Installation Guide \- Noted, [https://noted.lol/kokoro-fastapi/](https://noted.lol/kokoro-fastapi/)  
> 7. contextboxai/Kokoro-Vietnamese \- Hugging Face, [https://huggingface.co/contextboxai/Kokoro-Vietnamese](https://huggingface.co/contextboxai/Kokoro-Vietnamese)  
> 8. GitHub \- rany2/edge-tts: Use Microsoft Edge's online text-to-speech service from Python WITHOUT needing Microsoft Edge or Windows or an API key, [https://github.com/rany2/edge-tts](https://github.com/rany2/edge-tts)  
> 9. travisvn/openai-edge-tts: Free, high-quality text-to-speech API endpoint to replace OpenAI, Azure, or ElevenLabs · GitHub, [https://github.com/travisvn/openai-edge-tts](https://github.com/travisvn/openai-edge-tts)  
> 10. Giving AI a Voice: A Deep Dive into the Edge-TTS MCP Server \- Skywork, [https://skywork.ai/skypage/en/ai-voice-edge-tts/1980156769687162880](https://skywork.ai/skypage/en/ai-voice-edge-tts/1980156769687162880)  
> 11. trananhtung/vietnamese-text-to-speech: Ứng dụng web tạo audio tiếng Việt từ văn bản. \- GitHub, [https://github.com/trananhtung/vietnamese-text-to-speech](https://github.com/trananhtung/vietnamese-text-to-speech)  
> 12. list of voices available in Edge TTS.txt \- GitHub Gist, [https://gist.github.com/BettyJJ/17cbaa1de96235a7f5773b8690a20462](https://gist.github.com/BettyJJ/17cbaa1de96235a7f5773b8690a20462)  
> 13. Edge TTS MCP \- Cho Claude một Giọng Nói\! \- LobeHub, [https://lobehub.com/vi-VN/mcp/s-n-n-edge-tts-mcp](https://lobehub.com/vi-VN/mcp/s-n-n-edge-tts-mcp)  
> 14. Kokoro-FastAPI Using Docker \- Open WebUI, [https://docs.openwebui.com/features/chat-conversations/audio/text-to-speech/Kokoro-FastAPI-integration/](https://docs.openwebui.com/features/chat-conversations/audio/text-to-speech/Kokoro-FastAPI-integration/)  
> 15. Text-to-Speech | Osaurus Docs, [https://docs.osaurus.ai/text-to-speech](https://docs.osaurus.ai/text-to-speech)  
> 16. Using the Web Audio API \- MDN Web Docs, [https://developer.mozilla.org/en-US/docs/Web/API/Web\_Audio\_API/Using\_Web\_Audio\_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API)