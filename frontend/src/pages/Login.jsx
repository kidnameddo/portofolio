import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoginApi } from "../api/backendApi";
import "../styles/Admin.css";

const Login = () => {
  const navigate = useNavigate();
  const { token, user, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    document.title = "Masuk Admin — Portofolio Rodo";
    if (token && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, user, navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setErrorMessage("Isi username dan password terlebih dahulu.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const response = await LoginApi(cleanUsername, password);
      if (response.data.status !== "success" || !response.data.token || !response.data.user) {
        setErrorMessage(response.data.message || response.data.pesan || "Username atau password tidak cocok.");
        return;
      }

      login(response.data.token, response.data.user);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
        error.response?.data?.pesan ||
        "Tidak dapat terhubung ke server. Pastikan backend sedang berjalan."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-glow admin-login-glow-one" aria-hidden="true" />
      <div className="admin-login-glow admin-login-glow-two" aria-hidden="true" />
      <Link className="admin-login-back" to="/">
        Kembali ke portofolio
      </Link>

      <div className="admin-login-layout">
        <section className="admin-login-story">
          <span className="admin-kicker">Ruang kerja pribadi</span>
          <h1>Kelola portofolio, dengan lebih mudah.</h1>
          <p>
            Perbarui profil, perjalanan, dan karya dalam satu ruang yang rapi.
            Masuk untuk melanjutkan ke dashboard.
          </p>
          <div className="admin-login-preview" aria-hidden="true">
            <span className="preview-dot" />
            <span className="preview-line preview-line-long" />
            <span className="preview-line preview-line-short" />
            <span className="preview-block preview-block-one" />
            <span className="preview-block preview-block-two" />
            <span className="preview-block preview-block-three" />
          </div>
          <span className="admin-login-caption">Portofolio · Medan, Indonesia</span>
        </section>

        <section className="admin-login-panel" aria-labelledby="login-title">
          <div className="login-panel-heading">
            <span className="admin-kicker">Selamat datang kembali</span>
            <h2 id="login-title">Masuk ke dashboard</h2>
            <p>Gunakan akun admin untuk mengelola konten portofolio.</p>
          </div>

          <form className="admin-login-form" onSubmit={handleLogin} noValidate>
            <label htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Masukkan username"
              disabled={isSubmitting}
              required
            />

            <label htmlFor="admin-password">Password</label>
            <div className="password-field">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan password"
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className="password-visibility"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                aria-pressed={showPassword}
              >
                {showPassword ? "Sembunyikan" : "Lihat"}
              </button>
            </div>

            {errorMessage && (
              <p className="login-error" role="alert">{errorMessage}</p>
            )}

            <button className="admin-login-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <><span className="login-spinner" aria-hidden="true" /> Memeriksa akun...</>
              ) : (
                <>Masuk</>
              )}
            </button>
          </form>

          <div className="login-panel-footer">
            <span>Akses hanya untuk administrator.</span>
            <span className="login-security"><span aria-hidden="true">●</span> Koneksi aman</span>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
