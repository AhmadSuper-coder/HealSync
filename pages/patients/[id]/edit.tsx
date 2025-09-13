import { useRouter } from 'next/router';
import EditPatient from "@/pages/EditPatient";

export default function EditPatientPage() {
  const router = useRouter();
  const { id } = router.query;
  
  if (!id || typeof id !== 'string') {
    return <div>Loading...</div>;
  }
  
  return <EditPatient id={id} />;
}