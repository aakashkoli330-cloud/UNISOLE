import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/helpers";
import { GOOGLE_CLIENT_ID } from "../../config";
import Button from "../ui/Button";

function loadGoogleScript() {
  return new Promise((resolve) => {
    if (window.google?.accounts?.id) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function GoogleLoginButton({ onSuccess, onError }) {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadGoogleScript().then((ok) => {
      if (cancelled || !ok || initializedRef.current) return;
      initializedRef.current = true;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          setLoading(true);
          try {
            await googleLogin(response.credential);
            onSuccess?.();
          } catch (err) {
            onError?.(getErrorMessage(err, "Google login failed"));
          } finally {
            setLoading(false);
          }
        },
      });
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          shape: "rectangular",
          width: "100%",
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [googleLogin, onSuccess, onError]);

  if (loading) {
    return (
      <Button variant="secondary" fullWidth disabled>
        Connecting to Google...
      </Button>
    );
  }

  return <div ref={buttonRef} className="w-full overflow-hidden rounded-lg" />;
}
