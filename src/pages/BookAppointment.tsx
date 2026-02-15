import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import dayjs from 'dayjs';

type Service = { id: number; name: string; duration: number; price: number };

export default function BookAppointment() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [dateTime, setDateTime] = useState('');

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*');
    if (data) setServices(data);
  };

  const bookAppointment = async () => {
    if (!selectedService || !dateTime) return alert('Select service and time');
    const user = supabase.auth.getUser(); // get logged-in user
    const { error } = await supabase.from('appointments').insert({
      user_id: (await user).data.user?.id,
      service_id: selectedService,
      start_time: dayjs(dateTime).toISOString(),
      end_time: dayjs(dateTime).add(30, 'minute').toISOString(),
      status: 'PENDING'
    });
    if (error) alert(error.message);
    else alert('Appointment booked!');
  };

  useEffect(() => { fetchServices(); }, []);

  return (
    <div>
      <h1>Book Appointment</h1>
      <select onChange={e => setSelectedService(+e.target.value)}>
        <option value="">Select Service</option>
        {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} />
      <button onClick={bookAppointment}>Book</button>
    </div>
  );
}
