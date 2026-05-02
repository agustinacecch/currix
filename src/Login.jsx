import { useState } from "react";

export default function Login({ onLogin, onCancel }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const endpoint = isRegistering ? "/auth/register" : "/auth/login";
    const bodyArgs = { email, password };
    if (isRegistering) {
      bodyArgs.username = username;
      // Gather guest progress
      const guestCareers = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("guestProgress_")) {
          const slug = key.replace("guestProgress_", "");
          try {
            const subjects = JSON.parse(localStorage.getItem(key));
            guestCareers.push({ slug, subjects });
          } catch(e){}
        }
      }
      bodyArgs.guestCareers = guestCareers;
    }

    try {
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyArgs)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Ha ocurrido un error");
        return;
      }

      if (isRegistering) {
        setSuccessMsg("¡Usuario creado exitosamente!");
        setIsRegistering(false); // volver a la pestaña de login
        setPassword("");
      } else {
        localStorage.setItem("token", data.token);
        onLogin();
      }

    } catch (err) {
      setError("Error de conexión");
    }
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: "380px",
      margin: "0 auto",
      backgroundColor: "white",
      borderRadius: "16px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      overflow: "hidden",
      border: "1px solid #e2e8f0"
    }}>
      <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
        <button 
          onClick={() => { setIsRegistering(false); setError(""); setSuccessMsg(""); }}
          style={{ 
            flex: 1, 
            padding: "16px", 
            background: !isRegistering ? "transparent" : "#f8fafc",
            border: "none", 
            borderBottom: !isRegistering ? "2px solid #2563eb" : "2px solid transparent",
            fontWeight: !isRegistering ? "600" : "400",
            color: !isRegistering ? "#2563eb" : "#64748b",
            cursor: "pointer"
          }}
        >
          Iniciar sesión
        </button>
        <button 
          onClick={() => { setIsRegistering(true); setError(""); setSuccessMsg(""); }}
          style={{ 
            flex: 1, 
            padding: "16px", 
            background: isRegistering ? "transparent" : "#f8fafc",
            border: "none", 
            borderBottom: isRegistering ? "2px solid #2563eb" : "2px solid transparent",
            fontWeight: isRegistering ? "600" : "400",
            color: isRegistering ? "#2563eb" : "#64748b",
            cursor: "pointer"
          }}
        >
          Registrarse
        </button>
        {onCancel && (
          <button 
            onClick={onCancel}
            style={{ padding: "16px", background: "transparent", border: "none", cursor: "pointer", color: "#64748b", fontWeight: "bold" }}
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {successMsg && (
          <div style={{ background: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "8px", fontSize: "14px", textAlign: "center", border: "1px solid #bbf7d0" }}>
            {successMsg}
          </div>
        )}

        {error && (
          <div style={{ background: "#fef2f2", color: "#991b1b", padding: "12px", borderRadius: "8px", fontSize: "14px", textAlign: "center", border: "1px solid #fecaca" }}>
            {error}
          </div>
        )}

        {isRegistering && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", color: "#475569", fontWeight: "500" }}>Nombre o Apodo</label>
            <input
              required
              type="text"
              placeholder="Agus, Juan, etc."
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
            />
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "14px", color: "#475569", fontWeight: "500" }}>Correo electrónico</label>
          <input
            required
            type="email"
            placeholder="usuario@correo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "14px", color: "#475569", fontWeight: "500" }}>Contraseña</label>
          <input
            required
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
          />
        </div>

        <button 
          type="submit" 
          style={{ 
             marginTop: "8px",
             padding: "12px", 
             background: "#2563eb", 
             color: "white", 
             border: "none", 
             borderRadius: "8px", 
             fontWeight: "600",
             cursor: "pointer"
          }}
        >
          {isRegistering ? "Crear cuenta" : "Entrar a Currix"}
        </button>
      </form>
    </div>
  );
}