import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import MetaPixel from "./components/MetaPixel";
import { initOnyxJourney } from "./lib/leadosTracking";
import Home from "./pages/Home";

const NotFound = lazy(() => import("@/pages/NotFound"));
const AirlinePage = lazy(() => import("./pages/AirlinePage"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const DestinationPage = lazy(() => import("./pages/DestinationPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const LevneLetenky = lazy(() => import("./pages/LevneLetenky"));
const Dovolene = lazy(() => import("./pages/Dovolene"));
const ABTestDashboard = lazy(() => import("./pages/ABTestDashboard"));
const AdminEmails = lazy(() => import("./pages/AdminEmails"));
const HeroABTestDashboard = lazy(() => import("./pages/HeroABTestDashboard"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const VlakyAutobusy = lazy(() => import("./pages/VlakyAutobusy"));
const PriceComparison = lazy(() => import("./pages/PriceComparison"));
const ABTestAnalyticsDashboard = lazy(() => import("./pages/ABTestAnalyticsDashboard"));
const ShareABTestDashboard = lazy(() => import("./pages/ShareABTestDashboard"));
const ReunionPage = lazy(() => import("./pages/ReunionPage"));
const Letenky1500 = lazy(() => import("./pages/Letenky1500"));
const Redirect = lazy(() => import("./pages/Redirect"));
const Aerolinky = lazy(() => import("./pages/Aerolinky"));
const DubajPage = lazy(() => import("./pages/DubajPage"));
const BaliPage = lazy(() => import("./pages/BaliPage"));
const NewYorkPage = lazy(() => import("./pages/NewYorkPage"));
const AdminSocialMedia = lazy(() => import("./pages/AdminSocialMedia"));
const AdminIndexingAndPush = lazy(() => import("./pages/AdminIndexingAndPush"));
const PriceTrackerPage = lazy(() => import("./pages/PriceTrackerPage"));
const FlightCompensationPage = lazy(() => import("./pages/FlightCompensationPage"));
const BaggageCalculatorPage = lazy(() => import("./pages/BaggageCalculatorPage"));
const EbookDownloadPage = lazy(() => import("./pages/EbookDownloadPage"));
const WhatsAppGenerator = lazy(() => import("./pages/WhatsAppGenerator"));
const LoginPage = lazy(() => import("./pages/Login"));
const LuckyWheelPopup = lazy(() => import("./components/LuckyWheelPopup"));
import WebPushPermissionBanner from "./components/WebPushPermissionBanner";
const DestinationLandingPage = lazy(() => import("./pages/DestinationLandingPage"));
const RevolutABTestDashboard = lazy(() => import("./pages/RevolutABTestDashboard"));
const TipyCestovatele = lazy(() => import("./pages/TipyCestovatele"));
const TipArticle = lazy(() => import("./pages/TipArticle"));
const HeatmapTracking = lazy(() =>
  import("./components/HeatmapTracking").then((mod) => ({ default: mod.HeatmapTracking }))
);
const RevolutPopupABTest = lazy(() => import("./components/RevolutPopupABTest"));

import { useLocation } from "wouter";

function ScrollToTop() {
  const [pathname] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <ScrollToTop />
      <Switch>
        <Route path={"/"} component={Home} />
        {/* Specific named routes MUST come before catch-all /:destination */}
        <Route path="/letecka-spolecnost/:slug" component={AirlinePage} />
        <Route path="/letecke-spolecnosti/:slug" component={AirlinePage} />
        <Route path="/letenky-do-:slug" component={DestinationPage} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/admin/ab-test" component={ABTestDashboard} />
        <Route path="/admin/emails" component={AdminEmails} />
        <Route path="/admin/hero-ab-test" component={HeroABTestDashboard} />
        <Route path="/admin/revolut-ab-test" component={RevolutABTestDashboard} />
        <Route path="/admin/ab-test-analytics" component={ABTestAnalyticsDashboard} />
        <Route path="/admin/share-ab-test" component={ShareABTestDashboard} />
        <Route path="/admin/whatsapp-generator" component={WhatsAppGenerator} />
        <Route path="/admin/social-media" component={AdminSocialMedia} />
        <Route path="/admin/indexing-and-push" component={AdminIndexingAndPush} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/levne-letenky" component={LevneLetenky} />
        <Route path="/last-minute" component={LevneLetenky} />
        <Route path="/letenky" component={LevneLetenky} />
        <Route path="/tipy-pro-cestovatele" component={TipyCestovatele} />
        <Route path="/tipy-pro-cestovatele/:slug" component={TipArticle} />
        <Route path="/dovolene" component={Dovolene} />
        <Route path="/hlidac-cen" component={PriceTrackerPage} />
        <Route path="/odskodneni-za-let" component={FlightCompensationPage} />
        <Route path="/kalkulacka-zavazadel" component={BaggageCalculatorPage} />
        <Route path="/ebook-zdarma" component={EbookDownloadPage} />
        <Route path="/wishlist" component={Wishlist} />
        <Route path="/vlaky-autobusy" component={VlakyAutobusy} />
        <Route path="/porovnani-cen" component={PriceComparison} />
        <Route path="/reunion" component={ReunionPage} />
        <Route path="/letenky-reunion" component={ReunionPage} />
        <Route path="/letenky-do-1500" component={Letenky1500} />
        <Route path="/redirect" component={Redirect} />
        <Route path="/aerolinky" component={Aerolinky} />
        <Route path="/dubaj" component={DubajPage} />
        <Route path="/letenky-dubaj" component={DubajPage} />
        <Route path="/bali" component={BaliPage} />
        <Route path="/letenky-bali" component={BaliPage} />
        <Route path="/new-york" component={NewYorkPage} />
        <Route path="/letenky-new-york" component={NewYorkPage} />
        <Route path={"/404"} component={NotFound} />
        {/* Login page */}
        <Route path="/prihlaseni" component={LoginPage} />
        {/* Catch-all destination landing pages - MUST be last before NotFound */}
        <Route path="/:destination" component={DestinationLandingPage} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  const [showDeferredEnhancements, setShowDeferredEnhancements] = useState(false);

  useEffect(() => {
    // LeadOS / Travel Revenue Network initialization (onyx_journey token & affiliate tracking)
    initOnyxJourney();

    const win = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (win.requestIdleCallback) {
      const idleId = win.requestIdleCallback(() => setShowDeferredEnhancements(true), { timeout: 2500 });
      return () => win.cancelIdleCallback?.(idleId);
    }

    const timeoutId = window.setTimeout(() => setShowDeferredEnhancements(true), 1500);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <MetaPixel />
          {showDeferredEnhancements && (
            <Suspense fallback={null}>
              <HeatmapTracking />
              <RevolutPopupABTest />
              <LuckyWheelPopup />
            </Suspense>
          )}
          <Toaster />
          <WebPushPermissionBanner />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
