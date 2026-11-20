import React, { useState } from 'react';
import { Users, Edit2, Trash2, UserPlus, Save, X } from 'lucide-react';

export default function UserManagement({ users, fetchUsers }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddClick = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ username: '', password: '' });
    setError('');
  };

  const handleEditClick = (user) => {
    setEditingId(user.id);
    setIsAdding(false);
    setFormData({ username: user.username, password: user.password });
    setError('');
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ username: '', password: '' });
    setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.username || !formData.password) {
      setError('Username and password are required.');
      return;
    }

    setIsLoading(true);
    try {
      if (isAdding) {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to add');
      } else if (editingId) {
        const res = await fetch(`/api/users/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to update');
      }
      
      await fetchUsers(); // Refresh the list
      handleCancel();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Delete user ${username}?`)) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-card-bg border border-card-border p-4 rounded-xl backdrop-blur-md">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users size={20} className="text-primary" /> User Management
        </h2>
        {!isAdding && !editingId && (
          <button onClick={handleAddClick} className="btn btn-primary btn-sm px-4 py-2 text-sm">
            <UserPlus size={16} /> Add User
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="glass-panel mb-8 border-primary/50">
          <h3 className="text-lg font-semibold mb-4">
            {isAdding ? 'Add New User' : `Edit User #${editingId}`}
          </h3>
          {error && <p className="text-danger text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="form-group !mb-0 flex-1 w-full">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                id="username" name="username" type="text"
                className="form-input"
                value={formData.username} onChange={handleChange}
              />
            </div>
            <div className="form-group !mb-0 flex-1 w-full">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password" name="password" type="text"
                className="form-input"
                value={formData.password} onChange={handleChange}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
              <button type="button" onClick={handleCancel} className="btn btn-secondary flex-1 sm:flex-none">
                <X size={16} />
              </button>
              <button type="submit" className="btn btn-primary flex-1 sm:flex-none" disabled={isLoading}>
                {isLoading ? 'Saving...' : <><Save size={16} /> Save</>}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel !p-0 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/20 text-muted uppercase tracking-wider">
              <tr>
                <th className="p-4 font-medium">ID</th>
                <th className="p-4 font-medium">Username</th>
                <th className="p-4 font-medium">Password</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-primary">#{user.id}</td>
                  <td className="p-4">{user.username}</td>
                  <td className="p-4 font-mono text-xs text-muted">{user.password}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => handleEditClick(user)}
                      className="p-2 text-muted hover:text-white bg-white/5 hover:bg-primary/20 rounded-md transition-colors"
                      title="Edit User"
                    >
                      <Edit2 size={16} />
                    </button>
                    {user.id !== 6477 && (
                      <button 
                        onClick={() => handleDelete(user.id, user.username)}
                        className="p-2 text-muted hover:text-danger bg-white/5 hover:bg-danger/20 rounded-md transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="text-center p-6 text-muted">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
