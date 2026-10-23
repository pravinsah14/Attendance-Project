import React, { useState } from 'react';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
} from '../../features/users/usersApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import {
  FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiX, FiSave, FiUsers,
} from 'react-icons/fi';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'employee',
  department: '',
  employeeId: '',
};

const UserModal = ({ user, onClose, onSave, isSaving }) => {
  const isEdit = !!user?._id;
  const [form, setForm] = useState(isEdit ? { ...user, password: '' } : emptyForm);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form };
    if (isEdit && !data.password) delete data.password;
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold">{isEdit ? 'Edit User' : 'Add New User'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <FiX size={22} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label">Employee ID</label>
              <input name="employeeId" value={form.employeeId} onChange={handleChange} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="label">{isEdit ? 'New Password (leave blank to keep)' : 'Password'}</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="input"
              required={!isEdit}
              minLength={isEdit ? 0 : 6}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Role</label>
              <select name="role" value={form.role} onChange={handleChange} className="input">
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="label">Department</label>
              <input name="department" value={form.department} onChange={handleChange} className="input" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSaving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <FiSave size={16} />
              {isSaving ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const { data, isLoading } = useGetUsersQuery({});
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [toggleStatus] = useToggleUserStatusMutation();

  const [modal, setModal] = useState(null); // null | 'create' | user object

  const users = data?.users || [];

  const handleSave = async (formData) => {
    try {
      if (modal?._id) {
        await updateUser({ id: modal._id, ...formData }).unwrap();
        toast.success('User updated!');
      } else {
        await createUser(formData).unwrap();
        toast.success('User created!');
      }
      setModal(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Operation failed.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await deleteUser(id).unwrap();
      toast.success('User deleted.');
    } catch (err) {
      toast.error(err?.data?.message || 'Delete failed.');
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleStatus(id).unwrap();
      toast.success('User status updated.');
    } catch (err) {
      toast.error('Failed to toggle status.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiUsers className="text-blue-600" /> User Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">{users.length} total users</p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus size={16} /> Add User
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Employee ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="font-medium">{user.name}</td>
                  <td className="text-gray-500">{user.email}</td>
                  <td>
                    <span
                      className={
                        user.role === 'admin'
                          ? 'badge-blue'
                          : user.role === 'manager'
                          ? 'badge-yellow'
                          : 'badge-green'
                      }
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>{user.department || '—'}</td>
                  <td className="font-mono text-xs">{user.employeeId || '—'}</td>
                  <td>
                    <span className={user.isActive !== false ? 'badge-green' : 'badge-red'}>
                      {user.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setModal(user)}
                        className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleToggle(user._id)}
                        className="text-yellow-600 hover:text-yellow-800 p-1.5 rounded hover:bg-yellow-50 transition-colors"
                        title="Toggle Status"
                      >
                        {user.isActive !== false ? <FiToggleRight size={15} /> : <FiToggleLeft size={15} />}
                      </button>
                      <button
                        onClick={() => handleDelete(user._id, user.name)}
                        className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <UserModal
          user={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          isSaving={creating || updating}
        />
      )}
    </div>
  );
};

export default UserManagement;
