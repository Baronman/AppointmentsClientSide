import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

type Service = {
  id: number;
  name: string;
  duration_minutes: number;
  price: number;
};

type AppointmentRow = {
  id: number;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
  service: Service | null;
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);

  const loadAppointments = async () => {
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        id,
        start_time,
        end_time,
        status,
        created_at,
        service:services (
          id,
          name,
          duration_minutes,
          price
        )
      `
      )
      .order("start_time", { ascending: true });

    if (error) {
      setErrorMsg(error.message);
      setAppointments([]);
    } else {
      // Supabase returns "any" so we cast it
      setAppointments((data ?? []) as unknown as AppointmentRow[]);
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
          <h1>Dashboard</h1>
          <div style={{ color: "#555" }}>
            View appointments and manage admin pages.
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button onClick={() => navigate("/book")}>Book Appointment</button>
        <button onClick={() => navigate("/admin/services")}>
          Manage Services
        </button>
        <button onClick={() => navigate("/admin/appointments")}>
          Admin Appointments
        </button>
      </div>

      {errorMsg && (
        <div style={{ color: "crimson", marginTop: 16 }}>{errorMsg}</div>
      )}

      <h2 style={{ marginTop: 24 }}>All Appointments</h2>

      {appointments.length === 0 ? (
        <div style={{ marginTop: 12 }}>No appointments found.</div>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 12,
          }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                Service
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                Start
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                End
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                Status
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                Price
              </th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td style={{ padding: "8px 0" }}>
                  {a.service?.name ?? "N/A"}
                </td>
                <td style={{ padding: "8px 0" }}>
                  {new Date(a.start_time).toLocaleString()}
                </td>
                <td style={{ padding: "8px 0" }}>
                  {new Date(a.end_time).toLocaleString()}
                </td>
                <td style={{ padding: "8px 0" }}>{a.status}</td>
                <td style={{ padding: "8px 0" }}>
                  {a.service ? `$${Number(a.service.price).toFixed(2)}` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
