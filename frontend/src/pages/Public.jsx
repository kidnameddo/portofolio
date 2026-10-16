import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { GetPublic, BASE_URL, AskChatbot } from "../api/backendApi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import nofoto from "../assets/nofoto.svg";
import "./Public.css";

const Public = () => {
  const { token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [portfolioData, setPortfolioData] = useState(null);
  const [portfolioError, setPortfolioError] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [failedQuestion, setFailedQuestion] = useState("");
  const [navVisible, setNavVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const portfolioRef = useRef(null);
  const landingRef = useRef(null);
  const messagesRef = useRef(null);
  const conversationRef = useRef([]);

  useEffect(() => {
    document.title = "Rodo Lemuel Nadeak — Portofolio";
    let cancelled = false;

    GetPublic()
      .then((response) => {
        if (!cancelled && response.data.status === "success") {
          setPortfolioData(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Gagal memuat data portofolio:", error);
        if (!cancelled) setPortfolioError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = revealed && !chatOpen ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [revealed, chatOpen]);

  useEffect(() => {
    let frame = 0;
    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0);
        if (revealed && landingRef.current) {
          setNavVisible(landingRef.current.getBoundingClientRect().bottom <= 0);
        }
      });
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [revealed]);

  useEffect(() => {
    if (chatOpen && messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chatOpen, messages, chatLoading]);

  const sendMessage = async (text, existingMessages = messages) => {
    const trimmed = text.trim();
    if (!trimmed || chatLoading) return;

    const nextMessages = [...existingMessages, { role: "user", text: trimmed }];
    const requestMessages = [
      ...conversationRef.current.slice(-18),
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setChatInput("");
    setChatError("");
    setFailedQuestion("");
    setChatLoading(true);

    try {
      const response = await AskChatbot(requestMessages);
      if (typeof response.data.reply !== "string" || !response.data.reply.trim()) {
        throw new Error("Chatbot mengembalikan jawaban kosong.");
      }
      const reply = response.data.reply.trim();
      conversationRef.current = [
        ...requestMessages,
        { role: "model", content: reply },
      ];
      setMessages([...nextMessages, { role: "model", text: reply }]);
    } catch (error) {
      console.error("Gagal mengirim pesan ke chatbot:", error);
      setChatError(error.response?.data?.message || "Chat belum dapat merespons. Coba lagi sebentar.");
      setFailedQuestion(trimmed);
    } finally {
      setChatLoading(false);
    }
  };

  const startChat = (event) => {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || chatLoading) return;
    conversationRef.current = [];
    setMessages([]);
    setChatOpen(true);
    sendMessage(trimmed, []);
    setQuestion("");
  };

  const revealPortfolio = () => {
    setRevealed(true);
    window.requestAnimationFrame(() => {
      portfolioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const profil = portfolioData?.profil || {};
  const pendidikan = portfolioData?.riwayat_pendidikan || [];
  const pengalaman = portfolioData?.pengalaman || [];
  const keahlian = portfolioData?.keahlian || [];
  const kontak = portfolioData?.kontak_aktif || [];
  const karya = portfolioData?.karya_terbaik || [];
  const profileName =
    profil.username === "admin" && profil.nama_lengkap === "Administrator"
      ? "Rodo Lemuel Nadeak"
      : profil.nama_lengkap || "Rodo Lemuel Nadeak";
  const fotoUrl = !profil.foto
    ? nofoto
    : profil.foto.startsWith("http")
      ? profil.foto
      : `${BASE_URL}/uploads/${profil.foto}`;
  const educationLocations = [
    ["Universitas Negeri Medan", "https://maps.app.goo.gl/7dfgJiUdUJKRHCFt6"],
    ["SMKN 9 Medan", "https://maps.app.goo.gl/mTu411E7w4AKfQwd7"],
    ["Eka Prasetya", "https://maps.app.goo.gl/Pxmjc3rXNHNBi9EMA"],
    ["Kalam Kudus 2 Medan", "https://maps.app.goo.gl/tTH4D367CHmWA1vaA"],
  ];
  const getEducationMap = (institution) => {
    const normalizedName = institution.toLocaleLowerCase("id");
    return educationLocations.find(([name]) =>
      normalizedName.includes(name.toLocaleLowerCase("id"))
    )?.[1];
  };

  return (
    <main className="portfolio-page">
      <div
        className="scroll-progress"
        role="progressbar"
        aria-label="Kemajuan membaca halaman"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(scrollProgress * 100)}
      >
        <span style={{ transform: `scaleX(${scrollProgress})` }} />
      </div>

      <section
        className="ai-landing"
        aria-labelledby="landing-title"
        ref={landingRef}
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty(
            "--pointer-x",
            `${((event.clientX - bounds.left) / bounds.width) * 100}%`
          );
          event.currentTarget.style.setProperty(
            "--pointer-y",
            `${((event.clientY - bounds.top) / bounds.height) * 100}%`
          );
        }}
      >
        <div className="landing-aurora" aria-hidden="true" />
        {!navVisible && (
          <button
            className="theme-toggle floating-theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={`Aktifkan mode ${theme === "light" ? "gelap" : "terang"}`}
            aria-pressed={theme === "dark"}
          >
            <span className="theme-toggle-track"><span className="theme-toggle-thumb" /></span>
            <span>{theme === "light" ? "Terang" : "Gelap"}</span>
          </button>
        )}
        <div className="landing-content">
          <span className="eyebrow">Portofolio pribadi</span>
          <h1 id="landing-title">Ingin tahu tentang Rodo?</h1>
          <p className="landing-description">
            Tanyakan apa saja tentang perjalanan, pendidikan, dan pengalaman Rodo.
          </p>
          <form className="landing-prompt" onSubmit={startChat}>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form.requestSubmit();
                }
              }}
              placeholder="Tanyakan sesuatu tentang Rodo..."
              aria-label="Tulis pertanyaan tentang Rodo"
              rows={2}
            />
            <button type="submit" aria-label="Kirim pesan" disabled={!question.trim() || chatLoading}>
              <span>Send</span>
            </button>
          </form>
          <p className="prompt-hint">Tekan Enter untuk memulai · Shift + Enter untuk baris baru</p>
          <button
            className="scroll-cue"
            type="button"
            onClick={revealPortfolio}
            aria-label="Lihat portofolio"
          >
            Lihat!
          </button>
        </div>
      </section>

      {revealed && (
        <header className={`portfolio-nav ${navVisible ? "is-visible" : ""}`} aria-hidden={!navVisible} inert={!navVisible}>
          <nav aria-label="Navigasi portofolio">
            <a href="#tentang">Tentang</a>
            <a href="#pendidikan">Pendidikan</a>
            <a href="#pengalaman">Pengalaman</a>
            <a href="#keahlian">Keahlian</a>
            <a href="#karya">Karya</a>
          </nav>
          <div className="nav-actions">
            <button
              className="theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label={`Aktifkan mode ${theme === "light" ? "gelap" : "terang"}`}
              aria-pressed={theme === "dark"}
            >
              <span className="theme-toggle-track"><span className="theme-toggle-thumb" /></span>
            </button>
            {token ? <Link className="nav-admin" to="/dashboard">Dashboard</Link> : <Link className="nav-admin" to="/login">Admin</Link>}
          </div>
        </header>
      )}

      <div className={`portfolio-content ${revealed ? "is-revealed" : ""}`} id="portfolio" ref={portfolioRef}>
        <section className="portfolio-intro content-section" id="tentang">
          <div className="intro-copy">
            <span className="eyebrow">Tentang saya</span>
            <h2>{profileName}</h2>
            <p className="intro-role">Mahasiswa Ilmu Komputer · Universitas Negeri Medan</p>
            <p className="intro-text">
              Saya adalah mahasiswa Ilmu Komputer angkatan 2024 yang tertarik pada teknologi,
              pengembangan, dan terus belajar melalui pengalaman baru.
            </p>
            <div className="intro-links">
              {kontak.map((item, index) => {
                try {
                  const url = new URL(item.url);
                  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
                  return <a key={`${item.nama_media}-${index}`} href={url.href} target="_blank" rel="noopener noreferrer">{item.nama_media}</a>;
                } catch {
                  return null;
                }
              })}
            </div>
          </div>
          <div className="profile-frame">
            <img
              src={fotoUrl}
              alt={profileName}
              onError={(event) => { event.currentTarget.src = nofoto; }}
            />
            <span>Medan, Indonesia</span>
          </div>
        </section>

        {portfolioError && (
          <p className="portfolio-notice">Data terbaru belum dapat dimuat. Informasi utama tetap ditampilkan.</p>
        )}

        <section className="content-section" id="pendidikan">
          <div className="section-heading"><span className="eyebrow">Latar belakang</span><h2>Pendidikan</h2></div>
          {pendidikan.length ? (
            <div className="timeline-grid">
              {pendidikan.map((item, index) => (
                <article className="timeline-card" key={`${item.nama_institusi}-${index}`}>
                  <span className="timeline-number">0{index + 1}</span>
                  <div className="timeline-card-details">
                    <div><h3>{item.nama_institusi}</h3><p>{item.tingkat}{item.jurusan ? ` · ${item.jurusan}` : ""}</p></div>
                    {item.gambar && <img className="education-image" src={`${BASE_URL}/uploads/${item.gambar}`} alt={`Dokumentasi ${item.nama_institusi}`} />}
                  </div>
                  {(item.tahun_mulai || item.tahun_selesai) && <span className="timeline-date">{item.tahun_mulai} — {item.tahun_selesai}</span>}
                  {getEducationMap(item.nama_institusi) && (
                    <a
                      className="location-link"
                      href={getEducationMap(item.nama_institusi)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Lihat lokasi
                    </a>
                  )}
                </article>
              ))}
            </div>
          ) : <p className="empty-state">Riwayat pendidikan belum ditambahkan.</p>}
        </section>

        <section className="content-section" id="pengalaman">
          <div className="section-heading"><span className="eyebrow">Perjalanan</span><h2>Pengalaman</h2></div>
          {pengalaman.length ? (
            <div className="experience-grid">
              {pengalaman.map((item, index) => (
                <article className="experience-card" key={`${item.nama_perusahaan}-${index}`}>
                  {item.gambar && <img src={`${BASE_URL}/uploads/${item.gambar}`} alt={`Dokumentasi ${item.nama_perusahaan}`} />}
                  <span className="eyebrow">Pengalaman 0{index + 1}</span>
                  <h3>{item.jabatan}</h3>
                  <p>{item.nama_perusahaan}</p>
                  {(item.tahun_mulai || item.tahun_selesai) && <span className="timeline-date">{item.tahun_mulai} — {item.tahun_selesai}</span>}
                </article>
              ))}
            </div>
          ) : <p className="empty-state">Pengalaman belum ditambahkan.</p>}
        </section>

        <section className="content-section" id="keahlian">
          <div className="section-heading"><span className="eyebrow">Yang saya kerjakan</span><h2>Keahlian</h2></div>
          {keahlian.length ? (
            <div className="skill-list">{keahlian.map((item, index) => <span className="skill-chip" key={`${item.nama_keahlian}-${index}`}>{item.nama_keahlian}<span>{item.level}</span></span>)}</div>
          ) : <p className="empty-state">Keahlian akan segera ditambahkan.</p>}
        </section>

        <section className="content-section" id="karya">
          <div className="section-heading"><span className="eyebrow">Pilihan proyek</span><h2>Karya</h2></div>
          {karya.length ? (
            <div className="work-grid">{karya.map((item, index) => (
              <article className="work-card" key={`${item.nama_karya}-${index}`}>
                {item.gambar && <img src={`${BASE_URL}/uploads/${item.gambar}`} alt={item.nama_karya} />}
                <span className="eyebrow">Proyek 0{index + 1}</span>
                <h3>{item.nama_karya}</h3>
                <p>{item.deskripsi}</p>
                {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer">Lihat proyek</a>}
              </article>
            ))}</div>
          ) : <p className="empty-state">Karya akan segera ditambahkan.</p>}
        </section>

        <footer className="portfolio-footer"><span>© {new Date().getFullYear()} Rodo Lemuel Nadeak</span><a href="#portfolio">Kembali ke atas</a></footer>
      </div>

      {chatOpen && (
        <div className="chat-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !chatLoading) setChatOpen(false);
        }}>
          <section className="chat-card" role="dialog" aria-modal="true" aria-labelledby="chat-title">
            <header className="chat-header">
              <div><span className="chat-status-dot" /><div><h2 id="chat-title">Tanya tentang Rodo</h2><p>Asisten portofolio</p></div></div>
              <button type="button" className="chat-close" onClick={() => setChatOpen(false)} aria-label="Tutup chat">×</button>
            </header>
            <div className="chat-messages" ref={messagesRef} aria-live="polite">
              {messages.map((message, index) => (
                <div className={`chat-message ${message.role === "user" ? "from-user" : "from-assistant"}`} key={`${message.role}-${index}`}>
                  {message.text}
                </div>
              ))}
              {chatLoading && <div className="chat-message from-assistant chat-thinking"><span /><span /><span /></div>}
              {chatError && (
                <div className="chat-error">
                  <p>{chatError}</p>
                  {failedQuestion && (
                    <button
                      type="button"
                      onClick={() => sendMessage(failedQuestion, messages.slice(0, -1))}
                    >
                      Coba lagi
                    </button>
                  )}
                </div>
              )}
            </div>
            <form className="chat-composer" onSubmit={(event) => { event.preventDefault(); sendMessage(chatInput); }}>
              <textarea
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form.requestSubmit();
                  }
                }}
                placeholder="Tulis pesan..."
                aria-label="Pesan untuk chatbot"
                rows={1}
              />
              <button type="submit" aria-label="Kirim pesan" disabled={!chatInput.trim() || chatLoading}>Send</button>
            </form>
            <p className="chat-disclaimer">Jawaban AI dapat kurang akurat. Gunakan informasi portofolio sebagai acuan.</p>
          </section>
        </div>
      )}
    </main>
  );
};

export default Public;
