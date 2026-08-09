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
        "Hi! I'm Ishwari's AI portfolio assistant. Ask me about her skills, projects, experience, GitHub, LinkedIn, resume, or upload a job description to check her fit."
    }
  ]);

  const [input, setInput] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [jobFile, setJobFile] =
    useState(null);


  async function sendMessage() {

    if (!input.trim() || loading) {
      return;
    }

    const userMessage = {
      role: "user",
      content: input
    };

    setMessages(
      previous => [
        ...previous,
        userMessage
      ]
    );

    setInput("");
    setLoading(true);

    try {

      const response = await fetch(
        `${API_URL}/api/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            message: input,

            history: messages
          })
        }
      );

      const data =
        await response.json();

      setMessages(
        previous => [
          ...previous,
          {
            role: "assistant",
            content: data.answer
          }
        ]
      );

    } catch (error) {

      setMessages(
        previous => [
          ...previous,
          {
            role: "assistant",
            content:
              "Sorry, I couldn't connect to the backend."
          }
        ]
      );

    } finally {

      setLoading(false);
    }
  }


  async function analyzeJob() {

    if (!jobFile) {
      return;
    }

    setLoading(true);

    setMessages(
      previous => [
        ...previous,
        {
          role: "user",
          content:
            `Analyze this job description: ${jobFile.name}`
        }
      ]
    );

    const formData =
      new FormData();

    formData.append(
      "file",
      jobFile
    );

    try {

      const response =
        await fetch(
          `${API_URL}/api/analyze-job`,
          {
            method: "POST",
            body: formData
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Analysis failed"
        );
      }

      const match =
        data.match;

      const result = `
## Job Fit Analysis

**Score:** ${match.score}%

**Verdict:** ${match.verdict}

### Matched Skills

${
  match.matched_skills.length
    ? match.matched_skills
        .map(skill => `✓ ${skill}`)
        .join("\n")
    : "None"
}

### Missing Required Skills

${
  match.missing_required_skills.length
    ? match.missing_required_skills
        .map(skill => `✗ ${skill}`)
        .join("\n")
    : "None"
}

### Missing Preferred Skills

${
  match.missing_preferred_skills.length
    ? match.missing_preferred_skills
        .map(skill => `- ${skill}`)
        .join("\n")
    : "None"
}

### Experience

${
  match.experience_match
    ? "✓ Requirement satisfied"
    : "✗ Requirement not satisfied"
}

### Education

${
  match.education_match
    ? "✓ Requirement satisfied"
    : "✗ Requirement may not be satisfied"
}

### Explanation

${match.explanation}
`;

      setMessages(
        previous => [
          ...previous,
          {
            role: "assistant",
            content: result
          }
        ]
      );

    } catch (error) {

      setMessages(
        previous => [
          ...previous,
          {
            role: "assistant",
            content:
              `Error: ${error.message}`
          }
        ]
      );

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


  return (

    <div className="app">

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">
            I
          </div>

          <div>
            <strong>
              Ishwari AI
            </strong>

            <span>
              Portfolio Assistant
            </span>
          </div>
        </div>


        <button
          className="new-chat"
          onClick={() =>
            setMessages([
              {
                role: "assistant",
                content:
                  "How can I help you learn about Ishwari?"
              }
            ])
          }
        >
          + New chat
        </button>


        <div className="sidebar-section">

          <p>QUICK ACTIONS</p>

          <button
            onClick={() =>
              setInput(
                "Tell me about Ishwari's technical skills."
              )
            }
          >
            💻 Skills
          </button>

          <button
            onClick={() =>
              setInput(
                "Tell me about Ishwari's projects."
              )
            }
          >
            🚀 Projects
          </button>

          <button
            onClick={() =>
              setInput(
                "Give me Ishwari's LinkedIn profile."
              )
            }
          >
            🔗 LinkedIn
          </button>

          <button
            onClick={() =>
              setInput(
                "Give me Ishwari's GitHub profile."
              )
            }
          >
            🐙 GitHub
          </button>

          <button
            onClick={downloadResume}
          >
            📄 Download Resume
          </button>

        </div>

      </aside>


      <main className="main">

        <header className="topbar">

          <div>
            <strong>
              AI Portfolio Assistant
            </strong>

            <span>
              Ask anything about my professional profile
            </span>
          </div>

          <div className="status">
            <span></span>
            Online
          </div>

        </header>


        <section className="chat">

          <div className="messages">

            {messages.map(
              (message, index) => (

                <div
                  key={index}
                  className={
                    message.role === "user"
                      ? "message user-message"
                      : "message assistant-message"
                  }
                >

                  <div className="avatar">

                    {message.role === "user"
                      ? "You"
                      : "AI"}

                  </div>

                  <div className="bubble">

                    {message.content
                      .split("\n")
                      .map(
                        (line, i) => (
                          <div key={i}>
                            {line}
                          </div>
                        )
                      )}

                  </div>

                </div>

              )
            )}

            {loading && (

              <div className="message assistant-message">

                <div className="avatar">
                  AI
                </div>

                <div className="bubble">
                  Thinking...
                </div>

              </div>

            )}

          </div>


          <div className="composer-area">

            {jobFile && (

              <div className="file-preview">

                📎 {jobFile.name}

                <button
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
                  Analyze Job
                </button>

              </div>

            )}


            <div className="composer">

              <label className="upload">

                +

                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  hidden
                  onChange={
                    event =>
                      setJobFile(
                        event.target.files[0]
                      )
                  }
                />

              </label>


              <input
                value={input}
                onChange={
                  event =>
                    setInput(
                      event.target.value
                    )
                }

                onKeyDown={
                  event => {

                    if (
                      event.key === "Enter"
                    ) {
                      sendMessage();
                    }

                  }
                }

                placeholder="Ask about Ishwari..."
              />


              <button
                className="send"
                onClick={sendMessage}
              >
                ↑
              </button>

            </div>


            <p className="disclaimer">
              AI answers are based on verified
              portfolio information. No qualifications
              are intentionally invented.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}


export default App;