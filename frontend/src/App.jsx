import React, { useState } from 'react'

const App = () => {

  const [resumeMode, setResumeMode] = useState("text")
  const [resumeFile, setResumeFile] = useState([])
  const [resumeText, setResumeText] = useState("")
  const [jdText, setJdText] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyzeResume = async () => {
    if (!jdText) {
      setError("Job description is required.")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      let response

      if (resumeMode === "file" && resumeFile.length > 1) {
        const formData = new FormData()
        resumeFile.forEach((file) => formData.append("resumes", file))
        formData.append("jd_text", jdText)

        response = await fetch("http://localhost:8000/rank", {
          method: "POST",
          body: formData
        })
      }

      else if (resumeMode === "text") {
        response = await fetch("http://localhost:8000/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resume_text: resumeText,
            jd_text: jdText
          })
        })
      }

      else {
        const formData = new FormData()
        formData.append("resume", resumeFile[0])
        formData.append("jd_text", jdText)

        response = await fetch("http://localhost:8000/analyzepdf", {
          method: "POST",
          body: formData
        })
      }

      if (!response.ok) {
        throw new Error("Backend error")
      }

      const data = await response.json()
      setResult(data)

    } catch (err) {
      setError("Failed to analyze resume.")
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className='min-h-screen bg-gray-100 px-6 py-10'>
      <div className='max-w-4xl mx-auto bg-white p-8 rounded-lg shadow'>
        <h1 className='text-2xl font-semibold mb-6'>
          Resume-JD Matching System
        </h1>

        <div className='space-y-6'>
          <div>
            <label className='block text-sm font-medium mb-2'>
              Resume Input
            </label>

            <div className='flex gap-4 mb-3'>
              <button
                className={`px-3 py-1 w-1/2 rounded ${resumeMode === "text" ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                onClick={() => setResumeMode("text")}
              >
                Paste Text
              </button>

              <button
                className={`px-3 py-1 w-1/2 rounded ${resumeMode === "file"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
                  }`}
                onClick={() => setResumeMode("file")}
              >
                Upload PDF
              </button>
            </div>
            {
              resumeMode === "text" ? (
                <textarea
                  rows="7"
                  className='w-full border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Paste resume text here'
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              ) : (
                <input
                  type='file'
                  accept='.pdf'
                  multiple
                  className='block w-full text-sm'
                  onChange={(e) => setResumeFile(Array.from(e.target.files))}
                />
              )
            }
          </div>

          <label className='block text-sm font-medium mb-2'>
            Job Description
          </label>
          <textarea
            rows="7"
            className='w-full border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Paste job description here'
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />
        </div>

        <div className='mt-6'>
          <button
            onClick={analyzeResume}
            className='w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400'
            disabled={loading}
          >
            {loading ? "Analyzing...." : "Analyze"}
          </button>
        </div>

        <div className='mt-8'>
          {error && (
            <p className="text-red-600 text-sm mb-4">{error}</p>
          )}

          {result && !Array.isArray(result) && (
            <div className="border-t mt-6 pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Result</h3>

              <p>
                <span className="font-medium">Match Score:</span> {result.score}
              </p>

              <p>
                <span className="font-medium">Matched Skills:</span>{" "}
                {result.matched_skills.join(", ") || "None"}
              </p>

              <p>
                <span className="font-medium">Missing Skills:</span>{" "}
                {result.missing_skills.join(", ") || "None"}
              </p>
            </div>
          )}

          {Array.isArray(result) && (
            <div className="border-t mt-6 pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Ranked Resumes</h3>

              {result.map((res, index) => (
                <div key={index} className="border p-4 rounded-md">
                  <p className="font-medium">
                    #{index + 1} — {res.resume_name}
                  </p>
                  <p>Score: {res.score}</p>
                  <p>Matched: {res.matched_skills.join(", ") || "None"}</p>
                  <p className="text-red-600">
                    Missing: {res.missing_skills.join(", ") || "None"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
