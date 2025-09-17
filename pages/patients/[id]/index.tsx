import { useRouter } from 'next/router';
import PatientDetails from "@pages/PatientDetails";

export default function PatientDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  
  if (!id || typeof id !== 'string') {
    return <div>Loading...</div>;
  }
  
  return <PatientDetails />;
}