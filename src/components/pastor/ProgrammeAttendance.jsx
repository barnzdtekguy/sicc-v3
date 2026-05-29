
import React, { useState } from "react";

const sampleMembers = [
  "John Doe",
  "Mary Johnson",
  "Peter Daniel",
  "Grace Samuel",
  "David Paul"
];

export default function ProgrammeAttendance() {
  const [attendance, setAttendance] = useState({});
  const [visitors, setVisitors] = useState(0);
  const [converts, setConverts] = useState(0);

  const toggleAttendance = (name) => {
    setAttendance((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <div
        style={{
          background: "#111827",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px"
        }}
      >
        <h2>32 Days of Greatness</h2>
        <p>Programme Attendance Recording</p>

        <div style={{ display: "flex", gap: "20px", marginTop: "15px" }}>
          <div>
            <strong>Visitors</strong>
            <br />
            <input
              type="number"
              value={visitors}
              onChange={(e) => setVisitors(e.target.value)}
              style={{ padding: "8px", marginTop: "5px" }}
            />
          </div>

          <div>
            <strong>New Converts</strong>
            <br />
            <input
              type="number"
              value={converts}
              onChange={(e) => setConverts(e.target.value)}
              style={{ padding: "8px", marginTop: "5px" }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px"
        }}
      >
        <h3>Member Attendance</h3>

        {sampleMembers.map((member) => (
          <div
            key={member}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid #eee"
            }}
          >
            <span>{member}</span>

            <button
              onClick={() => toggleAttendance(member)}
              style={{
                background: attendance[member] ? "#16a34a" : "#dc2626",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              {attendance[member] ? "Present" : "Absent"}
            </button>
          </div>
        ))}

        <button
          style={{
            marginTop: "20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 18px",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Submit Attendance
        </button>
      </div>
    </div>
  );
}
