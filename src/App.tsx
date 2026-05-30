import { useState, useEffect } from "react";

// Utility to get query param
function getQueryParam(name: string) {
  return new URLSearchParams(window.location.search).get(name);
}
import homepagePic from "../images/homepage_pic.jpeg";
import "./App.css";

interface Task {
  id: string;
  label: string;
  // Optional: short instruction shown in a tooltip or future modal
  instruction?: string;
}

const TASKS: Task[] = [
  {
    id: "connect-x",
    label: "CONNECT X ACCOUNT",
    instruction: "Connect your X (Twitter) account to verify your tasks.",
  },
  {
    id: "follow",
    label: "FOLLOW VyrusNfts",
    instruction: "Follow the account mentioned in the pinned post on X.",
  },
  {
    id: "qt",
    label: "QT PINNED POST with 'BULLISH' ",
    instruction:
      "Quote tweet the pinned post on X. Make sure your tweet is public.",
  },
  {
    id: "like",
    label: "LIKE PINNED POST",
    instruction: "Simply like the pinned post on the official Vyrus account.",
  },
  {
    id: "tag",
    label: "TAG 3 FRIENDS IN PINNED POST",
    instruction: "Tag 3 friends in the comments of the pinned post on X.",
  },
  {
    id: "wallet",
    label: "SUBMIT YOUR ETH WALLET",
    instruction:
      "Click the big wallet button below this list. the Backend would handles verification.",
  },
];

