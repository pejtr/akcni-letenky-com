import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import MetaPixel from "./components/MetaPixel";
import Home from "./pages/Home";
import AirlinePage from "./pages/AirlinePage";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import DestinationPage from "./pages/DestinationPage";
import AdminDashboard from "./pages/AdminDashboard";
import LevneLetenky from "./pages/LevneLetenky";
import Dovolene from "./pages/Dovolene";
import ABTestDashboard from "./pages/ABTestDashboard";
import AdminEmails from "./pages/AdminEmails";
import HeroABTestDashboard from "./pages/HeroABTestDashboard";
import Wishlist from "./pages/Wishlist";
import VlakyAutobusy from "./pages/VlakyAutobusy";
import PriceComparison from "./pages/PriceComparison";
import ABTestAnalyticsDashboard from "./pages/ABTestAnalyticsDashboard";
import ShareABTestDashboard from "./pages/ShareABTestDashboard";
import ReunionPage from "./pages/ReunionPage";
import Letenky1500 from "./pages/Letenky1500";
import Redirect from "./pages/Redirect";
import Aerolinky from "./pages/Aerolinky";
import DubajPage from "./pages/DubajPage";
import BaliPage from "./pages/BaliPage";
import NewYorkPage from "./pages/NewYorkPage";
import { HeatmapTracking } from "./components/HeatmapTracking";
import { RevolutPopup } from "./components/RevolutPopup";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/letecka-spolecnost/:slug" component={AirlinePage} />
      <Route path="/letenky-do-:slug" component={DestinationPage} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/levne-letenky" component={LevneLetenky} />
      <Route path="/dovolene" component={Dovolene} />
      <Route path="/admin/ab-test" component={ABTestDashboard} />
      <Route path="/admin/emails" component={AdminEmails} />
      <Route path="/admin/hero-ab-test" component={HeroABTestDashboard} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/vlaky-autobusy" component={VlakyAutobusy} />
      <Route path="/porovnani-cen" component={PriceComparison} />
      <Route path="/admin/ab-test-analytics" component={ABTestAnalyticsDashboard} />
      <Route path="/admin/share-ab-test" component={ShareABTestDashboard} />
      <Route path="/reunion" component={ReunionPage} />
      <Route path="/letenky-reunion" component={ReunionPage} />
      <Route path="/letenky-do-1500" component={Letenky1500} />
      <Route path="/letenky-do-1500" component={Letenky1500} />
      <Route path="/redirect" component={Redirect} />
      <Route path="/aerolinky" component={Aerolinky} />
      <Route path="/dubaj" component={DubajPage} />
      <Route path="/letenky-dubaj" component={DubajPage} />
      <Route path="/bali" component={BaliPage} />
      <Route path="/letenky-bali" component={BaliPage} />
      <Route path="/new-york" component={NewYorkPage} />
      <Route path="/letenky-new-york" component={NewYorkPage} />    <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <MetaPixel />
          <HeatmapTracking />
          <RevolutPopup />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
