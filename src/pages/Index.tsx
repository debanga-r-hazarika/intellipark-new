
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  // Redirect to the home page when this component is rendered
  useEffect(() => {
    navigate("/");
  }, [navigate]);

  return null; // This won't render as we're redirecting immediately
};

export default Index;
