import { PrescriptionForm } from '../PrescriptionForm';

export default function PrescriptionFormExample() {
  return (
    <PrescriptionForm 
      onSubmit={(data) => console.log('Prescription created:', data)}
    />
  );
}