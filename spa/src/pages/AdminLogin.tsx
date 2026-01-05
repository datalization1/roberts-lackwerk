import { useNavigate } from "react-router-dom";
import { useLogin, useMe } from "../api/auth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const login = useLogin();
  const me = useMe();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") || "");
    const password = String(form.get("password") || "");
    await login.mutateAsync({ username, password });
    navigate("/admin");
  };

  return (
    <div className="container py-12 max-w-md">
      <div className="bg-surface border border-border rounded-fig p-6 grid gap-4">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        {me.data?.is_staff && <div className="text-green-400 text-sm">Bereits angemeldet als {me.data.username}</div>}
        {login.isError && <div className="text-red-400 text-sm">Login fehlgeschlagen.</div>}
        <form className="grid gap-3" onSubmit={handleLogin}>
          <input name="username" placeholder="Benutzername" className="rl-input" />
          <input name="password" type="password" placeholder="Passwort" className="rl-input" />
          <button className="px-4 py-2 rounded-full bg-accent text-white text-sm disabled:opacity-60" disabled={login.isLoading}>
            {login.isLoading ? "Anmelden..." : "Anmelden"}
          </button>
        </form>
      </div>
    </div>
  );
}
