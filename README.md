# CodeCollab - Realtime Collaborative Code Editor

A full-stack realtime collaborative code editor built using **React**, **Express**, and **Socket.IO**, designed to demonstrate modern web application architecture, realtime communication, and backend-driven code execution.

The project focuses on understanding the underlying concepts rather than simply reproducing tutorial code. It was built incrementally from first principles, emphasizing clean state management, event-driven architecture, and separation of concerns.

---

## ✨ Features

### Realtime Collaboration

* Create unique coding rooms using UUIDs.
* Join existing rooms with a username.
* Live synchronization of connected users.
* Automatic initial document synchronization for newly joined participants.
* Instant realtime collaborative editing using Socket.IO.
* Dynamic "You" badge for the current user.
* Copy Room ID functionality.
* Leave room functionality with proper cleanup.

### Code Editor

* Built with CodeMirror.
* Multiple language modes:

  * JavaScript
  * Python
  * Java
  * C++
* Automatic editor focus.
* Language switching support.

### Run Code

* Backend-powered code execution.
* Secure separation between frontend and execution engine.
* JavaScript execution using Node.js VM sandbox.
* Captures `console.log()` output.
* Runtime error handling.
* Infinite loop timeout protection.
* Integrated terminal-style output panel.

### User Experience

* Toast notifications.
* Loading state while code executes.
* Live session indicator.
* Clean component-based architecture.

---

## 🏗️ Architecture

### Realtime Collaboration Flow

```
User A
   │
   ▼
CodeMirror
   │
   ▼
Socket.IO Client
   │
   ▼
Express + Socket.IO Server
   │
   ▼
Socket.IO Broadcast
   │
   ▼
User B / User C / User D
```

---

### Run Code Flow

```
User
   │
Click Run
   │
   ▼
React Frontend
   │
POST /run
   │
   ▼
Express Backend
   │
   ▼
executeCode() Service
   │
   ▼
Node VM Sandbox
   │
   ▼
Captured Output
   │
   ▼
Terminal UI
```

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router DOM
* CodeMirror
* Socket.IO Client
* Axios
* React Hot Toast
* UUID

### Backend

* Node.js
* Express.js
* Socket.IO
* CORS
* Node VM

---

## 📂 Project Structure

```
CodeCollab/

client/
│
├── src/
│   ├── components/
│   │    ├── Client.jsx
│   │    └── Editor.jsx
│   │
│   ├── pages/
│   │    ├── Home.jsx
│   │    └── EditorPage.jsx
│   │
│   ├── socket.js
│   ├── App.jsx
│   └── main.jsx
│

server/
│
├── services/
│   └── executeCode.js
│
└── server.js
```

---

## 🎯 Design Decisions

### Why Socket.IO?

Collaborative editing requires low-latency bidirectional communication.

Socket.IO provides:

* Persistent connections
* Room management
* Event-based communication
* Automatic reconnection handling

---

### Why a Singleton Socket Client?

A single shared socket instance prevents accidental multiple connections and simplifies lifecycle management across React components.

---

### Why is `codeRef` stored in the parent component?

The editor content is needed by multiple features:

* Realtime synchronization
* Initial document sync
* Run Code functionality

Keeping it at the page level avoids unnecessary prop drilling and allows independent features to access the latest editor state.

---

### Why use a backend `/run` endpoint?

Instead of:

```
React
   │
   ▼
Execution Service
```

the project uses:

```
React
   │
POST /run
   │
   ▼
Backend
   │
   ▼
Execution Engine
```

This provides:

* Better separation of concerns
* Provider abstraction
* Easier future migration
* Improved security
* Cleaner frontend architecture

The frontend never depends directly on a third-party execution provider.

---

### Why Node VM instead of Judge0 or Piston?

The original design planned to use an external execution service.

During development:

* The public Piston API became whitelist-only.
* Judge0 was evaluated as an alternative.
* RapidAPI billing requirements were intentionally avoided for a learning project.

Instead, the execution logic was abstracted into a dedicated backend service:

```
executeCode.js
```

This allows the execution provider to be replaced in the future without modifying the frontend or API contract.

The current implementation supports JavaScript execution through Node.js VM while preserving a scalable architecture.

---

## ⚠️ Current Limitations

* JavaScript execution only.
* Execution is sandboxed using Node VM and is intended for development purposes.
* Multi-language execution is planned for future versions.

---

## 🚀 Future Improvements

* Judge0 integration
* Self-hosted Piston / Docker sandbox
* Authentication
* Shared terminal output
* Collaborative cursor positions
* File explorer
* Multiple files per room
* Persistent room storage
* Deployment to cloud infrastructure

---

## ⚙️ Installation

### Clone the repository

```bash
git clone <repository-url>
```

### Install frontend dependencies

```bash
cd client
npm install
```

### Install backend dependencies

```bash
cd ../server
npm install
```

### Start backend

```bash
npm start
```

### Start frontend

```bash
cd ../client
npm run dev
```

---

## 📚 Learning Outcomes

This project was built primarily as a learning exercise to deeply understand:

* React component architecture
* State ownership
* Socket.IO event flow
* Express server architecture
* Backend service abstraction
* Realtime synchronization
* Code editor integration
* HTTP vs WebSocket communication patterns
* Secure execution pipeline design

Rather than focusing solely on the final product, the goal was to understand why each architectural decision was made and how larger collaborative applications are structured internally.

---

## 📄 License

This project is intended for educational and portfolio purposes.
