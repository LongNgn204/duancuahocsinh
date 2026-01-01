# Voice Call WebSocket Proxy

WebSocket proxy server để kết nối Voice Call với Vertex AI Live API.

## Deploy lên Google Cloud Run

### 1. Đăng nhập gcloud
```bash
gcloud auth login
gcloud config set project ban-dong-hanh-483002
```

### 2. Enable APIs
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable aiplatform.googleapis.com
```

### 3. Build và Deploy
```bash
cd backend/cloud-run
gcloud run deploy voice-call-proxy \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars VERTEX_PROJECT_ID=ban-dong-hanh-483002,VERTEX_LOCATION=us-central1
```

### 4. Lấy URL
Sau khi deploy xong, gcloud sẽ trả về URL dạng:
```
https://voice-call-proxy-xxxxx-uc.a.run.app
```

Copy URL này và cập nhật vào frontend.

## Local Development

```bash
npm install
npm run dev
```

WebSocket endpoint: `ws://localhost:8080/ws`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 8080 | Server port |
| VERTEX_PROJECT_ID | ban-dong-hanh-483002 | Google Cloud project |
| VERTEX_LOCATION | us-central1 | Vertex AI region |
