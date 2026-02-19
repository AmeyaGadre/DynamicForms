---
description: How to run the Dynamic Forms application
---

### Backend Setup
1. Open a terminal in the `backend` directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Open another terminal in the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

### Usage
- The first user to sign up will automatically get **Admin** privileges.
- Use a **10-digit mobile number** and a **4-digit PIN** as password.
- Access the Admin Dashboard from the navbar to manage users.
