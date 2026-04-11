import FilmGrain from "@/components/FilmGrain";
import Spotlight from "@/components/Spotlight";
import { Chrome, Download as DownloadIcon } from "lucide-react";
import { Link } from "react-router-dom";

const ZIP_DOWNLOAD_URL = "https://drive.google.com/uc?export=download&id=19bQv_6gYad6t6SxiUTW97g_UdnuKi-dY";

const Download = () => {
  const hasDownload = typeof ZIP_DOWNLOAD_URL === "string" && ZIP_DOWNLOAD_URL.trim().length > 0;

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <Spotlight />
      <FilmGrain />

      <section className="relative section-padding">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span aria-hidden>←</span>
              Back to home
            </Link>

            <h1 className="mt-6 text-4xl md:text-5xl font-bold font-display leading-tight">
              Download <span className="gradient-text-red glow-text">BetterYoutube</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed max-w-2xl">
              Download the ZIP, unzip it, then load it as an unpacked extension in Chrome or Edge.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <div className="flex items-start justify-between gap-6 flex-col sm:flex-row">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-widest">Step 1</p>
                  <h2 className="mt-2 text-2xl font-bold font-display">Download the ZIP</h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    This button will link to the ZIP (Drive link coming soon).
                  </p>
                </div>

                {hasDownload ? (
                  <a
                    href={ZIP_DOWNLOAD_URL}
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-3 gradient-red text-primary-foreground font-semibold px-6 py-3 rounded-xl glow-border-strong transition-shadow duration-300 hover:shadow-[0_0_60px_hsl(348,100%,50%,0.5)]"
                  >
                    <DownloadIcon className="h-5 w-5" />
                    Download ZIP
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center gap-3 rounded-xl px-6 py-3 font-semibold bg-muted text-muted-foreground cursor-not-allowed"
                    aria-disabled="true"
                  >
                    <DownloadIcon className="h-5 w-5" />
                    Download ZIP (link soon)
                  </button>
                )}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 md:p-8">
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Step 2</p>
              <h2 className="mt-2 text-2xl font-bold font-display">Install it in your browser</h2>

              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <div className="glass-card rounded-xl p-5">
                  <div className="flex items-center gap-3">
                    <Chrome className="h-5 w-5 text-primary" />
                    <h3 className="font-display font-semibold text-foreground">Chrome</h3>
                  </div>
                  <ol className="mt-4 list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Unzip the downloaded file.</li>
                    <li>Open <span className="text-foreground">chrome://extensions</span>.</li>
                    <li>Enable <span className="text-foreground">Developer mode</span>.</li>
                    <li>Click <span className="text-foreground">Load unpacked</span>.</li>
                    <li>Select the unzipped folder that contains <span className="text-foreground">manifest.json</span>.</li>
                  </ol>
                </div>

                <div className="glass-card rounded-xl p-5">
                  <div className="flex items-center gap-3">
                    <Chrome className="h-5 w-5 text-primary" />
                    <h3 className="font-display font-semibold text-foreground">Microsoft Edge</h3>
                  </div>
                  <ol className="mt-4 list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Unzip the downloaded file.</li>
                    <li>Open <span className="text-foreground">edge://extensions</span>.</li>
                    <li>Enable <span className="text-foreground">Developer mode</span>.</li>
                    <li>Click <span className="text-foreground">Load unpacked</span>.</li>
                    <li>Select the unzipped folder that contains <span className="text-foreground">manifest.json</span>.</li>
                  </ol>
                </div>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                After installing, open any YouTube video and use the extension popup to enable features.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Download;
