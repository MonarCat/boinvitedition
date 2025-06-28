
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { LandingPage } from "./LandingPage";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-light via-cream to-cream-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-blue mx-auto mb-4"></div>
          <p className="text-royal-blue font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <LandingPage />;
};

export default Index;
