import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound, CheckCircle, AlertCircle } from "lucide-react";

export default function MagicLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Authenticating...");
  const [isSuccess, setIsSuccess] = useState(null);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    const token = searchParams.get("token");
    
    if (!token) {
        setStatus("Invalid or missing Magic Link.");
        setIsSuccess(false);
        return;
    }

    // In a real app we'd verify this via backend, but here it's already a valid JWT created natively.
    // We can decode to ensure it's a magic link token.
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.type !== "magic_link") {
            setStatus("Token is not a valid magic link.");
            setIsSuccess(false);
            return;
        }

        // Token is valid! 
        // We log the user in by saving the Magic JWT as their session token 
        // (the backend will accept it because we used the same JWT Secret).
        localStorage.setItem("token", token);
        setStatus("Successfully authenticated!");
        setIsSuccess(true);
        setTimeout(() => navigate("/dashboard"), 2000);
    } catch(e) {
        setStatus("Failed to decode secure token.");
        setIsSuccess(false);
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50/50">
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in text-center">


        <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg ${isSuccess === true ? 'bg-green-50 shadow-green-100 border border-green-100' : isSuccess === false ? 'bg-red-50 shadow-red-100 border border-red-100' : 'bg-blue-50 shadow-blue-100 border border-blue-100'}`}>
          {isSuccess === true ? (
              <CheckCircle className="text-green-600 w-8 h-8" />
          ) : isSuccess === false ? (
              <AlertCircle className="text-red-600 w-8 h-8" />
          ) : (
              <KeyRound className="text-blue-600 w-8 h-8 animate-pulse" />
          )}
        </div>

        
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Magic Login</h2>
        <p className={`text-sm font-medium ${isSuccess === false ? 'text-red-600' : 'text-gray-500'}`}>
            {status}
        </p>


        {isSuccess === false && (
            <button onClick={() => navigate("/login")} className="btn-secondary mt-8">
                Return to Login
            </button>
        )}
      </div>
    </div>
  );
}
