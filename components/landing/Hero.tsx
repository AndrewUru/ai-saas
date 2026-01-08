export function Hero() {
  return (
    <header className="relative min-h-screen w-full overflow-hidden bg-[#030303] flex flex-col justify-center">
      {/* 1. Background Layer: Mesh Gradients & Grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-secondary/10 blur-[120px] rounded-full" />
        {/* Sutil malla de puntos o líneas opcional */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-10">
          {/* Badge: Ultra-refined */}
          <div className="group relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-xl transition-all hover:border-white/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            AI Agents for ecommerce agencies
          </div>

          {/* Main Title: Precision Typography */}
          <h1 className="max-w-5xl text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
            Deploy{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
              AI agents
            </span>
            <br className="hidden md:block" /> for online stores
          </h1>

          {/* Subtext: Better Readability */}
          <p className="max-w-2xl text-lg text-zinc-400 sm:text-xl leading-relaxed">
            Scale a recurring service by offering trained assistants that follow
            brand policies, query WooCommerce, and boost sales.
            <span className="text-white"> Efficiency, automated.</span>
          </p>

          {/* Buttons: High Contrast */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
            <a
              href="/dashboard"
              className="group relative w-full sm:w-auto overflow-hidden rounded-xl bg-white px-8 py-4 text-black font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Go to dashboard
            </a>
            <a
              href="/login"
              className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-white font-semibold backdrop-blur-sm transition-all hover:bg-white/10"
            >
              Start free trial
            </a>
          </div>
        </div>

        {/* Stats Section: Modern Bento Grid */}
        <dl className="mt-24 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Conversations handled", value: "40k+" },
            { label: "WooCommerce stores", value: "1,200+" },
            { label: "Integrations", value: "30+" },
          ].map((item) => (
            <div
              key={item.label}
              className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:border-white/10 hover:bg-white/[0.04]"
            >
              <dt className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                {item.label}
              </dt>
              <dd className="mt-3 text-4xl font-semibold tracking-tight text-white">
                {item.value}
              </dd>
              {/* Decorative accent corner */}
              <div className="absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 bg-accent/5 blur-2xl" />
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
