export const BERRY_ITEMS = [
  // --- NHÓM HỒI PHỤC TRẠNG THÁI (STATUS CURES) ---
  { id: 1, name: "cheri-berry", label: "Cheri Berry", category: "berry", cost: 20, effect: "Giải trạng thái Tê liệt (Paralysis)." },
  { id: 2, name: "chesto-berry", label: "Chesto Berry", category: "berry", cost: 20, effect: "Giải trạng thái Ngủ (Sleep)." },
  { id: 3, name: "pecha-berry", label: "Pecha Berry", category: "berry", cost: 20, effect: "Giải trạng thái Trúng độc (Poison)." },
  { id: 4, name: "rawst-berry", label: "Rawst Berry", category: "berry", cost: 20, effect: "Giải trạng thái Bỏng (Burn)." },
  { id: 5, name: "aspear-berry", label: "Aspear Berry", category: "berry", cost: 20, effect: "Giải trạng thái Đóng băng (Frozen)." },
  { id: 6, name: "leppa-berry", label: "Leppa Berry", category: "berry", cost: 50, effect: "Hồi 10 PP cho một chiêu thức." },
  { id: 7, name: "oran-berry", label: "Oran Berry", category: "berry", cost: 20, effect: "Hồi 10 HP khi máu xuống thấp." },
  { id: 8, name: "persim-berry", label: "Persim Berry", category: "berry", cost: 20, effect: "Giải trạng thái Bối rối (Confusion)." },
  { id: 9, name: "lum-berry", label: "Lum Berry", category: "berry", cost: 100, effect: "Giải tất cả mọi loại trạng thái xấu." },
  { id: 10, name: "sitrus-berry", label: "Sitrus Berry", category: "berry", cost: 80, effect: "Hồi 25% HP tối đa khi máu xuống thấp." },

  // --- NHÓM GIẢM EV (TRAINING) ---
  { id: 11, name: "pomeg-berry", label: "Pomeg Berry", category: "berry", cost: 20, effect: "Giảm HP EV, tăng độ thân mật." },
  { id: 12, name: "kelpsy-berry", label: "Kelpsy Berry", category: "berry", cost: 20, effect: "Giảm Attack EV, tăng độ thân mật." },
  { id: 13, name: "qualot-berry", label: "Qualot Berry", category: "berry", cost: 20, effect: "Giảm Defense EV, tăng độ thân mật." },
  { id: 14, name: "hondew-berry", label: "Hondew Berry", category: "berry", cost: 20, effect: "Giảm Sp. Atk EV, tăng độ thân mật." },
  { id: 15, name: "grepa-berry", label: "Grepa Berry", category: "berry", cost: 20, effect: "Giảm Sp. Def EV, tăng độ thân mật." },
  { id: 16, name: "tamato-berry", label: "Tamato Berry", category: "berry", cost: 20, effect: "Giảm Speed EV, tăng độ thân mật." },

  // --- NHÓM KHÁNG HỆ (TYPE-REDUCTION) ---
  { id: 17, name: "occa-berry", label: "Occa Berry", category: "berry", cost: 80, effect: "Giảm sát thương từ đòn hệ Lửa siêu hiệu quả." },
  { id: 18, name: "passho-berry", label: "Passho Berry", category: "berry", cost: 80, effect: "Giảm sát thương từ đòn hệ Nước siêu hiệu quả." },
  { id: 19, name: "wacan-berry", label: "Wacan Berry", category: "berry", cost: 80, effect: "Giảm sát thương từ đòn hệ Điện siêu hiệu quả." },
  { id: 20, name: "rindo-berry", label: "Rindo Berry", category: "berry", cost: 80, effect: "Giảm sát thương từ đòn hệ Cỏ siêu hiệu quả." },
  { id: 21, name: "yache-berry", label: "Yache Berry", category: "berry", cost: 80, effect: "Giảm sát thương từ đòn hệ Băng siêu hiệu quả." },
  { id: 22, name: "chople-berry", label: "Chople Berry", category: "berry", cost: 80, effect: "Giảm sát thương từ đòn hệ Võ sĩ siêu hiệu quả." },
  { id: 23, name: "kebia-berry", label: "Kebia Berry", category: "berry", cost: 80, effect: "Giảm sát thương từ đòn hệ Độc siêu hiệu quả." },
  { id: 24, name: "shuca-berry", label: "Shuca Berry", category: "berry", cost: 80, effect: "Giảm sát thương từ đòn hệ Đất siêu hiệu quả." },
  { id: 25, name: "coba-berry", label: "Coba Berry", category: "berry", cost: 80, effect: "Giảm sát thương từ đòn hệ Bay siêu hiệu quả." },
  { id: 26, name: "payapa-berry", label: "Payapa Berry", category: "berry", cost: 80, effect: "Giảm sát thương từ đòn hệ Siêu linh siêu hiệu quả." },
  { id: 27, name: "tanga-berry", label: "Tanga Berry", category: "berry", cost: 80, effect: "Giảm sát thương từ đòn hệ Bọ siêu hiệu quả." },
  { id: 28, name: "charti-berry", label: "Charti Berry", category: "berry", cost: 80, effect: "Giảm sát thương từ đòn hệ Đá siêu hiệu quả." },
  { id: 29, name: "kasib-berry", label: "Kasib Berry", category: "berry", cost: 80, effect: "Giảm sát thương từ đòn hệ Ma siêu hiệu quả." },
  { id: 30, name: "haban-berry", label: "Haban Berry", category: "berry", cost: 80, effect: "Giảm sát thương từ đòn hệ Rồng siêu hiệu quả." },
  { id: 31, name: "colbur-berry", label: "Colbur Berry", category: "berry", cost: 80, effect: "Giảm sát thương từ đòn hệ Bóng tối siêu hiệu quả." },
  { id: 32, name: "babiri-berry", label: "Babiri Berry", category: "berry", cost: 80, effect: "Giảm sát thương từ đòn hệ Thép siêu hiệu quả." },
  { id: 33, name: "chilan-berry", label: "Chilan Berry", category: "berry", cost: 80, effect: "Giảm sát thương từ đòn hệ Thường." },
  { id: 34, name: "roseli-berry", label: "Roseli Berry", category: "berry", cost: 80, effect: "Giảm sát thương từ đòn hệ Tiên siêu hiệu quả." },

  // --- NHÓM HỒI PHỤC THEO VỊ (PINCH BERRIES) ---
  { id: 35, name: "figy-berry", label: "Figy Berry", category: "berry", cost: 50, effect: "Hồi 33% HP. Gây bối rối nếu Pokemon ghét vị Cay." },
  { id: 36, name: "wiki-berry", label: "Wiki Berry", category: "berry", cost: 50, effect: "Hồi 33% HP. Gây bối rối nếu Pokemon ghét vị Chát." },
  { id: 37, name: "mago-berry", label: "Mago Berry", category: "berry", cost: 50, effect: "Hồi 33% HP. Gây bối rối nếu Pokemon ghét vị Ngọt." },
  { id: 38, name: "aguav-berry", label: "Aguav Berry", category: "berry", cost: 50, effect: "Hồi 33% HP. Gây bối rối nếu Pokemon ghét vị Đắng." },
  { id: 39, name: "iapapa-berry", label: "Iapapa Berry", category: "berry", cost: 50, effect: "Hồi 33% HP. Gây bối rối nếu Pokemon ghét vị Chua." },

  // --- NHÓM TĂNG CHỈ SỐ KHI NGUY CẤP ---
  { id: 40, name: "liechi-berry", label: "Liechi Berry", category: "berry", cost: 200, effect: "Tăng Attack khi HP dưới 25%." },
  { id: 41, name: "ganlon-berry", label: "Ganlon Berry", category: "berry", cost: 200, effect: "Tăng Defense khi HP dưới 25%." },
  { id: 42, name: "salac-berry", label: "Salac Berry", category: "berry", cost: 200, effect: "Tăng Speed khi HP dưới 25%." },
  { id: 43, name: "petaya-berry", label: "Petaya Berry", category: "berry", cost: 200, effect: "Tăng Sp. Atk khi HP dưới 25%." },
  { id: 44, name: "apicot-berry", label: "Apicot Berry", category: "berry", cost: 200, effect: "Tăng Sp. Def khi HP dưới 25%." },
  { id: 45, name: "lansat-berry", label: "Lansat Berry", category: "berry", cost: 300, effect: "Tăng tỉ lệ Bạo kích khi HP dưới 25%." },
  { id: 46, name: "starf-berry", label: "Starf Berry", category: "berry", cost: 500, effect: "Tăng mạnh 1 chỉ số ngẫu nhiên khi HP dưới 25%." },
  { id: 47, name: "micle-berry", label: "Micle Berry", category: "berry", cost: 300, effect: "Tăng độ chính xác lượt tới khi HP thấp." },
  { id: 48, name: "custap-berry", label: "Custap Berry", category: "berry", cost: 300, effect: "Cho phép đi trước một lần khi HP thấp." },

  // --- NHÓM HIẾM VÀ ĐẶC BIỆT ---
  { id: 49, name: "enigma-berry", label: "Enigma Berry", category: "berry", cost: 500, effect: "Hồi HP nếu trúng đòn Super Effective." },
  { id: 50, name: "kee-berry", label: "Kee Berry", category: "berry", cost: 150, effect: "Tăng Defense khi bị trúng đòn Vật lý." },
  { id: 51, name: "maranga-berry", label: "Maranga Berry", category: "berry", cost: 150, effect: "Tăng Sp. Def khi bị trúng đòn Đặc biệt." },
  { id: 52, name: "jaboca-berry", label: "Jaboca Berry", category: "berry", cost: 150, effect: "Kẻ địch mất HP nếu đánh trúng Pokemon bằng đòn Vật lý." },
  { id: 53, name: "rowap-berry", label: "Rowap Berry", category: "berry", cost: 150, effect: "Kẻ địch mất HP nếu đánh trúng Pokemon bằng đòn Đặc biệt." },

  // --- NHÓM BERRY CỔ ĐIỂN / CHẾ BIẾN (RARE/COOKING) ---
  { id: 54, name: "razz-berry", label: "Razz Berry", category: "berry", cost: 20, effect: "Dùng để làm phụ gia hoặc cho ăn (tăng độ thân mật)." },
  { id: 55, name: "bluk-berry", label: "Bluk Berry", category: "berry", cost: 20, effect: "Vỏ màu tím, dùng để chế biến thức ăn." },
  { id: 56, name: "nanab-berry", label: "Nanab Berry", category: "berry", cost: 20, effect: "Vị ngọt, dùng làm nguyên liệu chế biến." },
  { id: 57, name: "wepear-berry", label: "Wepear Berry", category: "berry", cost: 20, effect: "Vị đắng nhẹ, dùng làm nguyên liệu." },
  { id: 58, name: "pinap-berry", label: "Pinap Berry", category: "berry", cost: 20, effect: "Dùng để chế biến thức ăn cho Pokemon." },
  { id: 59, name: "cornn-berry", label: "Cornn Berry", category: "berry", cost: 40, effect: "Berry cổ điển, dùng làm nguyên liệu cao cấp." },
  { id: 60, name: "magost-berry", label: "Magost Berry", category: "berry", cost: 40, effect: "Berry quý hiếm, có vị ngọt thanh." },
  { id: 61, name: "rabuta-berry", label: "Rabuta Berry", category: "berry", cost: 40, effect: "Bề mặt xù xì, dùng làm nguyên liệu." },
  { id: 62, name: "nomel-berry", label: "Nomel Berry", category: "berry", cost: 40, effect: "Rất chua, dùng trong chế biến cao cấp." },
  { id: 63, name: "spelon-berry", label: "Spelon Berry", category: "berry", cost: 40, effect: "Cực kỳ cay, dùng để kích vị." },
  { id: 64, name: "pamtre-berry", label: "Pamtre Berry", category: "berry", cost: 40, effect: "Rất hiếm, dùng để làm các món ăn đặc biệt." },
  { id: 65, name: "watmel-berry", label: "Watmel Berry", category: "berry", cost: 40, effect: "Kích thước lớn, dùng làm nguyên liệu." },
  { id: 66, name: "durin-berry", label: "Durin Berry", category: "berry", cost: 40, effect: "Rất đắng, dùng trong chế biến." },
  { id: 67, name: "belue-berry", label: "Belue Berry", category: "berry", cost: 40, effect: "Berry hiếm, dùng làm nguyên liệu." }
];

export const getBerrySprite = (name: string) => 
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${name}.png`;