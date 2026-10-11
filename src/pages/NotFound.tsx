import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center animated-bg">
      <div className="text-center sci-fi-container">
        <h1 className="text-6xl font-orbitron font-bold text-neon-orange glow-text mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">⚠️ SECTOR NOT FOUND</p>
        <p className="text-sm text-muted-foreground mb-8">
          The requested mission zone does not exist in the Leveller system.
        </p>
        <a href="/" className="neon-button">
          🏠 RETURN TO BASE
        </a>
      </div>
    </div>
  );
};

export default NotFound;
