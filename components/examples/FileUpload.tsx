import { FileUpload } from '../FileUpload';

export default function FileUploadExample() {
  return (
    <FileUpload 
      onUpload={(files) => console.log('Files uploaded:', files)}
    />
  );
}