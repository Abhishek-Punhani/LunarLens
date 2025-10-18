# LunarLens 🌙

A comprehensive web application for analyzing lunar X-ray Fluorescence (XRF) spectroscopy data from the Chandrayaan-2 CLASS (Chandrayaan-2 Large Area Soft X-ray Spectrometer) instrument. LunarLens provides interactive visualization, spectral analysis, and elemental composition mapping of the lunar surface.

# Vedio Link

[Link](https://drive.google.com/file/d/19Ovag3Q2oeLq0nw1sNTegval_BJoyStc/view?usp=sharing)

## 🚀 Features

### Core Functionality

- **FITS File Processing**: Upload and parse CLASS FITS files containing lunar XRF spectroscopy data
- **Interactive 3D Globe**: Visualize data collection points on a rotating 3D lunar globe with Three.js
- **Spectral Analysis**: Automated peak detection, element matching, and flux calculation
- **XRF Analysis**:
  - Peak detection with Gaussian fitting
  - Element identification (Mg, Al, Si, Ca)
  - Elemental ratio calculations (Mg/Si, Al/Si, Ca/Si)
  - Statistical significance estimation
- **Combined Spectrum Analysis**: Average multiple observations for enhanced signal-to-noise ratio
- **Data Visualization**:
  - Interactive spectrum plots with Recharts
  - Elemental ratio bar charts
  - Peak data tables
- **Authentication**: Secure user authentication with JWT tokens
- **Responsive Design**: Modern UI with TailwindCSS and dark mode support

### Advanced Features

- Spatial overlap detection and averaging
- KNN-based prediction for missing lunar regions
- Real-time data processing with FastAPI backend
- Metadata extraction from FITS headers
- File management and organization

## 🏗️ Architecture

LunarLens is built as a monorepo using Turborepo with three main applications:

### Apps and Packages

- **`apps/web`**: Next.js frontend application with React, TypeScript, TailwindCSS, and Three.js
- **`apps/auth_server`**: Node.js authentication server with Express, JWT, Redis, and PostgreSQL
- **`apps/calc_server`**: Python FastAPI analysis server with NumPy, SciPy, and scikit-learn
- **`shared/`**: Shared utilities for authentication, database, and API clients
- **`middleware/`**: Express middleware for auth, caching, and error handling

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/) (except calc_server which is Python).

## 📋 Prerequisites

- Node.js 18+ and pnpm
- Python 3.12+
- PostgreSQL (for authentication)
- Redis (for session management)
- pyenv (recommended for Python version management)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd lunarLens
```

### 2. Install Dependencies

Install Node.js dependencies:

```bash
pnpm install
```

Set up Python environment for calc_server:

```bash
cd apps/calc_server

# Create virtual environment
pyenv virtualenv 3.12.0 myenv
pyenv local myenv

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration

Create `.env` files in the respective application directories:

**apps/web/.env.local:**

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_CALC_API_URL=http://localhost:8000
```

**apps/auth_server/.env:**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/lunarlens
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

## 🚀 Running the Application

### Development Mode

Start all services using Turborepo:

```bash
pnpm dev
```

Or start services individually:

**Frontend (Next.js):**

```bash
cd apps/web
pnpm dev
# Runs on http://localhost:3000
```

**Calc Server (FastAPI):**

```bash
cd apps/calc_server
pnpm dev
# or directly:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
# Runs on http://localhost:8000
```

**Auth Server (Node.js):**

```bash
cd apps/auth_server
pnpm dev
# Runs on http://localhost:4000
```

### Production Build

To build all apps and packages:

```bash
pnpm build
```

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```bash
pnpm --filter web build
```

## 📁 Data Format

LunarLens processes FITS (Flexible Image Transport System) files from the Chandrayaan-2 CLASS instrument. The expected format:

- **Extension Type**: BINTABLE
- **Columns**:
  - `CHANNEL`: Integer\*2 (PHA channel number, 0-2047)
  - `COUNTS`: Real\*4 (Counts per channel)
- **Required Headers**:
  - `SAT_LAT`, `SAT_LON`: Satellite position
  - `GAIN`: Energy calibration (eV/channel)
  - `EXPOSURE`: Exposure time
  - Additional metadata for spatial mapping

## 🔬 XRF Analysis Pipeline

1. **Data Extraction**: Parse FITS BinaryTable to extract channel and count arrays
2. **Energy Calibration**: Convert channel numbers to energy (keV) using gain parameter
3. **Peak Detection**: Identify peaks using SciPy's `find_peaks` with adaptive thresholding
4. **Element Matching**: Match detected energy peaks to characteristic X-ray lines:
   - Mg Kα: 1.25 keV
   - Al Kα: 1.49 keV
   - Si Kα: 1.74 keV
   - Ca Kα: 3.69 keV
5. **Gaussian Fitting**: Fit Gaussian profiles to peaks for accurate flux calculation
6. **Ratio Calculation**: Compute elemental ratios normalized to Si
7. **Spatial Mapping**: Map results to lunar coordinates
8. **Combined Analysis**: Average overlapping observations and predict missing regions

## 🗺️ API Endpoints

### Calc Server (http://localhost:8000)

**POST /analyze_spectrum**

```json
{
  "channel": [0, 1, 2, ...],
  "counts": [10.5, 12.3, 15.7, ...],
  "gain": 13.5,
  "sat_lat": -54.1664,
  "sat_lon": -158.337
}
```

Response includes peaks, elements, fluxes, ratios, and spatial mapping.

**POST /generate_map**
Generate full lunar map with predictions for unobserved regions.

**POST /clear_data**
Clear stored spectral data.

## 🎨 Key UI Components

- `LunarGlobe.tsx`: Interactive 3D visualization of lunar surface with data markers
- `SpectralPlot.tsx`: Line chart showing XRF spectrum with identified peaks
- `RatioChart.tsx`: Bar chart of elemental ratios
- `PeakTable.tsx`: Tabular display of detected peaks and elements
- `AnalysisViewer.tsx`: Container component integrating all visualization components
- `FilesList.tsx`: File management sidebar
- `MetadataViewer.tsx`: Display FITS header metadata

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Chandrayaan-2 CLASS team for the instrument data
- ISRO (Indian Space Research Organisation)
- NASA Astrophysics Data System for FITS format specifications

## 📚 References

- [FITS Format Specification](https://fits.gsfc.nasa.gov/)
- [Chandrayaan-2 Mission](https://www.isro.gov.in/Chandrayaan2.html)

## 🐛 Known Issues

- Large FITS files (>100MB) may cause memory issues in browser
- Peak detection threshold may need adjustment for low-count spectra
- BinaryTable data reading requires FileReader API (browser-only)

## 🔮 Future Enhancements

- [ ] Machine learning models for automated mineral classification
- [ ] Export results to CSV/JSON
- [ ] Batch processing of multiple files
- [ ] Real-time collaboration features
- [ ] Advanced spatial interpolation methods
- [ ] Integration with other lunar datasets

---
