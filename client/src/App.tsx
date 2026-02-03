import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
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
      <Route path={"/404"} component={NotFound} />
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
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
