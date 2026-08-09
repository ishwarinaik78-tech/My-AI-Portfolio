import { useState } from "react";
import "./style.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm Ishwari's AI portfolio assistant. Ask me about her skills, projects, experience, GitHub, LinkedIn, resume, or upload a job description to check her fit.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobFile, setJobFile] = useState(null);

  async function sendMessage(customInput = null) {
    const messageText =
      customInput !== null ? customInput : input;

    if (!messageText.trim() || loading) {
      return;
    }

    const userMessage = {
      role: "user",
      content: messageText,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: messageText,
            history: messages,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Request failed"
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't connect to the backend. Please make sure your FastAPI server is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function analyzeJob() {
    if (!jobFile || loading) {
      return;
    }

    setLoading(true);

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content:
          `Analyze this job description: ${jobFile.name}`,
      },
    ]);

    const formData = new FormData();

    formData.append("file", jobFile);

    try {
      const response = await fetch(
        `${API_URL}/api/analyze-job`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Analysis failed"
        );
      }

      const match = data.match;

      const result = `
JOB FIT ANALYSIS

Score: ${match.score}%

Verdict: ${match.verdict}

MATCHED SKILLS

${
  match.matched_skills.length
    ? match.matched_skills
        .map((skill) => `✓ ${skill}`)
        .join("\n")
    : "None"
}

MISSING REQUIRED SKILLS

${
  match.missing_required_skills.length
    ? match.missing_required_skills
        .map((skill) => `✗ ${skill}`)
        .join("\n")
    : "None"
}

MISSING PREFERRED SKILLS

${
  match.missing_preferred_skills.length
    ? match.missing_preferred_skills
        .map((skill) => `• ${skill}`)
        .join("\n")
    : "None"
}

EXPERIENCE

${
  match.experience_match
    ? "✓ Requirement satisfied"
    : "✗ Requirement not satisfied"
}

EDUCATION

${
  match.education_match
    ? "✓ Requirement satisfied"
    : "✗ Requirement may not be satisfied"
}

EXPLANATION

${match.explanation}
`;

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: result,
        },
      ]);

      setJobFile(null);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            `Error: ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function downloadResume() {
    window.open(
      `${API_URL}/api/resume`,
      "_blank"
    );
  }

  function newChat() {
    setMessages([
      {
        role: "assistant",
        content:
          "How can I help you learn about Ishwari?",
      },
    ]);

    setInput("");
    setJobFile(null);
  }

  const quickActions = [
    {
      icon: "⌘",
      title: "Skills",
      text:
        "Tell me about Ishwari's technical skills.",
    },
    {
      icon: "✦",
      title: "Projects",
      text:
        "Tell me about Ishwari's projects.",
    },
    {
      icon: "in",
      title: "LinkedIn",
      text:
        "Give me Ishwari's LinkedIn profile.",
    },
    {
      icon: "◈",
      title: "GitHub",
      text:
        "Give me Ishwari's GitHub profile.",
    },
  ];

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div>

          <div className="brand">

            <div className="brand-icon">
              I
            </div>

            <div className="brand-info">
              <strong>Ishwari AI</strong>
              <span>Personal Portfolio</span>
            </div>

          </div>


          <button
            className="new-chat"
            onClick={newChat}
          >
            <span>＋</span>
            New conversation
          </button>


          <div className="sidebar-heading">
            EXPLORE
          </div>


          <div className="quick-actions">

            {quickActions.map(
              (action, index) => (
                <button
                  key={index}
                  onClick={() =>
                    sendMessage(action.text)
                  }
                >

                  <span className="quick-icon">
                    {action.icon}
                  </span>

                  <span className="quick-text">
                    {action.title}
                  </span>

                  <span className="quick-arrow">
                    →
                  </span>

                </button>
              )
            )}

          </div>

        </div>


        <div className="sidebar-bottom">

          <div className="truth-card">

            <div className="truth-icon">
              ✓
            </div>

            <div>
              <strong>
                Truth-first AI
              </strong>

              <span>
                No invented qualifications.
              </span>
            </div>

          </div>


          <button
            className="resume-button"
            onClick={downloadResume}
          >
            <span>↓</span>
            Download Resume
          </button>

        </div>

      </aside>


      {/* MAIN */}

      <main className="main">

        <header className="topbar">

          <div className="mobile-brand">

            <div className="mobile-logo">
              I
            </div>

            <strong>
              Ishwari AI
            </strong>

          </div>


          <div className="topbar-title">

            <strong>
              AI Portfolio Assistant
            </strong>

            <span>
              Ask anything about my professional profile
            </span>

          </div>


          <div className="status">

            <span className="status-dot"></span>

            Online

          </div>

        </header>


        <section className="chat">

          <div className="messages">

            {messages.length === 1 &&
            messages[0].role === "assistant" ? (

              <div className="welcome">

                <div className="glow-orb">

                  <div className="orb-ring"></div>

                  <div className="orb-center">
                    I
                  </div>

                </div>


                <div className="eyebrow">
                  AI-POWERED PORTFOLIO
                </div>


                <h1>
                  Meet Ishwari,
                  <br />
                  <span>through AI.</span>
                </h1>


                <p className="welcome-text">
                  Explore my skills, projects and
                  experience through a conversational
                  portfolio. You can even upload a job
                  description and check my actual fit.
                </p>


                <div className="welcome-actions">

                  {quickActions.map(
                    (action, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          sendMessage(
                            action.text
                          )
                        }
                      >

                        <span>
                          {action.icon}
                        </span>

                        <div>
                          <strong>
                            {action.title}
                          </strong>

                          <small>
                            Ask about my{" "}
                            {action.title.toLowerCase()}
                          </small>
                        </div>

                        <b>→</b>

                      </button>
                    )
                  )}

                </div>


                <div className="hire-card">

                  <div className="hire-symbol">
                    ↑
                  </div>

                  <div>
                    <strong>
                      Hiring for a role?
                    </strong>

                    <span>
                      Upload a job description below
                      and get an honest compatibility
                      analysis.
                    </span>
                  </div>

                </div>

              </div>

            ) : (

              messages.map(
                (message, index) => (

                  <div
                    key={index}
                    className={
                      message.role === "user"
                        ? "message user-message"
                        : "message assistant-message"
                    }
                  >

                    <div
                      className={
                        message.role === "user"
                          ? "avatar user-avatar"
                          : "avatar ai-avatar"
                      }
                    >
                      {message.role === "user"
                        ? "You"
                        : "I"}
                    </div>


                    <div className="message-body">

                      <div className="message-label">
                        {message.role === "user"
                          ? "You"
                          : "Ishwari AI"}
                      </div>


                      <div className="bubble">

                        {message.content
                          .split("\n")
                          .map(
                            (line, i) => (
                              <div
                                key={i}
                                className={
                                  line === ""
                                    ? "blank-line"
                                    : ""
                                }
                              >
                                {line}
                              </div>
                            )
                          )}

                      </div>

                    </div>

                  </div>

                )
              )

            )}


            {loading && (

              <div className="message assistant-message">

                <div className="avatar ai-avatar">
                  I
                </div>

                <div className="message-body">

                  <div className="message-label">
                    Ishwari AI
                  </div>

                  <div className="bubble thinking">

                    <span></span>
                    <span></span>
                    <span></span>

                  </div>

                </div>

              </div>

            )}

          </div>


          {/* COMPOSER */}

          <div className="composer-area">

            {jobFile && (

              <div className="file-preview">

                <div className="file-left">

                  <div className="file-icon">
                    PDF
                  </div>

                  <div>

                    <strong>
                      {jobFile.name}
                    </strong>

                    <span>
                      Ready to analyze
                    </span>

                  </div>

                </div>


                <div className="file-actions">

                  <button
                    className="remove-file"
                    onClick={() =>
                      setJobFile(null)
                    }
                  >
                    ×
                  </button>

                  <button
                    className="analyze"
                    onClick={analyzeJob}
                  >
                    Analyze Job →
                  </button>

                </div>

              </div>

            )}


            <div className="composer">

              <label className="upload">

                <span>＋</span>

                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  hidden
                  onChange={(event) =>
                    setJobFile(
                      event.target.files[0]
                    )
                  }
                />

              </label>


              <input
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={(event) => {

                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    sendMessage();
                  }

                }}
                placeholder="Ask anything about Ishwari..."
                disabled={loading}
              />


              <button
                className="send"
                onClick={() =>
                  sendMessage()
                }
                disabled={
                  loading ||
                  !input.trim()
                }
              >
                ↑
              </button>

            </div>


            <div className="composer-footer">

              <span>
                AI responses are based on verified
                portfolio information.
              </span>

              <span>
                ✦ Truth-first AI
              </span>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default App;