
# URL Shortener 

This backend microservice powers a simple URL Shortener application. It provides REST APIs to create, manage, and analyze short URLs with expiration and analytics tracking.

---
## 📦 Installation

1. Navigate to the backend project folder:
   ```bash
   cd 22pa1a4240/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   This will install:
   - `express`
   - `shortid`
   - `valid-url`
   - Local `logging-middleware`

---

## 🖥️ Running the Server

Start the backend service:

```bash
node src/app.js
```

By default, the server runs at:  
**http://localhost:5000**

> You can modify the port in `src/app.js`.

---

## 📡 API Endpoints

### 1. Create a Short URL

- **Method**: `POST`  
- **Endpoint**: `/shorturls`

#### Request Body
```json
{
  "url": "https://openai.com/research/gpt-4",
  "validity": 60,
  "shortcode": "gpt4ai"
}
```

#### Response (201 Created)
```json
{
  "shortLink": "http://localhost:5000/gpt4ai",
  "expiry": "2025-12-01T12:00:00Z"
}
```

---

### 2. Redirect to Original URL

- **Method**: `GET`  
- **Endpoint**: `/:shortcode`

#### Function
Redirects the user to the original long URL and logs click metadata.

---

### 3. Get URL Statistics

- **Method**: `GET`  
- **Endpoint**: `/shorturls/:shortcode`

#### Response (200 OK)
```json
{
  "shortcode": "gpt4ai",
  "originalUrl": "https://openai.com/research/gpt-4",
  "createdAt": "2025-12-01T11:00:00Z",
  "expiryAt": "2025-12-01T12:00:00Z",
  "totalClicks": 3,
  "detailedClicks": [
    {
      "timestamp": "2025-12-01T11:15:00Z",
      "referrer": "https://twitter.com",
      "ip": "203.0.113.10"
    },
    {
      "timestamp": "2025-12-01T11:30:00Z",
      "referrer": "https://linkedin.com",
      "ip": "203.0.113.11"
    }
  ]
}
```

