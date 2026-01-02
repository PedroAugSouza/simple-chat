"use client";
import React, { useEffect, useState } from "react";
import {
  GitPullRequest,
  CheckCircle2,
  Terminal,
  User,
  Sparkles,
  Menu,
  X,
  ArrowRight,
  Code2,
  Github,
  Layout,
  MessageSquare,
  PenTool,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";

const BackgroundGrid: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px 16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent 100%)]">
      <div className="absolute inset-0 border-b border-neutral-200/50"></div>
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  className = "",
  ...props
}) => {
  const baseStyles =
    "px-6 py-3 font-mono text-sm font-medium transition-all duration-200 ease-out flex items-center justify-center gap-2 active:scale-95";

  const variants = {
    primary:
      "bg-black text-white border border-black hover:bg-neutral-800 hover:shadow-lg",
    outline:
      "bg-transparent text-black border border-black hover:bg-black hover:text-white",
    ghost:
      "bg-transparent text-black hover:bg-neutral-100 border border-transparent",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const ChatInterface: React.FC = () => {
  const [step, setStep] = useState(0);
  const [typedText, setTypedText] = useState("");
  const targetText = "Sim, merge e excluir branch.";

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < 3 ? prev + 1 : 0));
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (step === 2) {
      let currentIndex = 0;

      const typingInterval = setInterval(() => {
        if (currentIndex <= targetText.length) {
          setTypedText(targetText.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
        }
      }, 50 + Math.random() * 20);

      return () => clearInterval(typingInterval);
    } else if (step === 0) {
      setTypedText("");
    }
  }, [step]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col h-125">
      <div className="bg-neutral-50 border-b border-black p-3 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full border border-black bg-white"></div>
          <div className="w-3 h-3 rounded-full border border-black bg-black"></div>
          <div className="w-3 h-3 rounded-full border border-black bg-neutral-400"></div>
        </div>
        <div className="font-mono text-xs text-neutral-500 flex items-center gap-2">
          <Terminal size={12} />
          <span>simple-cli — v2.0.4</span>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <span className="font-bold text-9xl tracking-tighter">S.</span>
        </div>

        <div className="flex gap-4 items-start animate-in slide-in-from-bottom-2 duration-500 fade-in">
          <div className="w-8 h-8 rounded border border-black bg-white flex items-center justify-center shrink-0">
            <User size={16} />
          </div>
          <div className="flex flex-col gap-1 max-w-[80%]">
            <span className="text-xs font-mono text-neutral-500">
              Você • 10:42
            </span>
            <div className="bg-neutral-100 p-3 rounded-lg border border-transparent text-sm">
              Status da PR #42 no repositório{" "}
              <code className="bg-white border border-neutral-300 px-1 py-0.5 rounded text-xs font-mono">
                simple-web
              </code>
              ?
            </div>
          </div>
        </div>

        <div
          className={`flex gap-4 items-start transition-opacity duration-500 ${
            step >= 1 ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-8 h-8 rounded border border-black bg-black text-white flex items-center justify-center shrink-0">
            <Sparkles size={16} />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <span className="text-xs font-mono text-neutral-500">
              Dev Persona • 10:42
            </span>
            <div className="border border-neutral-200 p-4 rounded-lg text-sm w-full bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-3 border-b border-neutral-100 pb-2">
                <GitPullRequest size={16} className="text-black" />
                <span className="font-semibold">PR #42: Feature/dark-mode</span>
                <span className="ml-auto text-xs font-mono bg-black text-white px-2 py-0.5 rounded-full">
                  ABERTO
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 size={12} />
                  <span>Build aprovada (2m 30s)</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 size={12} />
                  <span>Testes passaram (142/142)</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <div className="w-3 h-3 border border-neutral-300 rounded-full border-t-black animate-spin"></div>
                  <span>Deploy em andamento...</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100">
                <p className="text-neutral-600">
                  As alterações parecem sólidas. O deploy na Vercel está
                  pendente. Devo fazer o merge assim que concluir?
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`mt-auto transition-opacity duration-500 ${
            step >= 2 ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex gap-2 items-center">
            <div className="w-full h-10 border-b-2 border-black flex items-center px-2 font-mono text-sm">
              {typedText}
              <span className="w-2 h-4 bg-black animate-pulse ml-1"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { push } = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Personalidades", href: "#personalities" },
    { label: "Integrações", href: "#integrations" },
    { label: "Manifesto", href: "#manifesto" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-neutral-200 py-3"
          : "bg-transparent border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <a
          href="/login"
          className="text-2xl font-bold tracking-tighter flex items-center gap-1"
        >
          Simpl<span className="w-2 h-2 bg-black rounded-full mt-2"></span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-neutral-600 hover:text-black transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <a
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Entrar
          </a>
          <Button
            onClick={() => push("/register")}
            variant="primary"
            className="py-2 px-5 text-xs"
          >
            Obter Acesso
          </Button>
        </div>

        <button
          className="md:hidden p-2 text-black"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-black p-6 md:hidden flex flex-col gap-6 shadow-xl animate-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-black border-b border-neutral-100 pb-2"
            >
              {link.label}
            </a>
          ))}
          <Button className="w-full justify-center">Obter Acesso</Button>
        </div>
      )}
    </header>
  );
};

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  name,
  description,
  icon,
}) => {
  return (
    <div className="group relative bg-white border border-neutral-200 p-6 transition-all duration-300 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
      <div className="w-12 h-12 flex items-center justify-center border border-neutral-100 bg-neutral-50 rounded-lg group-hover:bg-black group-hover:text-white group-hover:border-black transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold mb-1">{name}</h3>
        <p className="text-sm text-neutral-500 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
export default function LandinPage() {
  const { push } = useRouter();

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white relative overflow-x-hidden">
      <Header />

      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <BackgroundGrid />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 bg-white/50 backdrop-blur-sm w-fit">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-mono font-medium">
                v1.0 Acesso Antecipado
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[1.1]">
              Simplicidade é a{" "}
              <span className="underline decoration-4 underline-offset-4 decoration-neutral-300">
                sofisticação
              </span>{" "}
              suprema.
            </h1>

            <p className="text-xl text-neutral-600 max-w-lg leading-relaxed">
              Uma experiência de chat de IA sem ruídos. Personalidades
              distintas, integrações poderosas e um foco monocromático no que
              importa:{" "}
              <span className="font-mono text-black bg-neutral-100 px-1">
                seu conteúdo
              </span>
              .
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                onClick={() => push("/login")}
                className="h-12 px-8 text-base"
              >
                Começar a Conversar <ArrowRight size={18} />
              </Button>
            </div>

            <div className="pt-8 border-t border-neutral-200 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-500"
                  >
                    U{i}
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-neutral-500">
                Confiado por mais de 2.000 minimalistas
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-neutral-100 pattern-dots opacity-50"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-neutral-50 rounded-full blur-3xl"></div>

            <ChatInterface />
          </div>
        </div>
      </section>

      <section id="personalities" className="py-24 border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 md:flex justify-between items-end">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Personalidades Distintas.
              </h2>
              <p className="text-neutral-500 max-w-md">
                Mude de contexto instantaneamente. Da revisão de código à
                escrita criativa, o Simple adapta seu tom e utilidade ao seu
                modo atual.
              </p>
            </div>
            <Button variant="outline" className="mt-6 md:mt-0">
              Explorar Todas as Personas
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-black text-white rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-32 bg-neutral-800/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-neutral-700/50 transition-all"></div>
              <Terminal className="w-10 h-10 mb-6 text-neutral-400" />
              <h3 className="text-xl font-bold font-mono mb-2">/dev/bot</h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                Técnico, preciso e conciso. Ideal para depuração de código,
                revisões de arquitetura e comandos CLI. Sem enrolação.
              </p>
              <ul className="space-y-2 text-xs font-mono text-neutral-500">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>{" "}
                  Realce de sintaxe
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>{" "}
                  Dicas de refatoração
                </li>
              </ul>
            </div>

            <div className="p-8 border border-neutral-200 rounded-xl hover:border-black transition-colors group bg-neutral-50">
              <PenTool className="w-10 h-10 mb-6 text-black" />
              <h3 className="text-xl font-bold font-mono mb-2">A Musa</h3>
              <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                Criativo, expansivo e reflexivo. Perfeito para brainstorming,
                rascunhar ensaios ou explorar conceitos abstratos.
              </p>
              <ul className="space-y-2 text-xs font-mono text-neutral-500">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-black rounded-full"></div> Ajuste
                  de tom
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-black rounded-full"></div> Insights
                  criativos
                </li>
              </ul>
            </div>

            <div className="p-8 border border-neutral-200 rounded-xl hover:border-black transition-colors group bg-white">
              <Layout className="w-10 h-10 mb-6 text-black" />
              <h3 className="text-xl font-bold font-mono mb-2">
                O Estrategista
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                Estruturado, analítico e orientado a objetivos. Ajuda no
                planejamento de projetos, OKRs e na divisão de tarefas
                complexas.
              </p>
              <ul className="space-y-2 text-xs font-mono text-neutral-500">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-black rounded-full"></div> Itens de
                  ação
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-black rounded-full"></div> Geração
                  de roadmap
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        id="integrations"
        className="py-24 bg-black text-white relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute right-0 top-0 w-96 h-96 bg-neutral-800 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight">
              Conectado ao seu fluxo de trabalho.
            </h2>
            <p className="text-neutral-400 text-lg">
              Não apenas converse. Aja. O Simple se conecta profundamente com as
              ferramentas que você usa todos os dias, permitindo buscar status,
              acionar builds e muito mais.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-black">
            <IntegrationCard
              name="GitHub"
              description="Verifique status de PRs, revise diffs e gerencie issues diretamente da interface de chat."
              icon={<Github size={24} />}
            />
            <IntegrationCard
              name="Vercel"
              description="Monitore deploys, verifique logs de build e faça rollback instantaneamente via linguagem natural."
              icon={<Zap size={24} />}
            />
            <IntegrationCard
              name="Linear"
              description="Crie tickets, atualize status e consulte a velocidade do projeto sem sair da conversa."
              icon={<Code2 size={24} />}
            />
            <IntegrationCard
              name="Notion"
              description="Resuma reuniões e salve-as diretamente na base de conhecimento da sua equipe."
              icon={<MessageSquare size={24} />}
            />
            <IntegrationCard
              name="Slack"
              description="Encaminhe resumos importantes para canais da equipe ou envie DMs para usuários específicos."
              icon={<Terminal size={24} />}
            />
            <div className="bg-neutral-900 border border-neutral-800 p-6 flex items-center justify-center flex-col text-center text-white rounded-lg">
              <p className="font-mono text-sm text-neutral-400 mb-4">
                ...e muito mais via API.
              </p>
              <Button
                variant="outline"
                className="border-neutral-600 text-white hover:bg-white hover:text-black"
              >
                Solicitar Integração
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-neutral-200 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-xl font-bold tracking-tighter">Simple.</span>
            <p className="text-xs text-neutral-500 font-mono">
              © 2024 Simple AI Inc. Todos os direitos reservados.
            </p>
          </div>

          <div className="flex gap-8 text-sm font-medium text-neutral-600">
            <a href="#" className="hover:text-black">
              Twitter
            </a>
            <a href="#" className="hover:text-black">
              GitHub
            </a>
            <a href="#" className="hover:text-black">
              Discord
            </a>
          </div>

          <div className="flex gap-4">
            <a href="#" className="text-xs text-neutral-400 hover:underline">
              Privacidade
            </a>
            <a href="#" className="text-xs text-neutral-400 hover:underline">
              Termos
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
