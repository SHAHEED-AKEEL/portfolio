# Mohammed Shaheed Akeel — Cursor-Tracking 3D Portfolio

An award-winning luxury portfolio website for **Mohammed Shaheed Akeel** (Data Scientist & Machine Learning Specialist), engineered following the complete **sl_tech_journal 3D Cursor-Tracking Hero Tutorial** workflow.

---

## 🌟 Interactive Experience & Core Architecture

### 1. Zero-Ghosting 60FPS Cursor-Tracking Hero
- **Pre-Extracted WebP Image Array**: 64 crisp, high-quality WebP frames (~5.6° rotation intervals) covering a complete 360° circular head trajectory, preprocessed with OpenCV and watermarks cleanly inpainted.
- **Circular Shortest-Path Angular Lerp (`lerpAngle`)**: Computes the cursor angle relative to the character face center using `Math.atan2(dy, dx)`. Sits on a fast response factor (`~0.26`), delivering smooth, butter-like continuous tracking in ~35ms with zero lag.
- **Center Eye Contact Deadzone**: When the user hovers near the character's face (within ~12% screen radius), the canvas switches to `center.webp` where Mohammed looks directly into the visitor's eyes.
- **Zero Runtime Video Seeking**: Completely avoids buggy HTML5 video seeking (`video.currentTime`) and CSS 3D transforms (`rotateX`, `rotateY`, `perspective`), ensuring rock-solid stability and zero double-face ghosting.
- **Seamless Deep Crimson Palette**: The canvas and entire background seamlessly integrate with the `#4c0000` / `#120102` radial vignette.

---

## 💼 Integrated Resume & Portfolio Showcase

- **Career Objective**: Focused on predictive modeling, statistical learning, and scalable Generative AI architectures.
- **Academic Credentials**: 
  - Post Graduate Program in Data Science & Analytics — Imarticus Learning, Bengaluru (Grade: B).
  - B.E. in Computer Science — Al-Ameen Engineering College (2020 – 2024, 79%).
- **Featured Projects**:
  1. **News Research Tool (NRT)**: Semantic Question Answering with LangChain, FAISS vector index, OpenAI API, and Streamlit.
  2. **levixbiosciences**: Official Enterprise Healthcare Website for LEVIX Bio Science Pvt Ltd built with React, Vite, TailwindCSS, formulations catalog, and WhatsApp ordering integration ([GitHub](https://github.com/SHAHEED-AKEEL/levixbiosciences) | [Live Website](https://levixbiosciences.com)).
  3. **Time Series & Demand Forecasting Engine**: Weekly sales trend and seasonal decomposition with ARIMA/SARIMA, Facebook Prophet, and XGBoost lag features evaluated with RMSE & MAPE.
- **Interactive Resume Modal**:
  - Full formatted resume sheet with instant copyable contact points.
  - Direct download button for `ShaheedAkeel_DataScientist_Resume.docx`.
- **Contact & Socials**:
  - Email: `shahidshahidakeel@gmail.com` (with one-click copy and direct mail trigger)
  - Phone: `+91 9944898567` (with one-click copy)
  - LinkedIn: [mohammed-shaheed-akeel](http://www.linkedin.com/in/mohammed-shaheed-akeel)
  - GitHub: [SHAHEED-AKEEL](https://github.com/SHAHEED-AKEEL)

---

## 🚀 Running the Project Locally

The portfolio is built with zero runtime dependencies. A lightweight Node.js server is included:

```bash
# Start the local server
node server.js
```

Open your browser at:
```
http://localhost:3000
```

Alternatively, you can open `index.html` directly in any modern browser.

---

## 📁 Directory Structure

```
├── index.html                           # Main portfolio markup & semantic structure
├── style.css                            # Luxury dark crimson CSS design system
├── app.js                               # 60FPS canvas engine, lerpAngle, magnetic cursor
├── server.js                            # Zero-dependency local static file server
├── character.jpeg                       # High-resolution character portrait
├── ShaheedAkeel_Resume.docx             # Downloadable resume document
├── frames/                              # 64 pre-extracted 360° WebP frames
│   ├── frame_00.webp ... frame_63.webp
│   └── center.webp                      # Neutral direct camera eye-contact frame
└── public/                              # Original source assets
    ├── character.mp4.mp4
    ├── character1.mp4.mp4
    └── character.jpeg
```
