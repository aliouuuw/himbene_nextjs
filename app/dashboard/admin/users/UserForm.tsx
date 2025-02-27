'use client';

import { useState } from 'react';
import { UserRole } from '@prisma/client';
import { createUser } from '@/app/actions/admin-actions';

export default function UserForm() {
  const [formData, setFormData] = useState({
    email: '',
    role: 'COMMERCIAL' as UserRole,
    firstName: '',
    lastName: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await createUser(formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'User created successfully' });
        // Reset form
        setFormData({
          email: '',
          role: 'COMMERCIAL',
          firstName: '',
          lastName: ''
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to create user' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to create user: ' + error });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {message && (
        <div className={`p-4 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div>
        <label className="block mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={e => setFormData({...formData, email: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <div>
        <label className="block mb-1">Role</label>
        <select
          value={formData.role}
          onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
          className="w-full p-2 border rounded"
          required
        >
          <option value="COMMERCIAL">Commercial</option>
          <option value="INFOGRAPHE">Infographe</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      
      <div>
        <label className="block mb-1">First Name</label>
        <input
          type="text"
          value={formData.firstName}
          onChange={e => setFormData({...formData, firstName: e.target.value})}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div>
        <label className="block mb-1">Last Name</label>
        <input
          type="text"
          value={formData.lastName}
          onChange={e => setFormData({...formData, lastName: e.target.value})}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Create User
      </button>
    </form>
  );
} 