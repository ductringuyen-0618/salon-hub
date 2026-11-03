import { useEffect, useState } from "react";
import App from "./App";
import { Loading } from "./components/Status";
import { loadConfig, type RuntimeConfig } from "./lib/config";
import { recallContact } from "./lib/salon";

let once: Promise<RuntimeConfig> | null = null;
/** One read of /config.json for the life of the page, even when React runs an effect twice in development. */
const loadOnce = () => (once ??= loadConfig());

export default function Boot({ load = loadOnce }: { load?: () => Promise<RuntimeConfig> }) {
  const [config, setConfig] = useState<RuntimeConfig | null>(null);
  useEffect(() => {
    const name = recallContact()?.name.trim();
    if (name) document.title = name;
  }, []);
  useEffect(() => {
    let live = true;
    void load().then((c) => {
      if (live) setConfig(c);
    });
    return () => {
      live = false;
    };
  }, [load]);

  useEffect(() => {
    if (!config?.siteUrl) return;
    const link = document.createElement("link");
    link.rel = "canonical";
    link.href = config.siteUrl;
    document.head.appendChild(link);
    return () => link.remove();
  }, [config?.siteUrl]);

  if (config === null) return <Loading />;
  return <App salonUrl={config.salonUrl} bookingUrl={config.bookingUrl} />;
}
