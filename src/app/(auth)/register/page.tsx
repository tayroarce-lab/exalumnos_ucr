import Register from '@/components/register';
import AuthBackground from '@/components/ui/AuthBackground';

export default function RegisterPage() {
  return (
    <div className="register-page-wrapper bg-gray-50">
      <AuthBackground />
      <Register />
    </div>
  );
}
