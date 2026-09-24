import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { readConsent, subscribeConsent } from "@/lib/consent";
import {
  buildOmniNetworkUrl,
  selectOmniNetworkCampaign,
  type OmniNetworkContext,
} from "@/lib/omniNetwork";

type OmniContextAdVariant = "billboard" | "native";

interface OmniContextAdProps {
  placement: string;
  context: OmniNetworkContext;
  variant?: OmniContextAdVariant;
  excludeCampaignIds?: string[];
}

function getOmniSessionId() {
  if (typeof window === "undefined") return "server";
  const key = "omni_network_session";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const next = "omni_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
  sessionStorage.setItem(key, next);
  return next;
}

export default function OmniContextAd({
  placement,
  context,
  variant = "native",
  excludeCampaignIds = [],
}: OmniContextAdProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const impressionTracked = useRef(false);
  const [visible, setVisible] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(
    readConsent()?.analytics === true,
  );
  const trackEvent = trpc.conversionFunnel.trackEvent.useMutation();

  const campaign = useMemo(
    () => selectOmniNetworkCampaign(context, excludeCampaignIds),
    [context.topic, context.intent, context.route, excludeCampaignIds.join("|")],
  );

  useEffect(
    () =>
      subscribeConsent((preferences) => {
        setAnalyticsAllowed(preferences?.analytics === true);
      }),
    [],
  );

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          timer = setTimeout(() => setVisible(true), 1000);
        } else if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: [0.5] },
    );

    observer.observe(node);
    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [campaign?.id]);

  useEffect(() => {
    if (!campaign || !analyticsAllowed || !visible || impressionTracked.current) return;
    impressionTracked.current = true;
    trackEvent.mutate({
      sessionId: getOmniSessionId(),
      eventType: "omni_ad_impression",
      page: context.route || "/",
      metadata: {
        network: "OMNI_NETWORK",
        campaignId: campaign.id,
        project: campaign.project,
        owner: campaign.owner,
        placement,
        topic: context.topic,
        intent: context.intent,
        viewability: "50pct_1s",
      },
    });
  }, [
    campaign,
    analyticsAllowed,
    visible,
    placement,
    context.route,
    context.topic,
    context.intent,
    trackEvent,
  ]);

  if (!campaign) return null;

  const href = buildOmniNetworkUrl(campaign, placement);

  const handleClick = () => {
    if (!analyticsAllowed) return;
    trackEvent.mutate({
      sessionId: getOmniSessionId(),
      eventType: "omni_ad_click",
      page: context.route || "/",
      metadata: {
        network: "OMNI_NETWORK",
        campaignId: campaign.id,
        project: campaign.project,
        owner: campaign.owner,
        placement,
        topic: context.topic,
        intent: context.intent,
        target: campaign.href,
      },
    });
  };

  if (variant === "billboard") {
    return (
      <div ref={rootRef} className="container py-5" data-omni-placement={placement}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="group relative block overflow-hidden rounded-3xl border border-slate-200 bg-[#f7fbff] shadow-[0_18px_50px_-34px_rgba(15,23,42,.45)]"
          aria-label={campaign.title + " – " + campaign.project}
        >
          <div className="grid min-h-[210px] md:grid-cols-[1.05fr_.95fr]">
            <div className="relative z-10 flex flex-col justify-center p-7 md:p-9">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-slate-600">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                {campaign.label}
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                {campaign.project}
              </p>
              <h3 className="mt-2 max-w-xl text-2xl font-black tracking-[-0.03em] text-slate-950 md:text-3xl">
                {campaign.title}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                {campaign.description}
              </p>
              <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-[#0f5fc2] px-5 py-3 text-sm font-black text-white transition group-hover:bg-[#0a4f9f]">
                {campaign.cta}
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>

            <div className="relative min-h-[220px] overflow-hidden md:min-h-full">
              {campaign.image && (
                <img
                  src={campaign.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-[#f7fbff] via-[#f7fbff]/10 to-transparent md:block" />
              <div className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-slate-950/65 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur">
                Otevře {campaign.project}
                <ExternalLink className="h-3 w-3" />
              </div>
            </div>
          </div>
        </a>
      </div>
    );
  }

  return (
    <div ref={rootRef} data-omni-placement={placement}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="group grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_50px_-34px_rgba(15,23,42,.4)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_-32px_rgba(15,23,42,.48)] sm:grid-cols-[180px_1fr]"
      >
        <div className="relative min-h-[150px] overflow-hidden bg-slate-100">
          {campaign.image && (
            <img
              src={campaign.image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          )}
          <div className="absolute left-3 top-3 rounded-full bg-slate-950/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-white backdrop-blur">
            {campaign.label}
          </div>
        </div>

        <div className="flex flex-col justify-center p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">
            Doporučení z OMNI NETWORK · {campaign.project}
          </p>
          <h3 className="mt-2 text-xl font-black tracking-[-0.02em] text-slate-950">
            {campaign.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{campaign.description}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-sky-700">
            {campaign.cta}
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </a>
    </div>
  );
}
