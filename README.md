<div align="center">

<img src="https://raw.githubusercontent.com/google-gemini/cookbook/main/images/gemini_logo.png" alt="Google AI Studio Logo" width="480" />

# ⚡ Built with Google AI Studio ⚡

[![Built with Google AI Studio](https://img.shields.io/badge/Built%20with-Google%20AI%20Studio-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-EA4335?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![Three.js](https://img.shields.io/badge/3D%20Engine-Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

<p align="center">
  <b>แอปพลิเคชันนี้ได้รับการออกแบบ พัฒนา และสร้างสรรค์ขึ้นด้วยความช่วยเหลือของ Google AI Studio</b><br>
  <i>This application was architected, engineered, and generated using Google AI Studio.</i>
</p>

---

</div>

# Tesla Roadster SpaceX Flight & Twin Towers Crash Simulator 🚀💥

> **แบบจำลอง 3 มิติระบบฟิสิกส์ การบินไอพ่น SpaceX Cold-Gas Thruster ของ Tesla Roadster และการทดสอบแรงกระแทกกับ Twin Towers พร้อมระบบ Telemetry และภาพช้าสโลว์โมชั่น**
> 
> *A high-fidelity 3D web physics simulator replicating the Tesla Roadster equipped with the SpaceX cold-gas thruster package, featuring supersonic aerodynamics, deformable breakable skyscraper facades, spectacular volumetric explosions, and comprehensive crash telemetry.*

---

## 📸 ภาพรวมและจุดเด่น (Features & Highlights)

- 🏎️ **Tesla Roadster SpaceX Thruster Package**:
  - ตัวถังซูเปอร์คาร์ลู่ลมพร้อมเฉดสีให้เลือก (Pearl Silver, Midnight Red, Stealth Black, Electric Cyan)
  - ปีกหลังคาร์บอนไฟเบอร์ **Active Aero Wing**
  - หัวขับไอพ่นท้ายรถ **Quad SpaceX Cold-Gas Thruster Nozzles** พร้อมเปลวพลาสมาและ Mach Diamonds
  - ไอพ่นแนวดิ่ง **VTOL Hover Jets** พร้อมกลุ่มควันไอพ่นก๊าซเย็นพวยพุ่งลงสู่พื้นตามภาพต้นฉบับ
- 🏙️ **Freestanding Twin Towers & Breakable Facade**:
  - หอคอยคู่สูง 450 เมตร ดีไซน์โมโนลิธิกอิสระ ไร้สิ่งกีดขวางตรงกลาง พร้อมช่องว่างสำหรับบินผาดโผน (Stunt Flight Corridor)
  - แผงอาคารแตกหักได้จริง **48 Deformable Structural Blocks** ที่แตกร่วงและกระเด็นตามเวกเตอร์แรงปะทะ
  - รอยไหม้และหลุมปะทะ (Impact Scorch Crater)
- 💥 **Spectacular Explosion Effects (เอฟเฟกต์ระเบิดอลังการ)**:
  - **Volumetric Fireball Clusters**: ลูกไฟระเบิดหลายชั้นขยายตัวรัศมีกว่า 35-40 เมตร พร้อมการหมุนวนและแสงวาบ
  - **Supersonic Shockwave Ring**: คลื่นกระแทกช็อกเวฟสีทองแผ่ขยายออกกว่า 140 เมตร
  - **Dynamic Flash Light**: แสงแฟลชกำลังสูงสว่างวาบสะท้อนทั่วทั้งกระจกอาคารและเมือง
  - **Dense Billowing Smoke Plumes**: ละอองควันดำ 420 อนุภาคพุ่งขึ้นสู่ท้องฟ้าด้วยแรงยกตัวความร้อน (Thermal Convection)
  - **Fiery Sparks & Shrapnel**: สะเก็ดไฟร้อนสีทอง-ส้มกว่า 450 ชิ้น กระเด็นและกระดอนพื้นตามหลักฟิสิกส์
  - **Cinematic Camera Shake**: กล้องสั่นไหวรุนแรงตามพลังงานจลน์ของการชน
- 🎮 **360° Free Orbit Camera & View Modes**:
  - **🖱️ คลิกลากเมาส์ / ปัดนิ้ว**: หมุนมุมกล้องรอบรถ 360 องศาได้อย่างอิสระ
  - **🔍 หมุนล้อเมาส์ / Pinch**: ซูมเข้า-ออกได้อย่างลื่นไหล
  - **แถบเครื่องมือหมุนกล้องด่วน (Quick Camera Toolbar)**: ปุ่มลัดมุมมองสำเร็จรูป (ด้านหลัง, ด้านหน้า, ด้านข้าง, มุมสูง Top-Down), ปุ่ม D-Pad หมุนทิศทาง และปุ่มรีเซ็ต
  - สลับโหมดกล้อง: Chase Cam, Cockpit View, Tower Observation Deck, Drone Cam, Free Orbit
- 📊 **Real-time Telemetry & Impact Analysis**:
  - มาตรวัดความเร็วแบบ Real-time ทั้ง **KM/H** และ **Mach Number**
  - คำนวณพลังงานจลน์ ณ จุดชนจริงเป็น **Megajoules (MJ)** ($E_k = \frac{1}{2}mv^2$)
  - ตรวจจับแรงชะลอเฉียบพลันสูงสุด (Peak Deceleration G-Force)
  - ระบบ **Slow-Motion Bullet-Time** สโลว์ภาพเหตุการณ์ช็อตการชนอัตโนมัติ
- 🔊 **Procedural Web Audio Engine**:
  - เสียงไอพ่นคำราม, ก๊าซเย็นฟู่พ่น, โซนิกบูม (Sonic Boom) เมื่อทะลุมัค 1, เสียงระเบิดซับเบสต่ำลึก 25Hz และเสียงเปลวเพลิงลุกไหม้ 100% Procedural Web Audio โดยไม่ต้องพึ่งไฟล์ภายนอก

---

## 🕹️ การควบคุม (Controls)

### ⌨️ แป้นพิมพ์ (Keyboard)
| ปุ่ม | การทำงาน |
| :--- | :--- |
| **W / S** หรือ **ลูกศรขึ้น / ลง** | ควบคุมมุมก้ม-เงย (Pitch Down / Pitch Up) |
| **A / D** หรือ **ลูกศรซ้าย / ขวา** | ควบคุมการเอียงปีก (Roll Left / Roll Right) |
| **Q / E** | ควบคุมการหันเลี้ยว (Yaw Left / Yaw Right) |
| **Shift** | เร่งไอพ่นจรวดซูเปอร์ชาร์จ (SpaceX Thruster Boost) |
| **Spacebar** | ไอพ่นยกตัวแนวดิ่ง (VTOL Lift / Hover) |
| **R** | ยิงไอพ่นพุ่งชนเป้าหมายอัตโนมัติ (Launch Auto-Crash) |
| **C** หรือ **เลข 5** | สลับโหมดกล้องหมุนอิสระ 360° (Toggle Free Orbit) |
| **เลข 1 - 4** | สลับมุมกล้อง (1: ท้ายรถ, 2: คนขับ, 3: หอคอย, 4: โดรน) |

### 🖱️ เมาส์และการสัมผัส (Mouse & Touch)
- **คลิกซ้ายค้างแล้วลาก (Click & Drag)**: หมุนมุมกล้องรอบตัวรถได้ 360 องศา
- **ล้อเลื่อนเมาส์ (Mouse Wheel)**: ซูมเข้า / ซูมออก
- **บนมือถือ/แท็บเล็ต**: มีปุ่มบังคับทิศทางและปุ่มไอพ่น Boost/VTOL บนหน้าจอ พร้อมรองรับการใช้นิ้วปัดหมุนกล้องและ 2 นิ้วหนีบ/กางเพื่อซูม (Pinch to Zoom)

---

## 🛠️ สแต็กเทคโนโลยี (Tech Stack)

- **AI Engine & Platform**: [Google AI Studio](https://aistudio.google.com/)
- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **3D Graphics Engine**: [Three.js r160+](https://threejs.org/) (PBR MeshPhysicalMaterial, PMREMGenerator, Procedural Shaders, InstancedMesh)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio**: Web Audio API (Procedural Synthesizers & Noise Generators)
- **Bundler & Build Tool**: [Vite](https://vitejs.dev/)

---

## 🚀 วิธีติดตั้งและรันในเครื่อง (Getting Started)

1. **Clone repository หรือดาวน์โหลดโค้ด:**
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd <REPO_DIRECTORY>
   ```

2. **ติดตั้ง Dependencies:**
   ```bash
   npm install
   ```

3. **รันเซิร์ฟเวอร์สำหรับพัฒนา (Development Server):**
   ```bash
   npm run dev
   ```
   เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

4. **บิลด์สำหรับ Production:**
   ```bash
   npm run build
   ```

---

## 🌟 เครดิต (Credits & Acknowledgments)

- พัฒนาและสร้างสรรค์ด้วย **[Google AI Studio](https://aistudio.google.com/)** และ **Google Gemini**
- โมเดลและฟิสิกส์ 3D ขับเคลื่อนโดย **Three.js**

---

## 📄 ใบอนุญาต (License)

Apache-2.0 License