function App() {
  // these completed tasks are stored in localStorage for now.
  // Easy to swap later - just replace this state + the two functions below.

  const [completedTasks, setCompletedTasks] = useState<string[]>(() => {
    const saved = localStorage.getItem("vyrus-completed-tasks");
    return saved ? JSON.parse(saved) : [];
  });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [walletInput, setWalletInput] = useState("");
  const [walletStatus, setWalletStatus] = useState<string | null>(null);


  // Save completed tasks to localStorage
  useEffect(() => {
    localStorage.setItem(
      "vyrus-completed-tasks",
      JSON.stringify(completedTasks),
    );
  }, [completedTasks]);

  // On mount, check for X OAuth callback and fetch user info
  useEffect(() => {
    const checkAuth = async () => {
      // If redirected from backend after X OAuth
      if (getQueryParam("auth") === "success") {
        // Fetch user info from backend
        try {
          const res = await fetch("http://localhost:5000/user/me", {
            credentials: "include",
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            // Mark X connect as done
            if (!completedTasks.includes("connect-x")) {
              setCompletedTasks((prev) => [...prev, "connect-x"]);
            }
          }
        } catch {}
      } else {
        // Try to fetch user info if already logged in
        try {
          const res = await fetch("http://localhost:5000/user/me", {
            credentials: "include",
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            if (!completedTasks.includes("connect-x")) {
              setCompletedTasks((prev) => [...prev, "connect-x"]);
            }
          }
        } catch {}
      }
    };
    checkAuth();
    // eslint-disable-next-line
  }, []);

  // this one would mark a task as done (easy hook point for you to do backend later sha)
  const markTaskComplete = (taskId: string) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks([...completedTasks, taskId]);
    }
  };


  // these ones dey checks if all tasks are completely done
  const allTasksDone = TASKS.every((t) => completedTasks.includes(t.id));

  // Real verification for X tasks
  const verifyTask = async (taskId: string) => {
    let url = "";
    if (taskId === "follow") url = "http://localhost:5000/user/verify/follow";
    else if (taskId === "like") url = "http://localhost:5000/user/verify/like";
    else if (taskId === "qt") url = "http://localhost:5000/user/verify/quote";
    else if (taskId === "tag") url = "http://localhost:5000/user/verify/tag";
    else return false;
    try {
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (taskId === "follow" && data.following) return true;
      if (taskId === "like" && data.liked) return true;
      if (taskId === "qt" && data.quoted) return true;
      if (taskId === "tag" && data.tagged) return true;
      return false;
    } catch {
      return false;
    }
  };

  // Wallet submission handler
  const handleWalletClick = () => {
    setShowWalletModal(true);
    setWalletStatus(null);
    setWalletInput(user?.wallet || "");
  };

  // Submit wallet to backend
  const submitWallet = async () => {
    setWalletStatus(null);
    try {
      const res = await fetch("http://localhost:5000/user/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ wallet: walletInput }),
      });
      if (res.ok) {
        setCompletedTasks((prev) => [...prev, "wallet"]);
        setWalletStatus("Wallet submitted successfully!");
        setShowWalletModal(false);
      } else {
        setWalletStatus("Failed to submit wallet.");
      }
    } catch {
      setWalletStatus("Failed to submit wallet.");
    }
  };

  return (
    <div className="vyrus-app">
      {/* Top Navigation */}
      <nav className="nav">
        <div className="logo">VYRUS</div>
        <div className="nav-links">
          {/* <a href="#gallery">GALLERY</a> */}
          <a href="#tasks" onClick={e => { e.preventDefault(); document.getElementById("tasks")?.scrollIntoView({ behavior: "smooth" }); }}>APPLY WL</a>
          <a href="#role">CHECK ROLE</a>
          {/* <a href="#tba">TBA</a> */}
        </div>
      </nav>

      {/* hero section with character */}
      <section className="hero">

        <div className="hero-content">
          <h1>
            THE VYRUS
            <br />
            APPEARED.
          </h1>
          <p>
            474 low poly corrupted JPEGs.
            <br />
            Complete tasks. Earn your spot on the allowlist.
          </p>
          <button
            className="cta-primary"
            onClick={() =>
              document
                .getElementById("tasks")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            START TASKS
          </button>
        </div>

        <div className="hero-visual">
          {/* had to use page2 character here for now, pending the time maybe when the original assets arrive */}
          <img
            src={homepagePic}
            alt="Vyrus homepage"
            style={{ maxHeight: 420, borderRadius: 16 }}
          />
        </div>
      </section>

      {/* pill navigation - for mockup sideway animation */}
      <div className="pill-nav">
        {/* <div className="pill active">GALLERY</div> */}
        <div className="pill">APPLY WL</div>
        <div className="pill">CHECK ROLE</div>
        {/* <div className="pill">TBA</div> */}
      </div>

      {/* glowing silhouette grid - from pt_1.PNG */}
      <section className="grid-section">
        <div className="grid-title">ALLOWLIST SPOTS - 6 CONFIRMED</div>
        <div className="silhouette-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`silhouette ${i < 3 ? "filled" : ""}`} />
          ))}
        </div>
      </section>

      {/* tasks */}
      <section id="tasks" className="tasks-section">
        <div className="task-card">
          <h3>TASKS</h3>

          <div className="task-list">
            {TASKS.map((task) => {
              const isDone = completedTasks.includes(task.id);
              // Special logic for CONNECT X ACCOUNT
              if (task.id === "connect-x") {
                return (
                  <div
                    key={task.id}
                    className={`task-item ${isDone ? "completed" : ""}`}
                  >
                    <span className="task-label">{task.label}</span>
                    {isDone ? (
                      <span className="task-done">DONE</span>
                    ) : (
                      <button
                        className="task-btn"
                        onClick={() => {
                          window.location.href = "http://localhost:5000/auth/twitter";
                        }}
                      >
                        CONNECT X
                      </button>
                    )}
                    {user && (
                      <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>
                        Connected as: <b>@{user.username}</b>
                      </div>
                    )}
                  </div>
                );
              }
              // All other tasks
              // Real verification for X tasks
              const handleVerify = async () => {
                if (isDone) return;
                // Show loading state if needed
                const ok = await verifyTask(task.id);
                if (ok) setCompletedTasks((prev) => [...prev, task.id]);
                else alert("Verification failed. Please complete the task on X and try again.");
              };
              return (
                <div
                  key={task.id}
                  className={`task-item ${isDone ? "completed" : ""}`}
                >
                  <span className="task-label">{task.label}</span>
                  {isDone ? (
                    <span className="task-done">DONE</span>
                  ) : (
                    ["follow", "like", "qt", "tag"].includes(task.id) ? (
                      <button className="task-btn" onClick={handleVerify}>
                        VERIFY
                      </button>
                    ) : (
                      <button className="task-btn" onClick={() => markTaskComplete(task.id)}>
                        MARK DONE
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* wallet submition CTA */}
      <section className="wallet-section">
        <button
          className="wallet-btn"
          onClick={handleWalletClick}
          disabled={completedTasks.includes("wallet")}
        >
          {completedTasks.includes("wallet")
            ? "WALLET SUBMITTED"
            : "SUBMIT YOUR ETH WALLET"}
        </button>
        <p style={{ marginTop: 12, fontSize: 13, color: "#555" }}>ggs!</p>
      </section>

      {/* Status */}
      <div className="status-bar">
        {allTasksDone
          ? "You've completed all tasks. Your allowlist status will be verified."
          : `${completedTasks.length} / ${TASKS.length} tasks completed`}
      </div>

      {/* i used a wallet placeholder modal (abeg bro, this should be easy to replace later sha) */}
      {showWalletModal && (
        <div className="modal" onClick={() => setShowWalletModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Wallet Submission</h3>
            {user ? (
              <>
                <input
                  type="text"
                  placeholder="Enter your ETH wallet address"
                  value={walletInput}
                  onChange={e => setWalletInput(e.target.value)}
                  style={{ width: "100%", marginBottom: 12, padding: 8 }}
                  disabled={completedTasks.includes("wallet")}
                />
                <button
                  className="cta-primary"
                  onClick={submitWallet}
                  disabled={completedTasks.includes("wallet") || !walletInput}
                >
                  Submit Wallet
                </button>
                {walletStatus && <div style={{ color: walletStatus.includes("success") ? "green" : "red", marginTop: 8 }}>{walletStatus}</div>}
              </>
            ) : (
              <div style={{ color: "#c00" }}>You must connect your X account first.</div>
            )}
            <button
              onClick={() => setShowWalletModal(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#888",
                marginLeft: 16,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
