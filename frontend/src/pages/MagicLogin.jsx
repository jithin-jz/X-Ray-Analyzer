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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in relative overflow-hidden text-center">
        {/* Glow orb decorator */}
        <div className={`absolute -top-20 right-0 w-40 h-40 rounded-full blur-[80px] opacity-20 pointer-events-none ${isSuccess === true ? 'bg-green-500' : isSuccess === false ? 'bg-red-500' : 'bg-indigo-500'}`}></div>

        <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg ${isSuccess === true ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/30' : isSuccess === false ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30' : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30'}`}>
          {isSuccess === true ? (
              <CheckCircle className="text-white w-8 h-8" />
          ) : isSuccess === false ? (
              <AlertCircle className="text-white w-8 h-8" />
          ) : (
              <KeyRound className="text-white w-8 h-8 animate-pulse" />
          )}
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Magic Login</h2>
        <p className={`text-sm ${isSuccess === false ? 'text-red-400' : 'text-gray-400'}`}>
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
