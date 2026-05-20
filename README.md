# 🚀 Yemek Teslimatı Simülasyonu & Akıllı Lojistik Motoru

Yapay zeka algoritmaları ve Python tabanlı Gerçek Zamanlı Oyun Motoru (Game Loop) mimarisi kullanılarak geliştirilmiş, yüksek performanslı bir teslimat ve lojistik ağ simülatörüdür. 

Tüm lojistik hesaplamaları ve yol bulma algoritmaları Python backend (FastAPI WebSocket) üzerinde koşturulurken, React frontend ise sadece canlı bir görselleştirme (render) katmanı olarak görev yapar.

---

## 🎯 Proje Amacı

* **Akıllı Lojistik Analizi:** Farklı kurye dağıtım ve atama algoritmalarının kurye efor dengesi ve ortalama teslimat süreleri üzerindeki etkilerini canlı grafiklerle kıyaslamak ve test etmek.
* **Sıfır Tarayıcı Yükü (%0 Client CPU):** Ağır matematiksel hesaplamaları (Dijkstra rotalaması, anlık kurye hareket fizikleri vb.) tarayıcıdan alıp Python backend sunucusuna taşıyarak arayüzün kararlı çalışmasını sağlamak.
* **Gerçek Zamanlı Karar Döngüsü:** Kuryelerin ve siparişlerin anlık durumlarını saniyede 15 kare (15 FPS) hızında hesaplayıp eş zamanlı görselleştirmek.

---

## ⚙️ Simülasyonda Yer Alan Değişkenler (Variables)

Simülasyon motoru, aşağıdaki parametreleri panel üzerinden canlı olarak yönetir ve işler:

* **Kurye Sayısı (`driverCount`):** Filodaki aktif kurye adedi.
* **Maksimum Sipariş Sınırı (`maxOrders`):** Sistemde aynı anda birikebilecek maksimum sipariş limiti.
* **Kurye Temel Hızı (`driverSpeedPercent`):** Kuryelerin yollardaki hız katsayısı.
* **Sipariş Üretim Frekansı (`orderFrequency`):** Siparişlerin gelme sıklığı:
  * **Yavaş (Slow):** 6 saniyede bir sipariş üretilir.
  * **Normal (Normal):** 3 saniyede bir sipariş üretilir.
  * **Hızlı (Fast):** 1 saniyede bir sipariş üretilir.
* **Hava Durumu Çarpanları (`weather`):** Hava koşullarına göre kuryelerin hız sınırlamaları:
  * **Güneşli (Sunny):** %100 hız (Hız x 1.0).
  * **Yağmurlu (Rainy):** Kuryeler %20 yavaşlar (Hız x 0.8).
  * **Karlı (Snowy):** Kuryeler %40 yavaşlar (Hız x 0.6).
* **Sipariş İptal Eşiği (Order Timeout):** Atanmamış (pending) siparişler 45 saniyeyi aşarsa sistem tarafından otomatik iptal (`canceled`) edilir.
* **Trafik Yoğunluk Bölgeleri (`trafficZones`):** Harita üzerinde kurye rotasını yavaşlatan yoğun trafik balonları.

---

## 🧠 Atama Algoritmaları (Test Edilebilir)

Panel üzerinden anlık olarak değiştirilebilen üç farklı atama algoritması mevcuttur:
1. **Rastgele (Random):** Siparişi haritadaki herhangi bir müsait kuryeye rastgele atar. Filonun verimsizliğini ölçmek için referans noktasıdır.
2. **En Yakın (Nearest):** Restorana mesafe bazında en yakın olan kuryeyi seçer. Kısa vadede etkilidir ancak belli bölgelerdeki kuryeleri aşırı yorar.
3. **Akıllı Dağıtım (Smart AI):** Kuryenin restorana olan mesafesinin yanı sıra gün içindeki aktif çalışma süresini de (`Efor x 1.5 Ceza Puanı`) hesaba katar. Hem mesafeyi kısa tutar hem de kuryeler arasında adil görev dağılımı sağlar.

---

## ⚡ Hibrit Mimarinin Avantajları

Bu sistem, standart bir React uygulamasının çok ötesinde kurumsal lojistik avantajlar sağlar:
* **Sıfır İstemci (Client) Yükü:** Dijkstra ve kurye atama algoritması gibi yoğun matematiksel hesaplamalar tarayıcıda değil, Python backend üzerinde koşturulduğu için en düşük donanımlı cihazlarda bile tarayıcı kasmadan akıcı bir deneyim sunulur.
* **Milisaniyelik Rotalama Hızı:** Python tabanlı Dijkstra algoritması, kuryeler için en kısa yolları milisaniyeler içerisinde hesaplar.
* **Merkezi Simülasyon Durumu (Central State):** Simülasyon tek bir Python motoru üzerinde çalıştığı için, birden fazla cihaz veya ekran aynı WebSocket yayınına bağlanarak simülasyonu tam zamanlı ve eş zamanlı olarak izleyebilir.
* **Genişletilebilir Algoritma Altyapısı:** Yeni lojistik algoritmalar veya yapay zeka modelleri React arayüzüne dokunulmadan doğrudan Python motoruna kolayca entegre edilebilir.

---

## 🛠 Kullanılan Teknolojiler

* **Python (v3.11+):** Simülasyon motoru, algoritma mantığı ve Dijkstra en kısa yol hesaplamaları.
* **FastAPI:** Asenkron WebSocket sunucusu ve REST API altyapısı.
* **Uvicorn & Websockets:** Yüksek performanslı asenkron veri yayını (Real-time broadcasting).
* **React.js (v18):** Canlı render/görselleştirme katmanı (rendering engine).
* **TypeScript:** Tip güvenliği ve arayüz sözleşmeleri.
* **Vite:** Süper hızlı geliştirme sunucusu ve build aracı.
* **Tailwind CSS:** Modern, neon ve dark-mode uyumlu tasarım stilleri.
* **Recharts:** Canlı istatistiklerin bar ve donut grafik görselleştirmesi.
* **Lucide React:** Dinamik arayüz ikon setleri.

---

## 🚀 Kurulum & Çalıştırma

Projeyi yerel makinenizde çalıştırmak için hem Python backend (simülasyon sunucusu) hem de React frontend'i başlatmanız gerekmektedir:

### 1. Python Backend Kurulumu & Çalıştırılması
```bash
# Bağımlılıkları yükleyin
py -m pip install -r python_simulation/requirements.txt

# WebSocket sunucusunu başlatın (Port: 8765)
npm run python-sim
```

### 2. React Frontend Kurulumu & Çalıştırılması
```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın (Port: 5173)
npm run dev
```

Uygulama başarıyla başladığında tarayıcınızda **`http://localhost:5173`** adresine giderek simülasyonu başlatabilirsiniz. Arayüz otomatik olarak Python WebSocket sunucusuna bağlanacak ve simülasyonu Python motoru üzerinden yürütecektir.

---

## 📂 Proje Mimarisi

* `python_simulation/server.py`: FastAPI & WebSocket tabanlı yayın sunucusu.
* `python_simulation/engine.py`: Simülasyonun kalbi olan ve algoritmaları koşturan Python oyun motoru.
* `python_simulation/city_graph.py`: Python tabanlı düğüm haritası ve Dijkstra en kısa yol bulma fonksiyonları.
* `src/simulation/useSimulation.ts`: Python sunucusuna bağlanıp verileri anlık olarak React bileşenlerine aktaran WebSocket istemci hook'u.
* `src/components/`: Canlı istatistik panelleri, harita bileşenleri ve kontrol araçları.

---

