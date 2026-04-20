// frontend\src\components\admin\AdminLogin.tsx
// frontend/src/components/admin/AdminLogin.tsx
import { FC, useState } from 'react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin@upou.edu.ph');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin@upou.edu.ph' && password === 'admin123') {
      onLoginSuccess();
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center h-full animate-fade-in">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#7b1113]">UPOU Helpdesk</h2>
          <p className="text-gray-500 text-sm mt-1">Authorized IT Personnel Only</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg text-center">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b1113] outline-none transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b1113] outline-none transition-all" required />
          </div>
          <button type="submit" className="w-full py-3 px-4 bg-[#7b1113] hover:bg-[#5a0d0e] text-white font-bold rounded-xl shadow-md transition-colors mt-4">Secure Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;