import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";
import Link from "next/link";


export const metadata = {
  title: "HNDIT Smart Lab — AI-Powered Learning Platform",
  description:
    "Master HNDIT with AI-powered quizzes, labs, and a 24/7 AI Study Assistant. Join hundreds of students on the smart way to pass your exams.",
};

const features = [
  {
    icon: <i className="fa-solid fa-laptop-code text-white text-2xl"></i>,
    title: "AI Study Assistant",
    description:
      "Chat with your personal AI tutor 24/7. Get instant explanations, practice questions, and tailored study plans for every HNDIT module.",
    gradient: "from-violet-500 to-indigo-500",
  },
  {
    icon: <i className="fa-solid fa-network-wired text-white text-2xl"></i>,
    title: "Interactive Labs",
    description:
      "Hands-on coding and networking labs with real-time feedback. Practice what you learn in a safe, sandboxed environment.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: <i className="fa-solid fa-file-circle-check text-white text-2xl"></i>,
    title: "Smart Quizzes",
    description:
      "Adaptive quizzes that learn your weaknesses. Spaced repetition ensures you remember what matters most on exam day.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: <i className="fa-solid fa-trophy text-white text-2xl"></i>,
    title: "Leaderboard",
    description:
      "Compete with classmates and climb the ranks. Gamified achievements keep you motivated throughout your studies.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: <i className="fa-solid fa-chart-line text-white text-2xl"></i>,
    title: "Progress Analytics",
    description:
      "Detailed dashboards show your growth over time — subject scores, time spent, and areas that need attention.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: <i className="fa-solid fa-bullseye text-white text-2xl"></i>,
    title: "Exam Simulator",
    description:
      "Full-length mock exams with real-time scoring, instant review, and performance benchmarks against peers.",
    gradient: "from-purple-500 to-violet-500",
  },
];

const testimonials = [
  {
    name: "Kasun Perera",
    role: "HNDIT Year 2",
    avatar: "KP",
    text: "The AI tutor explained network protocols better than any textbook. I went from failing practice tests to topping my class!",
    rating: 5,
  },
  {
    name: "Nimali Silva",
    role: "HNDIT Year 1",
    avatar: "NS",
    text: "I used to spend hours on revision. With Smart Lab's spaced repetition, I study smarter and remember more. Absolutely game-changing.",
    rating: 5,
  },
  {
    name: "Thilina Fernando",
    role: "HNDIT Graduate",
    avatar: "TF",
    text: "The labs gave me real hands-on experience. I walked into my exam confident. HNDIT Smart Lab is the reason I passed with distinction.",
    rating: 5,
  },
];

const modules = [
  "Computer Systems",
  "Networking Fundamentals",
  "Database Management",
  "Web Technologies",
  "Programming Concepts",
  "Operating Systems",
  "Software Engineering",
  "Cybersecurity Basics",
];

