// AuthForm.jsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const Login = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (activeTab == "login") {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
        
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
        });
        console.log("Se registro con exito");
      } catch (error) {
        console.log(error);
      }
    }
    setIsLoading(false);
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  return (
     <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FAF7F2",
        backgroundImage: `
          radial-gradient(ellipse at 20% 20%, rgba(167, 197, 160, 0.18) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 80%, rgba(210, 196, 176, 0.2) 0%, transparent 60%)
        `,
        padding: "1rem",
        fontFamily: "'DM Sans', 'Plus Jakarta Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decoración de fondo — círculos cálidos sutiles */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(167,197,160,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-80px",
          left: "-80px",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(210,196,176,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
 
      {/* Card */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          boxShadow: "0 8px 40px rgba(120, 100, 70, 0.10), 0 2px 8px rgba(120,100,70,0.06)",
          border: "1px solid rgba(167,197,160,0.25)",
          overflow: "hidden",
        }}
      >
        {/* Franja decorativa superior */}
        <div
          style={{
            height: "4px",
            background: "linear-gradient(90deg, #7FAF8A, #A8C5A0, #C5D9A0)",
            width: "100%",
          }}
        />
 
        {/* Header */}
        <div
          style={{
            padding: "2rem 2rem 0",
            textAlign: "center",
          }}
        >
          {/* Ícono */}
          <div
            style={{
              margin: "0 auto 1rem",
              width: "56px",
              height: "56px",
              background: "linear-gradient(135deg, #7FAF8A, #A8C5A0)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(127,175,138,0.3)",
            }}
          >
            <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
 
          <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#2D2D2D", margin: "0 0 0.25rem" }}>
            {activeTab === "login" ? "Bienvenido de vuelta" : "Crear cuenta"}
          </h1>
          <p style={{ color: "#9B8E80", fontSize: "0.875rem", margin: "0" }}>
            {activeTab === "login"
              ? "Ingresa tus credenciales para continuar"
              : "Regístrate con tu correo y contraseña"}
          </p>
        </div>
 
        {/* Tabs */}
        <div style={{ padding: "1.5rem 2rem 0" }}>
          <div
            style={{
              display: "flex",
              backgroundColor: "#F5F1EB",
              borderRadius: "14px",
              padding: "4px",
              border: "1px solid rgba(167,197,160,0.2)",
            }}
          >
            {["login", "register"].map((tab) => (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
                style={{
                  flex: 1,
                  padding: "0.625rem",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  background: activeTab === tab
                    ? "linear-gradient(135deg, #7FAF8A, #A8C5A0)"
                    : "transparent",
                  color: activeTab === tab ? "#fff" : "#9B8E80",
                  boxShadow: activeTab === tab ? "0 2px 10px rgba(127,175,138,0.25)" : "none",
                }}
              >
                {tab === "login" ? "Iniciar Sesión" : "Registrarse"}
              </button>
            ))}
          </div>
        </div>
 
        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem 2rem 2rem" }}>
          {/* Email */}
          <div style={{ marginBottom: "1.1rem" }}>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", color: "#6B6058", marginBottom: "0.4rem" }}>
              Correo electrónico
            </label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", top: "50%", left: "12px", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <svg width="18" height="18" fill="none" stroke="#B5A898" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
                style={{
                  width: "100%",
                  paddingLeft: "38px",
                  paddingRight: "14px",
                  paddingTop: "0.7rem",
                  paddingBottom: "0.7rem",
                  backgroundColor: "#FAF7F2",
                  border: "1.5px solid #E8E0D5",
                  borderRadius: "12px",
                  fontSize: "0.9rem",
                  color: "#2D2D2D",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#7FAF8A")}
                onBlur={(e) => (e.target.style.borderColor = "#E8E0D5")}
              />
            </div>
          </div>
 
          {/* Contraseña */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", color: "#6B6058", marginBottom: "0.4rem" }}>
              Contraseña
            </label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", top: "50%", left: "12px", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <svg width="18" height="18" fill="none" stroke="#B5A898" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  paddingLeft: "38px",
                  paddingRight: "42px",
                  paddingTop: "0.7rem",
                  paddingBottom: "0.7rem",
                  backgroundColor: "#FAF7F2",
                  border: "1.5px solid #E8E0D5",
                  borderRadius: "12px",
                  fontSize: "0.9rem",
                  color: "#2D2D2D",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#7FAF8A")}
                onBlur={(e) => (e.target.style.borderColor = "#E8E0D5")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "12px",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" fill="none" stroke="#B5A898" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" />
                  </svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="#B5A898" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
 
          {/* Botón principal */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.8rem",
              background: isLoading ? "#B5CEB9" : "linear-gradient(135deg, #7FAF8A, #A8C5A0)",
              color: "#fff",
              fontWeight: "700",
              fontSize: "0.9375rem",
              borderRadius: "12px",
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 16px rgba(127,175,138,0.3)",
              transition: "all 0.25s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => { if (!isLoading) e.target.style.boxShadow = "0 6px 20px rgba(127,175,138,0.4)"; }}
            onMouseLeave={(e) => { e.target.style.boxShadow = "0 4px 16px rgba(127,175,138,0.3)"; }}
          >
            {isLoading ? (
              <>
                <svg style={{ animation: "spin 1s linear infinite" }} width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                  <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Procesando...
              </>
            ) : activeTab === "login" ? "Ingresar" : "Registrarse"}
          </button>
 
          {/* Divisor */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "1.25rem 0" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#E8E0D5" }} />
            <span style={{ fontSize: "0.8125rem", color: "#B5A898", whiteSpace: "nowrap" }}>o continuar con</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#E8E0D5" }} />
          </div>
 
          {/* Botones sociales */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "1.25rem" }}>
            {[
              {
                label: "Google",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                ),
              },
              {
                label: "Apple",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#2D2D2D">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                ),
              },
            ].map(({ label, icon }) => (
              <button
                key={label}
                type="button"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "0.65rem",
                  backgroundColor: "#FAF7F2",
                  border: "1.5px solid #E8E0D5",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#4A4035",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#7FAF8A"; e.currentTarget.style.backgroundColor = "#F2EFE8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E8E0D5"; e.currentTarget.style.backgroundColor = "#FAF7F2"; }}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
 
          {/* Link crear cuenta */}
          <div style={{ textAlign: "center" }}>
            <button
              type="button"
              onClick={() => switchTab(activeTab === "login" ? "register" : "login")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
                color: "#7FAF8A",
                fontWeight: "600",
                textDecoration: "underline",
                textDecorationColor: "rgba(127,175,138,0.4)",
                textUnderlineOffset: "3px",
              }}
            >
              {activeTab === "login" ? "Crea tu cuenta" : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </div>
        </form>
      </div>
 
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Login;
