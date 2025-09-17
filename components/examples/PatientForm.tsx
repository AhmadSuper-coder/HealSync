import { PatientForm } from '../PatientForm';

export default function PatientFormExample() {
  return (
    <PatientForm 
      onSubmit={(data) => console.log('Patient form submitted:', data)}
    />
  );
}