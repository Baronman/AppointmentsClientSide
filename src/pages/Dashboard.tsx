import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

type AppointmentRow = {
  id: number;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
  service: {
    name: string;
    duration_minutes: number;
    price: number;
  }[];
};


export default function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string>("");
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const loadUserAndAppointments = async () => {
    setLoading(true);
    setErrorMsg("");

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      navigate("/login");
      return;
    }

    setEmail(userData.user.email ?? "");

    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        id,
        start_time,
        end_time,
        status,
        created_at,
        service:service_id (
          name,
          duration_minutes,
          price
        )
      `
      )
      .eq("user_id", userData.user.id)
      .order("start_time", { ascending: true });

    if (error) {
      setErrorMsg(error.message);
      setAppointments([]);
    } else {
      setAppointments((data ?? []) as AppointmentRow[]);
    }

    setLoading(false);
  };

  const cancelAppointment = async (id: number) => {
    setErrorMsg("");

    const { error } = await supabase
      .from("appointments")
      .update({ status: "CANCELLED" })
      .eq("id", id);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    loadUserAndAppointments();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  useEffect(() => {
    loadUserAndAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h1>Dashboard</h1>
          <div>Logged in as: {email}</div>
        </div>

         <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <button onClick={() => navigate("/book")}>Book Appointment</button>
        <button onClick={() => navigate("/admin/services")}>Manage Services</button>
        <button onClick={() => navigate("/admin/appointments")}>View Appointments (Admin)</button>
      </div>
      </div>

      <h2 style={{ marginTop: 24 }}>My Appointments</h2>

      {errorMsg && (
        <div style={{ color: "crimson", marginBottom: 12 }}>{errorMsg}</div>
      )}

      {appointments.length === 0 ? (
        <div>No appointments yet.</div>
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
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td style={{ padding: "8px 0" }}>
                  {a.service?.[0]?.name ?? "Unknown"}

                </td>
                <td style={{ padding: "8px 0" }}>
                  {new Date(a.start_time).toLocaleString()}
                </td>
                <td style={{ padding: "8px 0" }}>
                  {new Date(a.end_time).toLocaleString()}
                </td>
                <td style={{ padding: "8px 0" }}>{a.status}</td>
                <td style={{ padding: "8px 0" }}>
                  {a.status !== "CANCELLED" && (
                    <button onClick={() => cancelAppointment(a.id)}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
