import { useEffect, useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Biodata from "../components/Biodata";
import Pendidikan from "../components/Pendidikan";
import Pengalaman from "../components/Pengalaman";
import Keahlian from "../components/Keahlian";
import Kontak from "../components/Kontak";
import Karya from "../components/Karya";
import "../styles/Admin.css";

const tabs = [
  { id: "biodata", label: "Biodata", index: "01", description: "Profil dan informasi diri" },
  { id: "pendidikan", label: "Pendidikan", index: "02", description: "Riwayat pendidikan" },
  { id: "pengalaman", label: "Pengalaman", index: "03", description: "Pengalaman profesional" },
  { id: "keahlian", label: "Keahlian", index: "04", description: "Keahlian dan kemampuan" },
  { id: "kontak", label: "Kontak", index: "05", description: "Kontak dan media sosial" },
  { id: "karya", label: "Karya", index: "06", description: "Proyek dan karya terbaik" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("biodata");
  const activeSection = tabs.find((tab) => tab.id === activeTab) || tabs[0];
  const displayName = user?.nama_lengkap || user?.username || "Admin";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase())
    .join("");

  useEffect(() => {
    document.title = "Dashboard — Editor Portofolio";
  }, []);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="admin-dashboard">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand" aria-label="Kembali ke portofolio">
          <span className="admin-brand-mark">R</span>
          <span>Ruang admin<small>Portofolio pribadi</small></span>
        </Link>

        <div className="admin-sidebar-label">Menu utama</div>
        <nav className="admin-side-nav" aria-label="Menu dashboard">
          {tabs.map((tab) => (
            <button
              className={`admin-nav-item ${activeTab === tab.id ? "is-active" : ""}`}
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              <span className="admin-nav-index">{tab.index}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-note">
            <span className="admin-note-mark" aria-hidden="true">✳</span>
            <p>Perubahan tersimpan langsung ke portofolio.</p>
          </div>
          <Link className="admin-view-public" to="/">
            Lihat situs publik
          </Link>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb">
            <span>Dashboard</span><span aria-hidden="true">/</span><span>{activeSection.label}</span>
          </div>
          <div className="admin-topbar-actions">
            <button
              className="admin-theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label={`Aktifkan mode ${theme === "light" ? "gelap" : "terang"}`}
              aria-pressed={theme === "dark"}
            >
              <span className="admin-theme-track"><span /></span>
              <span>{theme === "light" ? "Terang" : "Gelap"}</span>
            </button>
            <div className="admin-user-chip">
              <span className="admin-avatar">{initials}</span>
              <span>{displayName}</span>
            </div>
            <button className="admin-logout" type="button" onClick={handleLogout}>Keluar</button>
          </div>
        </header>

        <div className="admin-content">
          <div className="admin-page-heading">
            <div>
              <span className="admin-kicker">Ruang kerja pribadi</span>
              <h1>Dashboard</h1>
              <p>Kelola dan perbarui semua bagian portofoliomu dari sini.</p>
            </div>
            <div className="admin-live-badge"><span /> Portofolio aktif</div>
          </div>

          <section className="admin-overview" aria-label="Ringkasan dashboard">
            <article className="admin-overview-card">
              <span className="overview-label">Konten portofolio</span>
              <span className="overview-value">06</span>
              <span className="overview-footnote">bagian yang bisa dikelola</span>
              <span className="overview-decoration" aria-hidden="true">06</span>
            </article>
            <article className="admin-overview-card overview-card-featured">
              <span className="overview-label">Sedang mengedit</span>
              <span className="overview-title">{activeSection.label}</span>
              <span className="overview-footnote">{activeSection.description}</span>
              <span className="overview-decoration" aria-hidden="true">{activeSection.index}</span>
            </article>
            <article className="admin-overview-card">
              <span className="overview-label">Mode tampilan</span>
              <span className="overview-title">{theme === "light" ? "Terang" : "Gelap"}</span>
              <span className="overview-footnote">Preferensi tema saat ini</span>
              <span className="overview-decoration" aria-hidden="true">◐</span>
            </article>
          </section>

          <section className="admin-editor">
            <header className="admin-editor-heading">
              <div>
                <span className="admin-kicker">Pengaturan konten</span>
                <h2>{activeSection.label}</h2>
              </div>
              <span className="admin-editor-index">{activeSection.index} / 06</span>
            </header>
            <div className="admin-editor-tabs" role="tablist" aria-label="Bagian portofolio">
              {tabs.map((tab) => (
                <button
                  className={`admin-editor-tab ${activeTab === tab.id ? "is-active" : ""}`}
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls="admin-editor-panel"
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="admin-editor-panel" id="admin-editor-panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
              {activeTab === "biodata" && <Biodata token={token} />}
              {activeTab === "pendidikan" && <Pendidikan token={token} />}
              {activeTab === "pengalaman" && <Pengalaman token={token} />}
              {activeTab === "keahlian" && <Keahlian token={token} />}
              {activeTab === "kontak" && <Kontak token={token} />}
              {activeTab === "karya" && <Karya token={token} />}
            </div>
          </section>

          <footer className="admin-footer">
            <span>© {new Date().getFullYear()} Rodo Lemuel Nadeak</span>
            <span>Perubahan pada dashboard akan tampil di situs publik.</span>
          </footer>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
