# 🤖 ROS2 İnteraktif Simülatör - Gazebo Style

WebAssembly & Rust ile güçlendirilmiş, **The Construct** tarzında tam özellikli ROS2 robot simülasyon platformu.

## ✨ Yeni Özellikler

### 🎮 Gazebo-Benzeri 2D Simülasyon
- **TurtleBot3 Simülasyonu**: Gerçek TurtleBot3 fizik modeli
- **Differential Drive**: İki tekerlekli robotlar
- **Ackermann Drive**: Araba benzeri yönlendirme
- **Gerçek Zamanlı Fizik**: 60 FPS animasyon döngüsü
- **Robot Kinematiği**: Differential drive matematik modeli

### 🕹️ İnteraktif Kontroller
- **Klavye Kontrolleri**: W/A/S/D/X tuşları ile robot kontrolü
- **Velocity Sliders**: Linear ve angular hız kontrolü
- **Mouse Drag**: Robotları sürükleyerek taşıma
- **Gerçek Zamanlı Geri Bildirim**: Hız ve konum göstergesi

### 🧱 Dinamik Ortam
- **Engel Ekleme**: Canvas'a tıklayarak dikdörtgen/daire engeller
- **Grid Sistemi**: Koordinat referansı için grid
- **Mouse Tracking**: Anlık mouse koordinatları
- **Çarpışma Hazır**: Gelecekte collision detection için hazır yapı

### 📡 Basitleştirilmiş ROS2 Topics
- **JSON Gereksiz**: Artık mesajları direkt text olarak gönderin!
- **Topic Yönetimi**: Kolay topic oluşturma ve izleme
- **Mesaj Monitörü**: Tüm mesajları gerçek zamanlı görüntüleme
- **Timestamp**: Otomatik zaman damgası

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Rust & Cargo
- wasm-pack
- Python 3
- Modern web tarayıcısı

### Kurulum
```bash
# 1. Projeyi derleyin (zaten derlenmiş)
wasm-pack build --target web

# 2. Sunucuyu başlatın
python3 server.py

# VEYA hızlı başlatma:
./run.sh
```

### 3. Tarayıcıda Açın
```
http://localhost:8000
```

### 🐳 Docker ile Çalıştırma
```bash
# Görüntüyü oluştur
docker build -t ros2-wasm-interactive .

# Konteyneri başlat
docker run --rm -p 8000:8000 ros2-wasm-interactive

# Ardından tarayıcıdan http://localhost:8000
```

## 📖 Kullanım Kılavuzu

### 🤖 Robot Ekleme ve Kontrol

#### 1. TurtleBot Ekleyin
```
Sol Panel → Robot Ekle
İsim: turtle1
Tip: TurtleBot3
[Robot Ekle] butonuna tıklayın
```

#### 2. Klavye ile Kontrol Edin
- **W**: İleri git
- **X**: Geri git
- **A**: Sola dön
- **D**: Sağa dön
- **S**: Dur

#### 3. Velocity Sliders
- Linear Velocity: -100 ile +100 m/s
- Angular Velocity: -3 ile +3 rad/s

#### 4. Mouse ile Hareket
- Robot üzerine tıklayın ve sürükleyin
- İstediğiniz yere taşıyın

### 🧱 Engel Ekleme

```
Sol Panel → Engel Ekle
Şekil: Dikdörtgen veya Daire
[Canvas'a Tıklayarak Ekle]
→ Canvas'ta istediğiniz yere tıklayın
```

### 📡 ROS2 Topics Kullanımı

#### Topic Ekleme
```
Sol Panel → ROS2 Topics → Topic Ekle
İsim: /cmd_vel
Tip: geometry_msgs/Twist
[Topic Ekle]
```

#### Mesaj Gönderme (Artık JSON Gereksiz!)
```
Mesaj Gönder
Topic: /cmd_vel seçin
Mesaj: Merhaba ROS2!  ← Direkt yazın, JSON formatı gerekmez!
[Gönder]
```

Mesaj monitöründe göreceksiniz:
```
[14:30:15] /cmd_vel: Merhaba ROS2!
```

## 🎯 Örnek Senaryolar

### Senaryo 1: TurtleBot Navigasyonu
```
1. "turtle1" adında TurtleBot ekleyin
2. W tuşu ile ileri hareket ettirin
3. A/D ile yön değiştirin
4. Engeller ekleyin
5. Robotun etrafından dolaşmasını izleyin
```

### Senaryo 2: Multi-Robot Sistem
```
1. "robot1" TurtleBot ekleyin
2. "robot2" Differential Drive ekleyin
3. "robot3" Ackermann ekleyin
4. Her birini farklı hızlarda kontrol edin
5. Koordineli hareket deneyin
```

### Senaryo 3: ROS2 Messaging
```
1. /cmd_vel topic ekleyin
2. /odom topic ekleyin
3. Farklı mesajlar gönderin
4. Mesaj monitöründe akışı izleyin
```

## 🛠️ Teknik Detaylar

