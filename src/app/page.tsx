import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <header className="w-full border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-zinc-900 dark:text-white">
            AutoPost Nepal
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/terms" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
              Privacy
            </Link>
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-20 w-full">
        <section className="text-center mb-24">
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-4 leading-tight">
            AI-Powered Content,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
              Auto-Posted
            </span>
            <br />
            to Facebook & TikTok
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-8">
            Generate motivational quotes, philosophical thoughts, and Nepali language lessons daily.
            Manage everything from one dashboard — configs, prompts, and analytics.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium hover:opacity-90 text-sm"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm"
            >
              Sign In
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mb-24">
          {[
            {
              title: "🤖 AI Generation",
              desc: "DeepSeek creates unique content — quotes, philosophy, and Nepali lessons — in structured JSON.",
            },
            {
              title: "🖼 Image Rendering",
              desc: "Sharp generates 1080×1920 images with Devanagari text, notebook backgrounds, and doodles.",
            },
            {
              title: "📤 Auto Posting",
              desc: "Facebook Graph API and TikTok Content API receive posts simultaneously at 5 AM NPT daily.",
            },
            {
              title: "⚙ Dashboard",
              desc: "Manage Facebook/TikTok configs, env vars, prompts, categories, and settings from one UI.",
            },
            {
              title: "📊 Export & Logs",
              desc: "Export any table to Excel. View post history with pagination, search, and filters.",
            },
            {
              title: "🔐 Admin Panel",
              desc: "Manage users, configure SMTP, and view system analytics with charts.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-1.5">
                {feature.title}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 bg-white dark:bg-zinc-900 mb-24">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-5 text-center">
            How the Daily Pipeline Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-6 text-sm">
            {[
              { step: "1", title: "Cron Trigger", desc: "Vercel Cron fires at 5:00 AM NPT." },
              { step: "2", title: "Pick Category", desc: "Motivation, Enlightenment, or Language (7-day cycle)." },
              { step: "3", title: "Generate Content", desc: "DeepSeek AI produces structured JSON." },
              { step: "4", title: "Render Images", desc: "Sharp creates 1–5 images at 1080×1920." },
              { step: "5", title: "Post & Log", desc: "Facebook + TikTok APIs receive posts; MongoDB logs everything." },
              { step: "6", title: "Auto-Cleanup", desc: "Logs older than 30 days are deleted automatically." },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold">
                  {item.step}
                </span>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">{item.title}</p>
                  <p className="text-zinc-500 dark:text-zinc-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-zinc-200 dark:border-zinc-800 pt-6 text-center text-sm text-zinc-500 dark:text-zinc-500">
          &copy; {new Date().getFullYear()} AutoPost Nepal.{" "}
          <Link href="/terms" className="underline hover:text-zinc-700 dark:hover:text-zinc-300">
            Terms
          </Link>{" "}
          &middot;{" "}
          <Link href="/privacy" className="underline hover:text-zinc-700 dark:hover:text-zinc-300">
            Privacy
          </Link>
        </footer>
      </main>
    </div>
  );
}
