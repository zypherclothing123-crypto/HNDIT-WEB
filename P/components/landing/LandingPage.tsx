'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Bot, Users, Trophy, Zap, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function LandingPage() {
  const features = [
    {
      icon: BookOpen,
      title: '50+ Labs',
      description: 'Comprehensive hands-on learning with practical exercises'
    },
    {
      icon: Bot,
      title: 'AI Tutor',
      description: 'Personalized learning assistant powered by advanced AI'
    },
    {
      icon: Users,
      title: 'Global Ranks',
      description: 'Compete with peers and track your progress worldwide'
    }
  ]

  const subjects = [
    {
      title: 'IT Fundamentals',
      labs: 12,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Programming Fundamentals',
      labs: 15,
      gradient: 'from-purple-500 to-indigo-600'
    },
    {
      title: 'Database Concepts',
      labs: 8,
      gradient: 'from-green-500 to-emerald-600'
    }
  ]

  return (
    <div className="min-h-screen bg-[#FFFFFA]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-tertiary flex items-center justify-center">
                <span className="text-on-primary font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold">HNDIT Lab</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#labs" className="text-sm font-semibold hover:text-primary">Labs</Link>
              <Link href="#tutor" className="text-sm font-semibold hover:text-primary">AI Tutor</Link>
              <Link href="#arena" className="text-sm font-semibold hover:text-primary">Achievements</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-primary">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-primary hover:bg-primary/90 text-on-primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="animate-fade-in-up"
            >
              <p className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider">
                Interactive Learning Platform
              </p>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Empower Your IT Journey
                <br />
                with HNDIT Lab
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                The sophisticated mentor for your HNDIT journey. Master concepts IT
                powered hands-on learning, AI assistance, and real-world practice.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/auth/register">
                  <Button className="bg-primary hover:bg-primary/90 text-on-primary px-8 py-6 text-lg rounded-xl">
                    Get Started for Free
                  </Button>
                </Link>
                <Link href="/labs">
                  <Button variant="ghost" className="border-2 border-primary text-primary hover:bg-primary/10 px-8 py-6 text-lg rounded-xl">
                    Explore Labs
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl p-12 shadow-soft">
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-tertiary flex items-center justify-center">
                      <Zap className="text-on-primary h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Daily Streak</p>
                      <p className="text-2xl font-bold">12🔥</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full mb-4">
                    <div className="h-full bg-primary rounded-full w-4/5"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">75% Complete</span>
                    <Link href="/labs">
                      <Button className="bg-primary hover:bg-primary/90 text-on-primary text-sm">
                        Resume Learning
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="animate-fade-in-up"
              >
                <Card className="border border-gray-200 rounded-2xl hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="h-14 w-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Labs by Subject Section */}
      <section id="labs" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                Curated Content
              </p>
              <h2 className="text-3xl font-bold">Labs by Subject</h2>
            </div>
            <Link href="/labs" className="text-primary font-semibold flex items-center gap-2 hover:gap-3 transition-all">
              Browse all subjects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {subjects.map((subject, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="animate-fade-in-up"
              >
                <Card className="border border-gray-200 rounded-2xl hover:shadow-lg transition-all overflow-hidden">
                  <div className={`h-32 bg-gradient-to-br ${subject.gradient}`}></div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{subject.title}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">{subject.labs} labs available</p>
                      <Link href="/labs">
                        <Button variant="ghost" className="text-primary p-0 h-auto hover:bg-transparent">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Tutor Section */}
      <section id="tutor" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-primary to-tertiary rounded-3xl p-12 text-white">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  AI Study Assistant: Your Personal 24/7 Mentor
                </h2>
                <p className="text-lg text-white/90 mb-8">
                  Stick to your curriculum 24/7! Our AI Tutor Assistant
                  answers your questions, from code debug to concept
                  explanations, in your preferred language.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/ai-tutor">
                    <Button className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg rounded-xl">
                      Try AI Tutor
                    </Button>
                  </Link>
                  <Link href="/labs">
                    <Button variant="ghost" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl">
                      Want Demo
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-3 w-3 rounded-full bg-warning"></div>
                  <div className="h-3 w-3 rounded-full bg-success"></div>
                  <div className="h-3 w-3 rounded-full bg-error"></div>
                  <span className="text-xs text-gray-500 ml-4">AI Assistant</span>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-xl p-4">
                    <p className="text-base text-gray-800">Can you explain pointers in C?</p>
                  </div>
                  <div className="bg-purple-100 rounded-xl p-4 ml-8">
                    <p className="text-base text-gray-800">
                      Sure! Pointers are variables that store memory addresses.
                      Think of them as a signpost pointing to a house...
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link href="/ai-tutor">
                    <Button className="bg-primary hover:bg-primary/90 text-on-primary text-sm">
                      Start Chatting
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Arena Section */}
      <section id="arena" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The Arena</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Level up your learning together. Challenge your classmates, earn XP and secure your place in
              the weekly leaderboards.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex gap-4 p-4 rounded-2xl bg-gray-50">
                <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center">
                  <Zap className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Live Battles</h3>
                  <p className="text-base text-gray-600">
                    Race head-to-head to solve quiz faster than your peers and multiply your weekly ranking!
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-2xl bg-gray-50">
                <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Dynamic Leaderboards</h3>
                  <p className="text-base text-gray-600">
                    See where you stand in real-time among your batchmates and the entire community.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-2xl bg-gray-50">
                <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Achievement Badges</h3>
                  <p className="text-base text-gray-600">
                    Unlock rare badges for consistent learning and top performance!
                  </p>
                </div>
              </div>
            </div>
            <div>
              <Card className="border border-gray-200 rounded-2xl shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      <span className="font-bold text-xl">Leaderboard</span>
                    </div>
                    <span className="text-xs bg-purple-100 text-primary px-2 py-1 rounded-full">
                      This Week
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { rank: 1, name: "Kavindu Perera", xp: "15,400 XP" },
                      { rank: 2, name: "Imandi Dinuksha", xp: "12,200 XP" },
                      { rank: 3, name: "Nimal Gamarachchi", xp: "9,800 XP" }
                    ].map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100">
                        <div className="flex items-center gap-4">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${
                            user.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                            user.rank === 2 ? 'bg-gray-200 text-gray-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {user.rank}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-tertiary flex items-center justify-center text-white font-bold">
                              {user.name[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{user.name}</p>
                              <p className="text-xs text-gray-500">Student</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">{user.xp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Link href="/leaderboard">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-on-primary rounded-xl">
                        View Full Leaderboard
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-tertiary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <span className="text-xl font-bold">HNDIT Lab</span>
              </div>
              <p className="text-base text-white/70">
                Empowering the next generation of IT professionals with hands-on learning.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-xs uppercase text-white/70 mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="/labs" className="text-base text-white/80 hover:text-white transition-colors">Labs</Link></li>
                <li><Link href="/ai-tutor" className="text-base text-white/80 hover:text-white transition-colors">AI Tutor</Link></li>
                <li><Link href="/leaderboard" className="text-base text-white/80 hover:text-white transition-colors">Leaderboard</Link></li>
                <li><Link href="/achievements" className="text-base text-white/80 hover:text-white transition-colors">Achievements</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-xs uppercase text-white/70 mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-base text-white/80 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-base text-white/80 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="text-base text-white/80 hover:text-white transition-colors">Contact Support</a></li>
                <li><a href="#" className="text-base text-white/80 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-xs uppercase text-white/70 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-base text-white/80 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-base text-white/80 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-base text-white/80 hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-base text-white/60">© 2024 HNDIT Lab. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="text-white/60 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-white/60 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
