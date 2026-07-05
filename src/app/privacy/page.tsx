import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <header className="w-full border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-zinc-900 dark:text-white">
            AutoPost Nepal
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/login" className="px-4 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Login
            </Link>
            <Link href="/register" className="px-4 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
          Privacy Policy
        </h1>

        <div className="space-y-6 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
          <p><strong className="text-zinc-900 dark:text-white">Last updated:</strong> July 3, 2026</p>

          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">1. Information We Collect</h2>
          <p>
            AutoPost Nepal does not collect, store, or process any personal data from end users.
            The service operates as a server-side automation tool that posts content to
            connected social media accounts.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">2. Data We Store</h2>
          <p>
            The only data stored is operational logs in our MongoDB database, which includes:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Date of each post</li>
            <li>Content category and sub-type</li>
            <li>Generated text content</li>
            <li>Social media post IDs (returned by Facebook/TikTok APIs)</li>
            <li>Post status (success/failure)</li>
          </ul>
          <p>
            All logs are automatically deleted after 30 days via a TTL index. No user
            information, cookies, tracking, or analytics are collected.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">3. Third-Party Services</h2>
          <p>
            This service integrates with:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>DeepSeek API</strong> — for AI content generation. We send prompts and receive generated text. No user data is shared.</li>
            <li><strong>Facebook Graph API</strong> — for posting content to Facebook. We send images and captions to the connected page.</li>
            <li><strong>TikTok Content API</strong> — for posting content to TikTok. We send images and captions to the connected account.</li>
            <li><strong>MongoDB</strong> — for storing operational logs as described above.</li>
          </ul>

          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">4. Data Security</h2>
          <p>
            API keys and access tokens are stored as environment variables and are never exposed
            to clients. All communication with third-party APIs is over HTTPS.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">5. Contact</h2>
          <p>
            For questions about this privacy policy, please contact the service administrator.
          </p>
        </div>
      </main>

      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-sm text-zinc-500 dark:text-zinc-500">
        &copy; {new Date().getFullYear()} AutoPost Nepal.{" "}
        <Link href="/terms" className="underline hover:text-zinc-700 dark:hover:text-zinc-300">Terms</Link>
      </footer>
    </div>
  );
}
