```markdown
# Live Transcription with Next.js and Deepgram

[![Next.js](https://img.shields.io/badge/Next.js-13.4+-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Deepgram](https://img.shields.io/badge/Deepgram-API-00C2A8)](https://deepgram.com/)

A real-time speech-to-text application using Deepgram's live transcription API.

## ✨ Features
- Real-time audio transcription
- WebSocket-based communication
- React context API integration
- Server-side API key management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Deepgram API key (free at [deepgram.com](https://console.deepgram.com/signup))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR-USERNAME/nextjs-live-transcription.git
 ```
```

2. Install dependencies
```bash
cd nextjs-live-transcription
npm install
 ```

3. Environment Setup
   - Create .env.local file in root directory:
   ```env
   DEEPGRAM_API_KEY=your_api_key_here
    ```
### Running the Application
```bash
npm run dev
 ```

Open http://localhost:3000 in your browser.

## 🔧 Configuration Environment Variable Description DEEPGRAM_API_KEY

Your Deepgram API key (required)
## 🤝 Contributing
1. Fork the project
2. Create your feature branch ( git checkout -b feature/AmazingFeature )
3. Commit your changes ( git commit -m 'Add some AmazingFeature' )
4. Push to the branch ( git push origin feature/AmazingFeature )
5. Open a Pull Request