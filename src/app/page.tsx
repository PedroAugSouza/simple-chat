"use client";

import React, { useEffect, useState } from "react";
import {
  Upload,
  Search,
  Brain,
  GraduationCap,
  FileText,
  BookOpen,
  Menu,
  X,
  ArrowRight,
  User,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

const BackgroundGrid: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-zinc-50 bg-[radial-gradient(#d6d3d1_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_60%,transparent_100%)]">
      <div className="absolute inset-0 border-b border-zinc-200/50"></div>
    </div>
  );
};

const ChatDemo: React.FC = () => {
  const [step, setStep] = useState(0);
  const [typedText, setTypedText] = useState("");

  const aiResponse =
    'O empirismo, representado por Locke e Hume, defende que o conhecimento se origina da experiencia sensivel \u2014 a mente e uma "tabula rasa". Ja o racionalismo, com Descartes e Leibniz, sustenta que existem ideias inatas e que a razao e a fonte primaria do conhecimento. [Fonte: Introducao a Filosofia, cap. 3]';

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < 3 ? prev + 1 : 0));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (step === 1) {
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex <= aiResponse.length) {
          setTypedText(aiResponse.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
        }
      }, 12);
      return () => clearInterval(typingInterval);
    } else if (step === 0) {
      setTypedText("");
    }
  }, [step]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[420px]">
      <div className="bg-zinc-50 border-b border-zinc-200 p-3 flex items-center justify-between">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
          <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
          <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
        </div>
        <div className="font-mono text-xs text-zinc-400 flex items-center gap-1.5">
          <MessageCircle size={12} />
          <span>OrbMind Chat</span>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 p-5 flex flex-col gap-4 overflow-hidden">
        <div className="flex gap-3 items-start">
          <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
            <User size={14} className="text-zinc-500" />
          </div>
          <div className="flex flex-col gap-1 max-w-[85%]">
            <span className="text-xs text-zinc-400">Voce</span>
            <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-lg text-sm text-zinc-800 leading-relaxed">
              Quais sao as principais diferencas entre empirismo e racionalismo
              segundo os textos que enviei?
            </div>
          </div>
        </div>

        <div
          className={`flex gap-3 items-start transition-opacity duration-700 ${
            step >= 1 ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
            <Sparkles size={14} className="text-white" />
          </div>
          <div className="flex flex-col gap-1 max-w-[85%]">
            <span className="text-xs text-zinc-400">OrbMind</span>
            <div className="border border-zinc-200 p-3 rounded-lg text-sm text-zinc-700 leading-relaxed bg-white">
              {step >= 1 && (
                <>
                  <p>{typedText}</p>
                  {typedText.length < aiResponse.length && (
                    <span className="inline-block w-1.5 h-4 bg-zinc-400 animate-pulse ml-0.5 align-middle"></span>
                  )}
                </>
              )}
            </div>
            {step >= 2 && (
              <div className="flex items-center gap-1.5 mt-1">
                <FileText size={10} className="text-zinc-400" />
                <span className="text-[10px] text-zinc-400 font-mono">
                  Baseado em 3 documentos do seu acervo
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Recursos", href: "#recursos" },
    { label: "Como Funciona", href: "#como-funciona" },
    { label: "Comecar", href: "#comecar" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-zinc-200 py-3"
          : "bg-transparent border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <img src="/logo.svg" alt="OrbMind" className="h-8 w-auto" />

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Criar Conta
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-zinc-900"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-zinc-200 p-6 md:hidden flex flex-col gap-4 shadow-lg">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-zinc-700 py-2 border-b border-zinc-100"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/register"
            className="w-full text-center px-5 py-3 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors mt-2"
          >
            Criar Conta
          </Link>
        </div>
      )}
    </header>
  );
};

const features = [
  {
    icon: Upload,
    title: "Upload Inteligente",
    description:
      "PDF, DOCX, MD, TXT. Arraste e solte seus materiais de estudo e deixe a plataforma organizar tudo.",
  },
  {
    icon: Search,
    title: "Busca Semantica (RAG)",
    description:
      "IA que encontra os trechos mais relevantes do seu acervo para responder com precisao e contexto.",
  },
  {
    icon: Brain,
    title: "Tutor Academico",
    description:
      "Resumos, explicacoes, comparacoes e mapas mentais baseados nos seus proprios documentos.",
  },
  {
    icon: GraduationCap,
    title: "Simulados e Flashcards",
    description:
      "Gere questoes no formato de vestibular, concurso ou prova academica a partir do seu material.",
  },
];

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Envie seus documentos",
    description:
      "Faca upload de PDFs, artigos, apostilas e anotacoes. Suporte para os principais formatos academicos.",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "A IA indexa tudo",
    description:
      "Cada documento e fragmentado e vetorizado automaticamente para busca semantica de alta precisao.",
  },
  {
    number: "03",
    icon: MessageCircle,
    title: "Converse e aprenda",
    description:
      "Pergunte sobre qualquer tema do seu acervo e receba respostas fundamentadas nos seus textos.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 relative overflow-x-hidden">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 px-6">
        <BackgroundGrid />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-white/70 backdrop-blur-sm w-fit">
              <BookOpen size={14} className="text-zinc-500" />
              <span className="text-xs font-medium text-zinc-600">
                Plataforma de Estudo com IA
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] font-serif">
              Estude com inteligencia.{" "}
              <span className="text-zinc-400">Domine seu acervo.</span>
            </h1>

            <p className="text-lg text-zinc-500 max-w-lg leading-relaxed">
              Seu espaço onde você centraliza materiais, estuda com IA e domina
              seu acervo. Em breve: acompanhe provas, prazos e entregas em um
              só lugar.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Comecar Gratuitamente
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 text-zinc-600 font-medium hover:text-zinc-900 transition-colors"
              >
                Ja tenho conta
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-amber-50 rounded-full blur-3xl opacity-60"></div>
            <ChatDemo />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="py-24 bg-white border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight font-serif mb-4">
              Tudo que voce precisa para estudar melhor
            </h2>
            <p className="text-zinc-500 text-lg">
              Ferramentas pensadas para quem leva os estudos a serio.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 bg-zinc-50 border border-zinc-100 rounded-xl transition-all duration-200 hover:border-zinc-200 hover:shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-white border border-zinc-200 flex items-center justify-center mb-4 group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 transition-colors">
                  <feature.icon size={20} />
                </div>
                <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section
        id="como-funciona"
        className="py-24 bg-zinc-50 border-t border-zinc-100"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight font-serif mb-4">
              Simples de comecar
            </h2>
            <p className="text-zinc-500 text-lg">
              Tres passos para transformar seus documentos em conhecimento ativo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white border border-zinc-200 mb-6">
                  <step.icon size={24} className="text-zinc-700" />
                </div>
                <span className="block text-xs font-mono text-zinc-400 mb-2">
                  Passo {step.number}
                </span>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="comecar"
        className="py-24 bg-white border-t border-zinc-100"
      >
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight font-serif mb-4">
            Pronto para estudar de verdade?
          </h2>
          <p className="text-zinc-500 text-lg mb-8">
            Seus documentos, sua IA, seu ritmo.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors text-base"
          >
            Criar Conta Gratuita
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-zinc-200 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <img src="/logo.svg" alt="OrbMind" className="h-6 w-auto" />
            <p className="text-xs text-zinc-400">
              &copy; 2026 OrbMind. Todos os direitos reservados.
            </p>
          </div>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Privacidade
            </a>
            <a
              href="#"
              className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Termos
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