export default function LandingPage() {
  return (
    <div className="landing-root">
      {/* Animated background orbs */}
      <div className="landing-bg-orbs" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>

      {/* ── NAVBAR ── */}
      <nav className="absolute top-0 w-full z-50 px-6 py-6 flex justify-center">
        <div className="landing-container w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-primary rounded-md flex items-center justify-center">
              <i className="fa-solid fa-globe text-primary text-xl"></i>
            </div>
            <span className="text-xl font-bold text-primary tracking-widest uppercase">
              HNDIT
            </span>
          </div>

          <div className="hidden md:flex items-center justify-center gap-8 flex-1">
            <a href="#" className="custom-nav-link active">Home</a>
            <a href="#features" className="custom-nav-link">About</a>
            <a href="#modules" className="custom-nav-link">Services</a>
            <a href="#testimonials" className="custom-nav-link">Gallary</a>
            <a href="#contact" className="custom-nav-link">Contact</a>
          </div>

          <div className="hidden md:flex items-center justify-end w-[240px] gap-4">
            <Link href="/auth/login" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link href="/auth/register" className="bg-primary hover:opacity-90 text-primary-foreground text-sm font-bold py-2 px-4 rounded transition-opacity">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="landing-hero">
        <div className="landing-container">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto gap-6">
            <div className="landing-badge">
              <span className="landing-badge-dot" />
              <i className="fa-solid fa-graduation-cap mr-2"></i> Sri Lanka&apos;s #1 HNDIT Study Platform
            </div>

            <h1 className="landing-hero-title">
              Study Smarter,{" "}
              <span className="landing-gradient-text">Pass Faster</span>
              <br />
              with AI-Powered Learning
            </h1>

            <p className="landing-hero-subtitle mx-auto">
              HNDIT Smart Lab combines adaptive AI tutoring, interactive labs,
              and intelligent quizzes to help you excel in every HNDIT module —
              from Computer Systems to Cybersecurity.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-6 mb-8">
              <Link href="/auth/register" className="landing-btn-primary">
                Start Learning Free ➔
              </Link>
              <a href="#features" className="landing-btn-secondary">
                Explore Features
              </a>
            </div>

            {/* Stats strip with animation */}
            <div className="landing-stats-strip items-center justify-center mt-6 p-8 rounded-3xl bg-white/40 dark:bg-[#1a1a2e]/40 border border-[#534AB7]/10 backdrop-blur-xl w-full shadow-lg shadow-[#534AB7]/5">
              <AnimatedCounter end={500} suffix="+" label="Active Students" />
              <div className="w-px h-10 bg-[#534AB7]/10 dark:bg-[#9d96e8]/20 hidden sm:block mx-4" />
              <AnimatedCounter end={2000} suffix="+" label="Practice Questions" />
              <div className="w-px h-10 bg-[#534AB7]/10 dark:bg-[#9d96e8]/20 hidden sm:block mx-4" />
              <AnimatedCounter end={98} suffix="%" label="Pass Rate" />
              <div className="w-px h-10 bg-[#534AB7]/10 dark:bg-[#9d96e8]/20 hidden sm:block mx-4" />
              <AnimatedCounter end={24} suffix="/7" label="AI Support" />
            </div>

            {/* Trust badges */}
            <div className="landing-trust-row mt-4">
              <span className="landing-trust-badge"><i className="fa-solid fa-lock mr-2"></i> Secure & Private</span>
              <span className="landing-trust-badge"><i className="fa-solid fa-check mr-2"></i> Free to Join</span>
              <span className="landing-trust-badge"><i className="fa-solid fa-rocket mr-2"></i> Instant Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="landing-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <div className="landing-badge"><i className="fa-solid fa-star mr-2"></i> Platform Features</div>
            <h2 className="landing-section-title">
              Everything you need to{" "}
              <span className="landing-gradient-text">ace your exams</span>
            </h2>
            <p className="landing-section-subtitle">
              A complete learning ecosystem designed specifically for HNDIT
              students, powered by cutting-edge AI.
            </p>
          </div>

          <div className="landing-features-grid">
            {features.map((f) => (
              <div key={f.title} className="landing-feature-card">
                <div className={`landing-feature-icon bg-gradient-to-br ${f.gradient}`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mt-4 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="landing-section landing-section-alt">
        <div className="landing-container">
          <div className="landing-section-header">
            <div className="landing-badge"><i className="fa-solid fa-list-ol mr-2"></i> How It Works</div>
            <h2 className="landing-section-title">
              Start learning in{" "}
              <span className="landing-gradient-text">3 simple steps</span>
            </h2>
          </div>

          <div className="landing-steps-grid">
            {[
              {
                step: "01",
                title: "Create Your Account",
                desc: "Sign up for free with your email. No credit card required. Instant access to all features.",
                icon: <i className="fa-solid fa-user-plus text-[#534AB7] dark:text-[#9d96e8] text-4xl"></i>,
              },
              {
                step: "02",
                title: "Choose Your Modules",
                desc: "Select the HNDIT subjects you're studying. The AI builds a personalised learning path for you.",
                icon: <i className="fa-solid fa-book-open text-[#534AB7] dark:text-[#9d96e8] text-4xl"></i>,
              },
              {
                step: "03",
                title: "Learn & Achieve",
                desc: "Practice daily, chat with the AI tutor, complete labs, and track your progress to exam success.",
                icon: <i className="fa-solid fa-medal text-[#534AB7] dark:text-[#9d96e8] text-4xl"></i>,
              },
            ].map((s) => (
              <div key={s.step} className="landing-step-card">
                <div className="landing-step-number">{s.step}</div>
                <div className="mb-4">{s.icon}</div>
                <h3 className="text-xl font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODULES ── */}
      <section id="modules" className="landing-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <div className="landing-badge"><i className="fa-solid fa-book-open mr-2"></i> Curriculum Coverage</div>
            <h2 className="landing-section-title">
              All{" "}
              <span className="landing-gradient-text">HNDIT modules</span>{" "}
              covered
            </h2>
            <p className="landing-section-subtitle mx-auto">
              Comprehensive content aligned with the official HNDIT syllabus.
            </p>
          </div>

          <div className="landing-modules-grid">
            {modules.map((m, i) => (
              <div key={m} className="landing-module-chip">
                <span className="landing-module-num">{String(i + 1).padStart(2, "0")}</span>
                <span>{m}</span>
                <span className="landing-module-arrow">→</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="landing-section landing-section-alt">
        <div className="landing-container">
          <div className="landing-section-header">
            <div className="landing-badge"><i className="fa-solid fa-comments mr-2"></i> Student Reviews</div>
            <h2 className="landing-section-title">
              Loved by students{" "}
              <span className="landing-gradient-text">across Sri Lanka</span>
            </h2>
          </div>

          <div className="landing-testimonials-grid">
            {testimonials.map((t) => (
              <div key={t.name} className="landing-testimonial-card">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-6 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="landing-avatar">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT US ── */}
      <section id="contact" className="py-20 bg-background">
        <div className="landing-container max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Get In Touch</h2>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full bg-card border border-border rounded-md p-3 focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full bg-card border border-border rounded-md p-3 focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full bg-card border border-border rounded-md p-3 focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
                />
                <input
                  type="tel"
                  placeholder="Contact Number"
                  className="w-full bg-card border border-border rounded-md p-3 focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
                />
                <textarea
                  placeholder="Message"
                  rows={4}
                  className="w-full bg-card border border-border rounded-md p-3 focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground resize-none"
                />
                <button
                  type="button"
                  className="bg-primary hover:opacity-90 text-primary-foreground font-bold py-3 px-8 rounded transition-opacity uppercase text-sm tracking-wide mt-2"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Contact Us</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-10">
                Have questions about HNDIT Smart Lab? Whether you need help with your courses,
                have feedback on our AI assistant, or want to suggest a new feature,
                our team is here for you. We strive to provide the best learning experience
                for HNDIT students.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-phone text-primary-foreground text-2xl"></i>
                  </div>
                  <span className="text-muted-foreground text-sm">+94 77 123 4567</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-envelope text-primary-foreground text-2xl"></i>
                  </div>
                  <span className="text-muted-foreground text-sm">support@hnditsmartlab.lk</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-globe text-primary-foreground text-2xl"></i>
                  </div>
                  <span className="text-muted-foreground text-sm">www.hnditsmartlab.lk</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-location-dot text-primary-foreground text-2xl"></i>
                  </div>
                  <span className="text-muted-foreground text-sm">SLIATE Head Office<br />Colombo, Sri Lanka</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-card pt-16 pb-8 text-card-foreground">
        <div className="landing-container max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 border-2 border-primary rounded flex items-center justify-center">
                  <i className="fa-solid fa-globe text-primary font-bold text-sm"></i>
                </div>
                <span className="text-2xl font-bold tracking-wider text-primary uppercase">
                  HNDIT
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed pr-4">
                HNDIT Smart Lab is Sri Lanka&apos;s leading interactive learning platform for Higher National Diploma in Information Technology students, powered by advanced AI.
              </p>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-foreground">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Home</a></li>
                <li><a href="#about" className="text-muted-foreground hover:text-foreground text-sm transition-colors">About</a></li>
                <li><a href="#features" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Features</a></li>
                <li><a href="#modules" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Modules</a></li>
                <li><a href="#testimonials" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Reviews</a></li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-foreground">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Legal</a></li>
                <li><a href="#contact" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* Socials */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-foreground">Socials</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors flex items-center gap-2"><i className="fa-brands fa-facebook-f text-base"></i> Facebook</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors flex items-center gap-2"><i className="fa-brands fa-twitter text-base"></i> Twitter</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors flex items-center gap-2"><i className="fa-brands fa-instagram text-base"></i> Instagram</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors flex items-center gap-2"><i className="fa-brands fa-linkedin-in text-base"></i> LinkedIn</a></li>
              </ul>
            </div>

          </div>

          {/* Copyright */}
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            Designed and Developed by <span className="text-primary">HNDIT Smart Lab Team</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
