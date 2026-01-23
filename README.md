# 🚀 FlexiGo

**Connect event businesses with reliable part-time workers**

FlexiGo is a modern Progressive Web Application (PWA) that bridges the gap between event businesses and skilled part-time workers. Built with Next.js 16 and powered by Supabase, FlexiGo provides a fast, reliable, and seamless platform for flexible workforce management.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.86.0-3ecf8e)](https://supabase.com/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Setup](#-environment-setup)
- [Available Scripts](#-available-scripts)
- [API Routes](#-api-routes)
- [User Roles](#-user-roles)
- [PWA Features](#-pwa-features)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### For Businesses
- 📝 **Create Job Postings** - Post flexible work opportunities with detailed requirements
- 👥 **Manage Applications** - Review and manage worker applications efficiently
- 📊 **Business Profiles** - Create and manage comprehensive business profiles
- 🔍 **Find Talent** - Access a pool of skilled part-time workers
- 📱 **Mobile-First** - Manage your workforce on the go

### For Workers
- 🔎 **Browse Jobs** - Discover relevant part-time opportunities
- 📄 **Quick Apply** - Apply to jobs with your professional profile
- 👤 **Worker Profiles** - Showcase your skills and experience
- 📲 **Real-Time Updates** - Stay informed about application status
- 💼 **Track Applications** - Monitor all your job applications in one place

### Platform Features
- 🔐 **Secure Authentication** - Email/password authentication with password recovery
- 🎨 **Modern UI/UX** - Clean, intuitive interface with Tailwind CSS
- 📱 **Progressive Web App** - Installable on any device, works offline
- ⚡ **Real-Time Data** - Powered by Supabase for instant updates
- 🔄 **Responsive Design** - Seamless experience across all devices
- 🎯 **Role-Based Access** - Separate workflows for businesses and workers

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **UI Library**: [React 19](https://reactjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Validation**: [Zod 4](https://zod.dev/)
- **PWA**: [next-pwa](https://github.com/shadowwalker/next-pwa)

### Backend
- **Database & Auth**: [Supabase](https://supabase.com/)
- **API**: Next.js API Routes
- **Type Safety**: TypeScript with strict mode

### Development Tools
- **Linting**: ESLint with Next.js config
- **Package Manager**: npm
- **Version Control**: Git

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm, yarn, pnpm, or bun
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FlexiGo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

The application will be accessible on your network at `http://<your-ip>:3000` (configured with `-H 0.0.0.0`)

---

## 📁 Project Structure

```
FlexiGo/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── applications/         # Job application endpoints
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── businesses/           # Business profile endpoints
│   │   ├── jobs/                 # Job posting endpoints
│   │   └── workers/              # Worker profile endpoints
│   ├── components/               # Reusable React components
│   │   ├── ui/                   # UI components (Button, Input, Toast)
│   │   ├── AuthForm.tsx
│   │   ├── AuthRolePicker.tsx
│   │   ├── BottomNav.tsx
│   │   ├── Header.tsx
│   │   └── ServiceWorkerRegistration.tsx
│   ├── applications/             # Applications management pages
│   ├── dashboard/                # Dashboard page
│   ├── jobs/                     # Job-related pages
│   ├── profile/                  # Profile pages (business & worker)
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   ├── forgot-password/          # Password recovery
│   ├── reset-password/           # Password reset
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── lib/                          # Utility libraries
│   ├── supabase.ts               # Supabase client
│   ├── utils.ts                  # Helper functions
│   └── validators/               # Zod schemas
├── types/                        # TypeScript type definitions
│   ├── business.d.ts
│   └── worker.d.ts
├── public/                       # Static assets
│   ├── icons/                    # App icons
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service worker
└── [config files]                # Configuration files
```

---

## ⚙️ Environment Setup

### Required Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Development Settings
NODE_ENV=development
```

### Supabase Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Set up the required tables for:
   - Users (authentication)
   - Worker profiles
   - Business profiles
   - Job postings
   - Applications
3. Configure Row Level Security (RLS) policies
4. Copy your project URL and anon key to `.env.local`

---

## 📜 Available Scripts

```bash
# Development server (accessible on network)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

---

## 🔌 API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Worker Profiles
- `GET /api/workers/profile` - Get worker profile
- `POST /api/workers/profile/create` - Create worker profile

### Business Profiles
- `GET /api/businesses/profile` - Get business profile
- `POST /api/businesses/profile/create` - Create business profile

### Jobs
- `GET /api/jobs/list` - List all jobs
- `GET /api/jobs/business` - Get business's jobs
- `POST /api/jobs/create` - Create new job
- `GET /api/jobs/[jobId]/applicants` - Get job applicants
- `POST /api/jobs/update-status` - Update job status

### Applications
- `POST /api/applications/apply` - Apply to a job
- `GET /api/applications/business` - Get business applications
- `POST /api/applications/update` - Update application status

---

## 👥 User Roles

### Worker
- Browse and search available jobs
- Create and manage worker profile
- Apply to job postings
- Track application status

### Business
- Post job opportunities
- Create and manage business profile
- Review worker applications
- Manage applicant status

---

## 📱 PWA Features

FlexiGo is a Progressive Web Application with:

- ✅ **Installable** - Add to home screen on any device
- ✅ **Offline Support** - Service worker for offline functionality
- ✅ **App-like Experience** - Standalone display mode
- ✅ **Responsive** - Works on desktop, tablet, and mobile
- ✅ **Fast Loading** - Optimized performance with Next.js
- ✅ **Push Notifications** - Stay updated (when implemented)

### Manifest Configuration

```json
{
  "name": "FlexiGo",
  "short_name": "FlexiGo",
  "theme_color": "#124E66",
  "background_color": "#F8F9FA",
  "display": "standalone"
}
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint configuration provided
- Write meaningful commit messages
- Add comments for complex logic

---

## 📄 License

This project is part of an individual academic project for Semester 5.

---

## 📧 Support

For support, please contact the development team or open an issue in the repository.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons and design inspiration from the community

---

**Made with ❤️ for flexible workforce solutions**
