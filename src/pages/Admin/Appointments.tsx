import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

type Service = {
  id: number;
  name: string;
  duration_minutes: number;
  price: number;
};

type Appointment = {
  id: number;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
  service: Service | null;
};


export default function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const loadAppointments = async () => {
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        start_time,
        end_time,
        status,
        created_at,
        service:services(*) 
      `)
      .order("start_time", { ascending: true });

    if (error) {
      setErrorMsg(error.message);
      setAppointments([]);
    } else if (data) {
      // Supabase returns related rows as arrays for foreign table refs (service: services(*)).
      // Convert service arrays to single service objects (or null) to match Appointment type.
      const mapped: Appointment[] = (data as any[]).map((d) => ({
        id: d.id,
        start_time: d.start_time,
        end_time: d.end_time,
        status: d.status,
        created_at: d.created_at,
        service: Array.isArray(d.service) ? (d.service[0] ?? null) : d.service ?? null,
      }));

      setAppointments(mapped);
    }

    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h1>Admin: Appointments</h1>
          <div style={{ color: "#555" }}>
            View all appointments booked by clients.
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {errorMsg && <div style={{ color: "crimson", marginTop: 12 }}>{errorMsg}</div>}

      {appointments.length === 0 ? (
        <div style={{ marginTop: 24 }}>No appointments found.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>ID</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Service</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Start Time</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>End Time</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Status</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Created At</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id}>
                <td style={{ padding: "8px 0" }}>{appt.id}</td>
                <td style={{ padding: "8px 0" }}>{appt.service?.name || "N/A"}</td>
                <td style={{ padding: "8px 0" }}>{new Date(appt.start_time).toLocaleString()}</td>
                <td style={{ padding: "8px 0" }}>{new Date(appt.end_time).toLocaleString()}</td>
                <td style={{ padding: "8px 0" }}>{appt.status}</td>
                <td style={{ padding: "8px 0" }}>{new Date(appt.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}