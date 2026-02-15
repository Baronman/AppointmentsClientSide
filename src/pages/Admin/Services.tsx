import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

type Service = {
  id: number;
  name: string;
  duration_minutes: number;
  price: number;
  created_at: string;
};

export default function Services() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const [name, setName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [price, setPrice] = useState<number>(25);

  const loadServices = async () => {
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      setErrorMsg(error.message);
      setServices([]);
    } else {
      setServices((data ?? []) as Service[]);
    }

    setLoading(false);
  };

  const addService = async () => {
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Service name is required.");
      return;
    }

    const { error } = await supabase.from("services").insert({
      name: name.trim(),
      duration_minutes: durationMinutes,
      price,
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setName("");
    setDurationMinutes(30);
    setPrice(25);

    loadServices();
  };

  const deleteService = async (id: number) => {
    setErrorMsg("");

    const ok = confirm("Delete this service?");
    if (!ok) return;

    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    loadServices();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  useEffect(() => {
    loadServices();
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h1>Admin: Services</h1>
          <div style={{ color: "#555" }}>
            Create and delete appointment services.
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <h2 style={{ marginTop: 24 }}>Add Service</h2>

      {errorMsg && (
        <div style={{ color: "crimson", marginTop: 12 }}>{errorMsg}</div>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <input
          placeholder="Service name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          min={5}
          step={5}
          placeholder="Duration (minutes)"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(Number(e.target.value))}
        />

        <input
          type="number"
          min={0}
          step={1}
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />

        <button onClick={addService}>Add</button>
      </div>

      <h2 style={{ marginTop: 24 }}>Services List</h2>

      {services.length === 0 ? (
        <div>No services yet.</div>
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
                Name
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                Duration
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                Price
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {services.map((s) => (
              <tr key={s.id}>
                <td style={{ padding: "8px 0" }}>{s.name}</td>
                <td style={{ padding: "8px 0" }}>{s.duration_minutes} min</td>
                <td style={{ padding: "8px 0" }}>${Number(s.price).toFixed(2)}</td>
                <td style={{ padding: "8px 0" }}>
                  <button onClick={() => deleteService(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
