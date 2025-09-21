# CarePilot: AI-Powered Appointment Booking

CarePilot is a modern, AI-integrated web application designed to streamline the patient appointment booking process for medical clinics. It features an intelligent chatbot for patients to book appointments conversationally and a secure admin dashboard for clinic staff to manage and track all bookings.

![CarePilot Screenshot](httpss://picsum.photos/seed/carepilot-readme/1200/600)

## ✨ Key Features

- **AI Chatbot for Booking**: Patients can book appointments easily through a conversational AI, available 24/7.
- **Emergency Prioritization**: The chatbot can detect urgent requests and automatically flag appointments as emergencies.
- **Admin Dashboard**: A secure, login-protected dashboard for clinic staff to view, update, and manage all appointments in real-time.
- **Appointment Management**: Admins can update appointment statuses (e.g., Appointed, On Hold) or remove bookings.
- **Patient Appointment History**: Registered patients can view a history of their past and upcoming appointments.
- **Responsive Design**: A clean and intuitive user interface that works seamlessly on both desktop and mobile devices.
- **Firebase Integration**: Built with a robust backend using Firebase for database (Firestore) and authentication.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI & Generative UI**: [Google Gemini](https://deepmind.google/technologies/gemini/) via [Genkit](https://firebase.google.com/docs/genkit)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore for database, Firebase Authentication for security)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Firebase Setup

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Firestore and Authentication**: In your new project, enable the **Firestore Database** and **Firebase Authentication** (with the Email/Password sign-in method).
3.  **Get Firebase Config**: Navigate to your Project Settings and copy the Firebase configuration object.
4.  **Update Config File**: Paste your configuration into `src/lib/firebase.ts`.

### Installation & Running Locally

1.  **Clone the repository**:
    ```sh
    git clone https://github.com/your-username/carepilot.git
    cd carepilot
    ```

2.  **Install NPM packages**:
    ```sh
    npm install
    ```

3.  **Create an Admin User**:
    - You will need to manually create an admin user in the Firebase Authentication console to be able to log into the admin dashboard.

4.  **Set up Environment Variables**:
    - You'll need a `.env` file for your Google Gemini API key if you don't already have one.

5.  **Run the development server**:
    ```sh
    npm run dev
    ```

The application will be available at `http://localhost:9002`.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/carepilot/issues).
