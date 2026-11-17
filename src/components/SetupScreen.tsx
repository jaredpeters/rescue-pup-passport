"use client";

export default function SetupScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl bg-white rounded-2xl shadow-lg border border-amber-200 p-8">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">🐾</div>
          <h1 className="text-3xl font-bold text-amber-900">Welcome to Rescue Pup Passport</h1>
          <p className="text-amber-700 mt-2">Before you can track dogs, we need to set up your database.</p>
        </div>

        <div className="space-y-4 text-amber-900">
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <p className="font-bold mb-1">Why do I need a database?</p>
            <p className="text-sm">
              So your notes and photos never disappear when you close a tab or
              switch devices. Everything you type goes into <em>your own</em>{" "}
              private Supabase project — it's free, and only you can see it.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-amber-200">
            <p className="font-bold mb-2">Setup (about 5 minutes)</p>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>
                Create a free account at{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-700 underline font-medium"
                >
                  supabase.com
                </a>
                .
              </li>
              <li>Click "New Project". Any name is fine. Pick a region near you. Save the password somewhere — you won't need it often, but you'll need it eventually.</li>
              <li>Wait about 2 minutes for Supabase to finish setting up.</li>
              <li>In the left sidebar, click <strong>SQL Editor</strong> → <strong>New query</strong>.</li>
              <li>Paste in the full contents of the file <code className="bg-amber-100 px-1 rounded text-xs">supabase/schema.sql</code> from this project, then click <strong>Run</strong>.</li>
              <li>Back in the sidebar, click the gear icon (<strong>Settings</strong>) → <strong>API</strong>.</li>
              <li>Copy your <strong>Project URL</strong> and the <strong>anon public</strong> key.</li>
              <li>
                Paste them into your <code className="bg-amber-100 px-1 rounded text-xs">.env.local</code> file (or
                your Netlify/Vercel environment variables), then restart.
              </li>
            </ol>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-blue-900">
            <p className="font-bold mb-1">Full walkthrough with screenshots</p>
            <p className="text-sm">
              See <code className="bg-blue-100 px-1 rounded text-xs">SETUP.md</code> in the project for a longer,
              click-by-click version of these steps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
