import { Loader } from "./components/loader";

// Root navigation fallback (Suspense): shown in the content area during route
// transitions, while the nav chrome (TopBar / MobileTabBar / footer) stays put.
export default function Loading() {
  return <Loader />;
}
