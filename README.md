# AI Spend Audit

A modern web application that helps businesses optimize their AI tool spending by analyzing subscriptions and providing cost-saving recommendations.

## 🚀 Features

- **Smart Audit Analysis**: Analyze AI tool subscriptions and identify optimization opportunities
- **Cost Savings Recommendations**: Get personalized suggestions to reduce monthly spending by up to 70%
- **Shareable Results**: Generate shareable links for audit results (public view excludes sensitive data)
- **Lead Capture**: Collect user information for follow-up and insights
- **AI-Powered Summary**: Generate intelligent audit summaries using OpenAI GPT-3.5
- **Modern UI/UX**: Clean, responsive design inspired by modern SaaS applications

## 🛠 Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI API (GPT-3.5-turbo)
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key (optional, for AI summaries)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-spend-audit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql`
   - Configure Row Level Security policies

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

The application uses two main tables:

### `audits`
- Stores audit results with tool data and savings calculations
- Supports public sharing via unique IDs
- Row Level Security for public access control

### `leads`
- Captures user information for lead generation
- Links to audit results for context
- Validates email and prevents duplicates

## 🔧 Configuration

### Supabase Setup
1. Create a new project in Supabase Dashboard
2. Run the provided SQL schema in the SQL Editor
3. Enable Row Level Security (RLS)
4. Add your Supabase URL and anon key to `.env.local`

### OpenAI Setup (Optional)
1. Get an API key from OpenAI Dashboard
2. Add it to your `.env.local` file
3. Without this key, the app uses fallback summaries

## 📱 Usage

1. **Start an Audit**: Add your AI tool subscriptions with current costs
2. **Review Results**: See optimization opportunities and potential savings
3. **Share Results**: Generate shareable links for stakeholders
4. **Save Information**: Optional lead capture for personalized insights

## 🎨 Design System

The application follows modern SaaS design principles:
- **Color Palette**: Blue/Indigo gradients with slate neutrals
- **Typography**: System fonts with clear hierarchy
- **Components**: Rounded corners, subtle shadows, smooth animations
- **Responsive**: Mobile-first design with desktop enhancements

## 🔒 Security & Privacy

- **Public Sharing**: Sensitive data (email, company name) excluded from public views
- **Row Level Security**: Database access controlled via Supabase RLS
- **Input Validation**: Client and server-side validation for all forms
- **Rate Limiting**: Basic spam prevention on lead capture

## 📈 Performance

- **Optimized Images**: Next.js Image component for all assets
- **Code Splitting**: Automatic route-based code splitting
- **Caching**: Supabase queries cached where appropriate
- **Bundle Size**: Optimized dependencies and tree-shaking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

Built with ❤️ using Next.js, TypeScript, Tailwind CSS, and Supabase.