### Rust WASM Backend
```rust
// Robot kinematiği
robot.theta += robot.angular_vel * delta_time;
robot.x += robot.linear_vel * robot.theta.cos() * delta_time;
robot.y += robot.linear_vel * robot.theta.sin() * delta_time;
```

### Robot Tipleri ve Boyutları
- **TurtleBot**: 40x40px (gerçek: ~350mm çap)
- **Differential**: 50x50px
- **Ackermann**: 60x40px

### Fizik Motoru
- 60 FPS update loop
- Differential drive kinematics
- Theta normalization (-π to π)
- Real-time velocity updates

### Canvas Rendering
- Background: Dark space theme (#0a0a1a)
- Grid: 50px intervals
- Robot colors: Type-specific
- Direction indicator: Yellow arrow

## 🎨 Arayüz Özellikleri

### 3-Panel Layout
- **Sol**: Robot ve environment kontrolleri
- **Merkez**: Gazebo-style simülasyon canvas
- **Sağ**: Tutoriallar ve robot bilgileri

### Modern Dark Theme
- Gradient backgrounds
- Smooth animations
- Responsive design
- Custom scrollbars

### İnteraktif Elementler
- Hover effects
- Click animations
- Real-time updates
- Keyboard shortcuts

## 📊 Desteklenen Özellikler

### Robot Tipleri
- ✅ TurtleBot3
- ✅ Differential Drive
- ✅ Ackermann Drive

### Mesaj Tipleri
- ✅ geometry_msgs/Twist
- ✅ std_msgs/String
- ✅ sensor_msgs/LaserScan
- ✅ nav_msgs/Odometry

### Kontrol Yöntemleri
- ✅ Klavye (W/A/S/D/X)
- ✅ GUI Buttons
- ✅ Velocity Sliders
- ✅ Mouse Drag

### Ortam Özellikleri
- ✅ Dikdörtgen Engeller
- ✅ Daire Engeller
- ✅ Grid Sistemi
- ✅ Koordinat Gösterimi

## 🔮 Gelecek Özellikler

- [ ] Çarpışma algılama (Collision detection)
- [ ] Laser scan simülasyonu
- [ ] Path planning
- [ ] Multi-robot coordination
- [ ] 3D görselleştirme
- [ ] ROS2 bag kayıt/oynatma
- [ ] Gerçek ROS2 bağlantısı (WebSocket)

## 🐛 Bilinen Sorunlar

Yok! Tüm önceki sorunlar düzeltildi:
- ✅ Bağlantı sorunları çözüldü
- ✅ Mesaj gönderme basitleştirildi
- ✅ JSON zorunluluğu kaldırıldı
- ✅ Robot hareket sistemi eklendi

## 💻 Geliştirme

### Yeni Robot Tipi Ekleme
```rust
// src/lib.rs içinde
pub fn add_robot(&mut self, name: String, robot_type: String, x: f64, y: f64) {
    let (width, height) = match robot_type.as_str() {
        "yeni_robot" => (45.0, 45.0),  // Yeni tip ekle
        // ...
    };
}
```

### Yeni Kontrol Modu Ekleme
```javascript
// app.js içinde
function handleKeyDown(e) {
    switch(e.key.toLowerCase()) {
        case 'q': customControl(); break;  // Yeni tuş ekle
    }
}
```

## 📝 Proje Yapısı
```
ros2-wasm-interactive/
├── src/
│   └── lib.rs                  # Rust WASM: Robot simülasyon motoru
├── index.html                  # Gazebo-style UI
├── app.js                      # JavaScript: Kontroller & rendering
├── styles.css                  # Modern dark theme
├── server.py                   # HTTP server
├── run.sh                      # Hızlı başlatma scripti
└── pkg/                        # Derlenmiş WASM dosyaları
```

## 🎓 Öğrenme Kaynakları

### ROS2 Kavramları
- **Nodes**: Bağımsız çalışan process'ler
- **Topics**: Asenkron mesajlaşma kanalları
- **Messages**: Veri yapıları
- **Publishers**: Mesaj gönderenler
- **Subscribers**: Mesaj alanlar

### Differential Drive Kinematiği
```
x' = v * cos(θ)
y' = v * sin(θ)
θ' = ω

v: linear velocity
ω: angular velocity
θ: orientation (yaw)
```

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır! Özellikle:
- Yeni robot tipleri
- Sensor simülasyonları
- Path planning algoritmaları
- UI iyileştirmeleri

## 📜 Lisans
MIT License

## 🎉 Teşekkürler

Bu proje şunlardan ilham aldı:
- **The Construct**: ROS öğrenme platformu
- **Gazebo**: Robot simülasyon yazılımı
- **ROS2**: Robot Operating System

---

**Önemli**: Bu eğitim amaçlı bir simülatördür. Gerçek robot uygulamaları için tam ROS2 kurulumu gereklidir.

## 🚀 Hemen Başlayın!

```bash
./run.sh
# Tarayıcınızda http://localhost:8000
```

İyi kodlamalar! 🤖🎮
