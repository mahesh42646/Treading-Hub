import Login from '../user/auth/Login';
import RouteGuard from '../components/RouteGuard';

export default function LoginPage() {
  return (
    <RouteGuard requireAuth={false}>
      <Login />
    </RouteGuard>
  );
} 