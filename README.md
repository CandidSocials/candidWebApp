# LocalTalent - Freelance Marketplace Platform

A modern web application connecting local businesses with talented professionals. Built with React, TypeScript, and Supabase.

## 🚀 Features

- **User Authentication**
  - Role-based access (Business & Freelancer)
  - Secure authentication with Supabase
  - Profile management

- **For Businesses**
  - Post job opportunities
  - Browse freelancer profiles
  - Review applications
  - Rate and review freelancers

- **For Freelancers**
  - Create professional profiles
  - Showcase portfolio
  - Apply to jobs
  - Track application status

- **Core Functionality**
  - Real-time updates
  - Advanced search and filtering
  - Location-based matching
  - Rating and review system
  - Secure messaging

## 🛠️ Tech Stack

- **Frontend**
  - React 18
  - TypeScript
  - Tailwind CSS
  - Shadcn UI
  - Lucide Icons

- **Backend**
  - Supabase
  - PostgreSQL
  - Row Level Security (RLS)

- **Tools & Infrastructure**
  - Vite
  - ESLint
  - Prettier
  - Git

## 📦 Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/localtalent.git
cd localtalent
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Add your Supabase credentials to `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Start the development server
```bash
npm run dev
```

## 🗄️ Database Setup

1. Create a new Supabase project
2. Run the migration scripts in `supabase/migrations`
3. Set up the RLS policies as defined in the migration files

## 🔒 Environment Variables

Create a `.env` file with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 Project Structure

```
src/
├── components/        # Reusable components
├── pages/            # Page components
├── lib/              # Utilities and configurations
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
└── styles/           # Global styles
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.io/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/yourusername/localtalent](https://github.com/yourusername/localtalent)