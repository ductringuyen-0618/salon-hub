import { useCallback, useEffect, useState } from "react";
import { Home } from "./components/Home";
import { ServicesPage } from "./components/ServicesPage";
import { NotFound } from "./components/NotFound";
import { LoadError, Loading, NotConfigured, StaleNotice } from "./components/Status";
import { fetchSalon, recallContact, rememberContact, type Salon } from "./lib/salon";

type State = { kind: "loading" } | { kind: "error" } | { kind: "ready"; salon: Salon };

export interface AppProps {
  salonUrl?: string;
  bookingUrl?: string;
  path?: string;
}

export default function App({ salonUrl, bookingUrl, path = window.location.pathname }: AppProps) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);
  const clean = path.length > 1 ? path.replace(/\/+$/, "") : path;
  const isHome = clean === "/" || clean === "/index.html";
  const isServices = clean === "/services";
  const known = isHome || isServices;

  useEffect(() => {
    if (!known) return;
    if (!salonUrl) {
      setState({ kind: "error" });
      return;
    }
    const ctl = new AbortController();
    setState({ kind: "loading" });
    fetchSalon(salonUrl, ctl.signal)
      .then((salon) => {
        rememberContact(salon);
        setState({ kind: "ready", salon });
      })
      .catch(() => {
        if (!ctl.signal.aborted) setState({ kind: "error" });
      });
    return () => ctl.abort();
  }, [salonUrl, attempt, known]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  if (!known) return <NotFound />;
  if (!salonUrl) return <NotConfigured contact={recallContact()} />;
  if (state.kind === "loading") return <Loading />;
  if (state.kind === "error") return <LoadError contact={recallContact()} onRetry={retry} />;
  const page = isServices ? <ServicesPage salon={state.salon} bookingUrl={bookingUrl} /> : <Home salon={state.salon} bookingUrl={bookingUrl} />;
  if (state.salon.stale !== true) return page;
  return (
    <>
      <StaleNotice />
      {page}
    </>
  );
}
