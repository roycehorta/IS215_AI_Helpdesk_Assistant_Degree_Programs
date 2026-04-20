import { Navigate } from "react-router-dom";
import { useAuth } from "@/store/authStore";

const Index = () => {
  const { user } = useAuth();
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
};

export default Index;
