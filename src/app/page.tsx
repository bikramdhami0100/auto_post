import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <header className="w-full border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-zinc-900 dark:text-white">
            AutoPost Nepal
          </span>
          <nav className="flex gap-6 text-sm text-zinc-600 dark:text-zinc-400">
            <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-white">
              Privacy
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-20">
        <section className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
            Automated Social Media Content
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Every day at 5:00 AM Nepal Time, we generate fresh motivational quotes,
            philosophical thoughts, and Nepali language lessons — then post them
            automatically to Facebook and TikTok.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            {
              title: "🧠 AI-Powered Writing",
              desc: "DeepSeek generates unique content daily — book quotes, business mindset, or Nepali word lists with translations.",
            },
            {
              title: "🎨 Auto Image Design",
              desc: "Canvas + Sharp renders every post into 1080×1920 images optimized for Facebook feeds and TikTok carousels.",
            },
            {
              title: "📱 Cross-Platform Posting",
              desc: "One trigger posts to Facebook Graph API and TikTok Content API simultaneously. No manual work needed.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900"
            >
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 bg-white dark:bg-zinc-900 mb-20">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            How It Works
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-zinc-600 dark:text-zinc-400">
            <li>
              <strong className="text-zinc-900 dark:text-white">Vercel Cron</strong> triggers
              the API at 5:00 AM NPT daily.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-white">Scheduler</strong> picks the
              day&apos;s category: Motivation, Enlightenment, or Language (7-day cycle).
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-white">DeepSeek AI</strong> generates
              the content as structured JSON.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-white">Sharp</strong> renders 1–5
              images at 1080×1920 with the text overlaid.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-white">Facebook Graph API</strong> and{" "}
              <strong className="text-zinc-900 dark:text-white">TikTok Content API</strong>{" "}
              receive the posts.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-white">MongoDB</strong> logs every
              post. Data auto-deletes after 30 days.
            </li>
          </ol>
        </section>

        <section className="text-center text-sm text-zinc-500 dark:text-zinc-500">
          <p>
            This service is provided as-is. See our{" "}
            <Link href="/terms" className="underline hover:text-zinc-700 dark:hover:text-zinc-300">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-zinc-700 dark:hover:text-zinc-300">
              Privacy Policy
            </Link>.
          </p>
        </section>
      </main>

      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-sm text-zinc-500 dark:text-zinc-500">
        &copy; {new Date().getFullYear()} AutoPost Nepal. All rights reserved.
      </footer>
    </div>
  );
}
