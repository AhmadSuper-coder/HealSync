import { AppointmentScheduler } from '../AppointmentScheduler';

export default function AppointmentSchedulerExample() {
  return (
    <AppointmentScheduler 
      onSubmit={(data) => console.log('Appointment scheduled:', data)}
    />
  );
}