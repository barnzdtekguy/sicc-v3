import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AttendanceForm() {
  const [programmes, setProgrammes] = useState([]);
  const [programmeId, setProgrammeId] = useState("");
  const [memberQuery, setMemberQuery] = useState("");
  const [member, setMember] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        const res = await axios.get("/api/programmes");
        setProgrammes(res.data || []);
      } catch (err) {
        console.error("Failed to load programmes", err);
      }
    };

    fetchProgrammes();
  }, []);

  const searchMember = async () => {
    if (!memberQuery.trim()) return;

    setLoading(true);
    try {
      const res = await axios.get(`/api/members/search?q=${memberQuery}`);

      if (res.data) {
        setMember(res.data);
        setNotFound(false);
      } else {
        setMember(null);
        setNotFound(true);
      }
    } catch (err) {
      console.error(err);
      setMember(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (status) => {
    if (!programmeId || !member) return;

    try {
      await axios.post("/api/attendance", {
        programmeId,
        memberId: member.id,
        status
      });

      alert("Attendance recorded successfully");

      setMember(null);
      setMemberQuery("");
    } catch (err) {
      console.error("Error saving attendance", err);
      alert("Failed to record attendance");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      <h2>Programme Attendance</h2>

      {/* Programme Dropdown */}
      <label>Programme</label>
      <select
        value={programmeId}
        onChange={(e) => setProgrammeId(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 15 }}
      >
        <option value="">Select Programme</option>
        {programmes.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Member Search */}
      <label>Member</label>
      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={memberQuery}
          onChange={(e) => setMemberQuery(e.target.value)}
          placeholder="Search member..."
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={searchMember} style={{ padding: "8px 12px" }}>
          Search
        </button>
      </div>

      {loading && <p>Searching...</p>}

      {/* Member Found */}
      {member && (
        <div style={{ marginTop: 20, padding: 10, border: "1px solid #ccc" }}>
          <h4>{member.name}</h4>
          <p>{member.phone || "No phone"}</p>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => markAttendance("present")}>
              Mark Present
            </button>
            <button onClick={() => markAttendance("absent")}>
              Mark Absent
            </button>
          </div>
        </div>
      )}

      {/* Member Not Found */}
      {notFound && (
        <div style={{ marginTop: 20, color: "red" }}>
          <p>Member not found</p>
          <button
            onClick={() => alert("Redirect to register member form")}
          >
            Register Member
          </button>
        </div>
      )}
    </div>
  );
}
