import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Network, 
  BrainCircuit, 
  Compass, 
  CheckCircle, 
  Star, 
  ArrowRight, 
  Zap, 
  GraduationCap, 
  ShieldCheck,
  Code2,
  Database,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';

import heroImage from '../assets/hero.png';

const Home = () => {
  const [openFaq, setOpenFaq] = React.useState(null);
  
  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "How fast does KnowledgeGraph.AI parse uploaded textbooks?",
      a: "Standard PDFs of 10-30 pages are processed in less than 5 seconds. Deep scans or textbooks exceeding 100 pages might require up to 20 seconds as the AI reads tables, indexes vector embeddings, and builds the connection graph."
    },
    {
      q: "What formatting and file structures are supported?",
      a: "We support all standard digital PDF configurations. Textbooks with multi-column layouts, mathematical notation, and research headers are programmatically converted into clean token slices before ingestion."
    },
    {
      q: "Can I configure custom learning milestones?",
      a: "Yes. In the Roadmaps workspace, you can toggle quiz integration, enable simulated developer execution environments, and choose target topics to tailor nodes recursively based on topological difficulty."
    },
    {
      q: "How does the visual BFS / DFS traversal algorithm help me learn?",
      a: "BFS (Breadth-First Search) highlights all basic prerequisite concepts first, helping you build a broad foundation. DFS (Depth-First Search) takes you deep down a single path, ideal for master-level deep dives into specific topics."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex flex-col text-slate-100 font-sans antialiased selection:bg-pink-500/30">
      <Navbar />

      {/* Hero Section */}
      <header className="relative overflow-hidden pt-24 pb-20 px-6">
        {/* Glow Elements */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 glow-blob animate-mesh-drift"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 glow-blob animate-mesh-drift" style={{ animationDelay: '-5s' }}></div>

        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-8 shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Introducing KnowledgeGraph.AI v1.0</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] max-w-5xl text-gradient-primary">
            Learn Faster by Mapping{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Concept Dependencies
            </span>
          </h1>

          {/* Subtext */}
          <p className="mt-8 text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl leading-relaxed">
            Upload complex textbook PDFs, research papers, or study notes. Our AI analyzes the text, extracts key topics, and constructs structured visual maps, learning roadmaps, and Q&A chat.
          </p>

          {/* Call to actions */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-8 py-3.5 rounded-xl border border-indigo-500/30 shadow-xl shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all text-center flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold px-8 py-3.5 rounded-xl border border-slate-800 hover:border-slate-700 hover:-translate-y-0.5 active:translate-y-0 transition-all text-center cursor-pointer"
            >
              Sign In to Account
            </Link>
          </div>

          {/* App Dashboard Mockup Preview */}
          <div className="mt-16 w-full border border-purple-500/30 bg-white/5 p-2 rounded-2xl shadow-2xl shadow-pink-500/20 backdrop-blur-xl">
            <div className="border border-white/10 bg-black/40 rounded-xl overflow-hidden aspect-[16/9] flex flex-col relative group">
              {/* Fake Window Controls */}
              <div className="bg-black/60 border-b border-white/10 px-4 py-3 flex items-center gap-2 backdrop-blur-md">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70"></span>
                <span className="text-[10px] text-slate-300 font-semibold ml-2 select-none">app.knowledgegraph.ai/dashboard</span>
              </div>
              {/* Mock content illustration with Image */}
              <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-900/50 to-purple-900/50">
                <img src={heroImage} alt="Knowledge Graph Hero" className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-screen" />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-purple-900/40 to-transparent"></div>
                <div className="flex flex-col items-center gap-6 relative z-10 max-w-md text-center">
                  <div className="bg-white/10 border border-white/20 p-4 rounded-full backdrop-blur-md shadow-lg shadow-pink-500/20">
                    <Network className="w-12 h-12 text-pink-300 animate-pulse" />
                  </div>
                  <div className="bg-black/40 p-6 rounded-2xl backdrop-blur-md border border-white/10">
                    <h4 className="text-xl font-bold text-white drop-shadow-md">Interactive Node-Link Visualization</h4>
                    <p className="text-sm text-slate-200 mt-2 leading-relaxed drop-shadow">
                      Visualize prerequisite sequences and explore key textbook nodes dynamically using visual DFS/BFS algorithms.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Metrics Stats Bar */}
      <section className="border-y border-white/10 bg-white/5 py-10 px-6 relative z-10 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col gap-1">
            <span className="text-3xl md:text-4xl font-extrabold text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">1.2M+</span>
            <span className="text-xs text-slate-200 font-medium">Concepts Indexed</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl md:text-4xl font-extrabold text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">99.8%</span>
            <span className="text-xs text-slate-200 font-medium">AI Graph Accuracy</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl md:text-4xl font-extrabold text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">450K+</span>
            <span className="text-xs text-slate-200 font-medium">Hours Saved</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl md:text-4xl font-extrabold text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]">180+</span>
            <span className="text-xs text-slate-200 font-medium">Universities Supported</span>
          </div>
        </div>
      </section>

      {/* Featured Integrations Section */}
      <section className="py-12 bg-white/5 px-6 relative z-10 border-b border-white/10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-6">
          <span className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase">
            Seamlessly import files from your ecosystem
          </span>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors">
              <span className="text-xl">📁</span> Google Drive
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors">
              <span className="text-xl">📦</span> Dropbox
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors">
              <span className="text-xl">📓</span> Notion Sync
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors">
              <span className="text-xl">🪐</span> Jupyter Notebooks
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="border-t border-white/10 bg-white/5 py-24 px-6 relative z-10 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
              Engineered for Academic Mastery
            </h2>
            <p className="text-slate-200 mt-4 text-sm leading-relaxed">
              Our backend parsing pipeline breaks down textbooks into localized index trees to accelerate comprehension.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 p-8 rounded-3xl flex flex-col gap-4 border border-white/20 hover:border-pink-400/50 hover:shadow-2xl hover:shadow-pink-500/20 transition-all hover:-translate-y-2 backdrop-blur-xl">
              <div className="bg-indigo-500/20 border border-indigo-500/50 p-3 rounded-2xl w-fit shadow-lg shadow-indigo-500/20">
                <Network className="w-6 h-6 text-indigo-300" />
              </div>
              <h3 className="text-lg font-bold text-white">Visual Graph Mapping</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Render dynamic 2D React Flow maps showing concepts ordered by difficulty. Run step-by-step traversal animations (BFS & DFS) to master prerequisites in order.
              </p>
            </div>

            <div className="bg-white/10 p-8 rounded-3xl flex flex-col gap-4 border border-white/20 hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all hover:-translate-y-2 backdrop-blur-xl">
              <div className="bg-purple-500/20 border border-purple-500/50 p-3 rounded-2xl w-fit shadow-lg shadow-purple-500/20">
                <BrainCircuit className="w-6 h-6 text-purple-300" />
              </div>
              <h3 className="text-lg font-bold text-white">Contextual RAG Q&A</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Chat with an AI tutor grounded in your PDF documents. The tutor searches raw vectors and graph structures, citing specific page blocks as references.
              </p>
            </div>

            <div className="bg-white/10 p-8 rounded-3xl flex flex-col gap-4 border border-white/20 hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all hover:-translate-y-2 backdrop-blur-xl">
              <div className="bg-blue-500/20 border border-blue-500/50 p-3 rounded-2xl w-fit shadow-lg shadow-blue-500/20">
                <Compass className="w-6 h-6 text-blue-300" />
              </div>
              <h3 className="text-lg font-bold text-white">Study Path Roadmaps</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Select a target topic, and our algorithm calculates topological dependencies recursively, creating step-by-step milestones with estimated times.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 border-t border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gradient-primary">
              How It Works
            </h2>
            <p className="text-slate-400 mt-4 text-sm leading-relaxed">
              Go from a raw PDF document to an interactive visual curriculum in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center gap-4 relative">
              <div className="w-12 h-12 rounded-full bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-lg">
                1
              </div>
              <h3 className="text-base font-bold text-slate-200 mt-2">Upload Materials</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Upload your course PDF sheets, textbooks, or notes (up to 15MB) through the dashboard dropzone.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center gap-4 relative">
              <div className="w-12 h-12 rounded-full bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-lg">
                2
              </div>
              <h3 className="text-base font-bold text-slate-200 mt-2">Automated AI Synthesis</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Our pipeline extracts key concepts, indexes vector embeddings, and builds topological connection dependencies.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center gap-4 relative">
              <div className="w-12 h-12 rounded-full bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-lg">
                3
              </div>
              <h3 className="text-base font-bold text-slate-200 mt-2">Interact and Learn</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Navigate the graph structure, run animations, chat with the AI tutor, and map out study paths.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Tiers Section */}
      <section id="pricing" className="py-24 px-6 border-t border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gradient-primary">
              Flexible Pricing Tiers
            </h2>
            <p className="text-slate-400 mt-4 text-sm leading-relaxed">
              Find a plan suited to your academic requirements, from individual students to school programs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="glass p-8 rounded-2xl flex flex-col gap-6 border border-slate-800/80 hover:border-slate-700/60 transition-all relative">
              <div>
                <h3 className="text-lg font-bold text-slate-200">Basic Learner</h3>
                <p className="text-xs text-slate-400 mt-1">For basic document indexing</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-100">$0</span>
                <span className="text-xs text-slate-500">/ forever</span>
              </div>
              <ul className="text-xs text-slate-400 flex flex-col gap-3 my-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>3 PDF Document uploads</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>10 Page limit per document</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive Graph Viewer</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Standard BFS & DFS Paths</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="w-full py-2.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-200 text-xs font-bold text-center mt-auto hover:bg-slate-800 transition-colors"
              >
                Start Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="glass p-8 rounded-2xl flex flex-col gap-6 border-2 border-indigo-600/70 hover:border-indigo-600 transition-all relative shadow-xl shadow-indigo-950/20">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">
                Most Popular
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-200">Pro Researcher</h3>
                <p className="text-xs text-slate-400 mt-1">For advanced university study</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-100">$19</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <ul className="text-xs text-slate-400 flex flex-col gap-3 my-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited Document uploads</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Up to 150 pages per PDF</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>High-priority processing queue</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive RAG Tutor Chatbot</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Recursive study path roadmaps</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold text-center mt-auto shadow-md shadow-indigo-600/20 transition-all"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="glass p-8 rounded-2xl flex flex-col gap-6 border border-slate-800/80 hover:border-slate-700/60 transition-all relative">
              <div>
                <h3 className="text-lg font-bold text-slate-200">Department / Institution</h3>
                <p className="text-xs text-slate-400 mt-1">For schools and research labs</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-100">Custom</span>
                <span className="text-xs text-slate-500">/ tailored</span>
              </div>
              <ul className="text-xs text-slate-400 flex flex-col gap-3 my-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Shared workspace integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Custom LLM deployment (fine-tuned)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>API access & custom dashboard widgets</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dedicated support & SLA</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="w-full py-2.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-200 text-xs font-bold text-center mt-auto hover:bg-slate-800 transition-colors"
              >
                Contact Institution Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 border-t border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gradient-primary">
              Loved by Students & Academics
            </h2>
            <p className="text-slate-400 mt-4 text-sm leading-relaxed">
              Here is how students and researchers are using KnowledgeGraph.AI to structure their study.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass p-8 rounded-2xl border border-slate-800/80 flex flex-col gap-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "As a computer science student, mapping complex networks or linear algebra concepts visually helps me spot prerequisite gaps. The DFS animations demonstrate exactly what I need to learn in sequence."
              </p>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400">
                  AR
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Alex Rivera</h4>
                  <p className="text-[10px] text-slate-500">CS Undergraduate, MIT</p>
                </div>
              </div>
            </div>

            <div className="glass p-8 rounded-2xl border border-slate-800/80 flex flex-col gap-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Analyzing research papers on machine learning used to take hours. Now, I upload the paper and use semantic search to locate matching concepts, reading through paragraphs referenced in the Concept Inspector."
              </p>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-pink-400">
                  SH
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Dr. Sarah Hansen</h4>
                  <p className="text-[10px] text-slate-500">Machine Learning Postdoc, Stanford</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SaaS FAQ Accordion Section */}
      <section className="py-24 px-6 border-t border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gradient-primary">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 mt-4 text-sm">
              Everything you need to know about concept-mapping, parsing algorithms, and study paths.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="glass rounded-xl border border-slate-800/60 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-6 text-left font-semibold text-sm text-slate-200 hover:text-slate-100 hover:bg-slate-800/20 transition-all cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    openFaq === idx ? 'max-h-40 border-t border-slate-800/40' : 'max-h-0'
                  }`}
                >
                  <p className="p-6 text-xs leading-relaxed text-slate-400">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-Column SaaS Footer */}
      <footer className="border-t border-white/10 bg-black/40 px-6 pt-16 pb-8 relative z-10 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Logo column */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-indigo-600/10 p-2 rounded-lg border border-indigo-500/20">
                <Network className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-slate-100 to-indigo-300 bg-clip-text text-transparent">
                KnowledgeGraph.AI
              </span>
            </Link>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Transforming linear textbooks into multi-dimensional interactive concept maps. Optimize your study roadmaps using topology.
            </p>
          </div>

          {/* Product links */}
          <div className="flex flex-col gap-3 text-xs">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Product</h4>
            <Link to="/#features" className="text-slate-500 hover:text-indigo-400 transition-colors">Features</Link>
            <Link to="/#pricing" className="text-slate-500 hover:text-indigo-400 transition-colors">Pricing Plans</Link>
            <Link to="/login" className="text-slate-500 hover:text-indigo-400 transition-colors">Sign In</Link>
            <Link to="/register" className="text-slate-500 hover:text-indigo-400 transition-colors">Register Free</Link>
          </div>

          {/* Tech stack */}
          <div className="flex flex-col gap-3 text-xs">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Architecture</h4>
            <span className="text-slate-500 flex items-center gap-1"><Database className="w-3.5 h-3.5 shrink-0" /> MongoDB In-Memory</span>
            <span className="text-slate-500 flex items-center gap-1"><Code2 className="w-3.5 h-3.5 shrink-0" /> Express & MERN</span>
            <span className="text-slate-500 flex items-center gap-1"><BrainCircuit className="w-3.5 h-3.5 shrink-0" /> Gemini API Client</span>
            <span className="text-slate-500 flex items-center gap-1"><Network className="w-3.5 h-3.5 shrink-0" /> React Flow Canvas</span>
          </div>

          {/* Institutional support */}
          <div className="flex flex-col gap-3 text-xs">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Legal / Safety</h4>
            <span className="text-slate-500 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Secured Encryption</span>
            <span className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">Terms & Conditions</span>
            <span className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">Privacy Policy</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-600">
          <span>&copy; {new Date().getFullYear()} KnowledgeGraph.AI Inc. All rights reserved.</span>
          <span>Designed and engineered to MERN enterprise specifications.</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
