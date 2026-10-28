# FreelanceHub — Full-Stack Freelancer Marketplace

FreelanceHub is a modern full-stack freelancer marketplace web application designed with the exact visual aesthetics, color palettes, card layouts, and interactions shown in the reference UI screenshots.

## 🛠️ Technologies Used

### Frontend
- **React.js 18** + **Vite**
- **React Router v6** (Role-based protected routing)
- **Zustand** (Global auth & state management)
- **Axios** (API communication with JWT Bearer interceptor)
- **CSS3 / Vanilla Design System** (Inter font, curated blue/cyan palette, cards, badges, dark navy section)
- **Lucide React** (Icons)
- **STOMP / SockJS** (Real-time WebSocket client)
- **Razorpay Checkout JS** (Milestone payment release)

### Backend
- **Java 21 + Spring Boot 3.2.5**
- **Spring Web** (RESTful API architecture)
- **Spring Security + BCrypt + JWT** (Stateless authentication & role-based authorization)
- **Spring Data MongoDB** (Connected directly to MongoDB Atlas cluster)
- **Spring WebSocket + STOMP** (Real-time bidirectional chat in project workspaces)
- **Redis & In-Memory Fallback** (Caching and API rate limiting)
- **Razorpay Java Service** (Payment order generation and verification)
- **SpringDoc OpenAPI 3 / Swagger UI** (Interactive API documentation)
- **Apache Maven** (Build automation)

---



## 🔑 Demo Login Credentials

The application automatically seeds 3 demo accounts upon starting:

| Role | Email | Password | Description |
|---|---|---|---|
| **Client** | `client@demo.com` | `demo1234` | Can post projects, review proposals, hire freelancers, chat, release payment |
| **Freelancer** | `freelancer@demo.com` | `demo1234` | Full-stack dev profile, can browse projects, submit proposals, chat |
| **Admin** | `admin@demo.com` | `demo1234` | Access platform stats, manage users, and add/delete categories |

> 💡 **Quick Login:** On the login screen, click the **Client**, **Freelancer**, or **Admin** demo buttons for instant one-click login!

---

## 🗄️ Database Connection

Set your MongoDB Atlas connection in the `MONGODB_URI` environment variable. Keep database credentials and payment secrets out of source control. The backend also reads `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` from the environment.

```yaml
spring:
  data:
    mongodb:
      uri: ${MONGODB_URI}
```

---

## 🚀 How to Run the Application

### 1. Run the Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
- Server starts on `http://localhost:8080`
- Swagger UI / API Docs: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON Spec: `http://localhost:8080/v3/api-docs`
- WebSocket STOMP endpoint: `http://localhost:8080/ws`

### 2. Run the React Frontend
```bash
cd frontend
npm install
npm run dev
```
- Open `http://localhost:5173` in your browser.
- Vite proxies `/api` and `/ws` to `http://localhost:8080`.
