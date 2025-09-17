import { BillingForm } from '../BillingForm';

export default function BillingFormExample() {
  return (
    <BillingForm 
      onSubmit={(data) => console.log('Bill generated:', data)}
    />
  );
}