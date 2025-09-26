'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const AdminTeam = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    email: '',
    phone: '',
    bio: '',
    department: 'management',
    isActive: true,
    priority: 1
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchTeam = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/team`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeam(data.team || []);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingMember 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/team/${editingMember._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/team`;
      
      const method = editingMember ? 'PUT' : 'POST';
      
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }
      
      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: formDataToSend,
      });

      if (response.ok) {
        setShowModal(false);
        setEditingMember(null);
        setSelectedImage(null);
        setImagePreview(null);
        setFormData({
          name: '',
          position: '',
          email: '',
          phone: '',
          bio: '',
          department: 'management',
          isActive: true,
          priority: 1
        });
        fetchTeam();
      }
    } catch (error) {
      console.error('Error saving team member:', error);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      position: member.position,
      email: member.email,
      phone: member.phone,
      bio: member.bio,
      department: member.department,
      isActive: member.isActive,
      priority: member.priority
    });
    setImagePreview(member.image ? `${process.env.NEXT_PUBLIC_API_URL}${member.image}` : null);
    setSelectedImage(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/team/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          fetchTeam();
        }
      } catch (error) {
        console.error('Error deleting team member:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Team Management</h1>
          <p className="text-muted mb-0">Manage team members and their information</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingMember(null);
            setSelectedImage(null);
            setImagePreview(null);
            setFormData({
              name: '',
              position: '',
              email: '',
              phone: '',
              bio: '',
              department: 'management',
              isActive: true,
              priority: 1
            });
            setShowModal(true);
          }}
        >
          <FaPlus className="me-2" />
          Add Member
        </button>
      </div>

      <div className="row">
        {team.map((member) => (
          <div key={member._id} className="col-lg-4 col-md-6 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="mb-3">
                  {member.image ? (
                    <div className="position-relative" style={{ width: '80px', height: '80px' }}>
                      <Image 
                        src={`${process.env.NEXT_PUBLIC_API_URL}${member.image}`}
                        alt={member.name}
                        className="rounded-circle"
                        style={{ objectFit: 'cover' }}
                        fill
                      />
                    </div>
                  ) : (
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                      <span className="h4 text-primary mb-0">{member.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <h5 className="card-title mb-1">{member.name}</h5>
                <p className="text-muted mb-2">{member.position}</p>
                <p className="text-muted small mb-3">{member.bio}</p>
                
                <div className="mb-3">
                  <span className="badge bg-secondary me-1">{member.department}</span>
                  <span className={`badge ${member.isActive ? 'bg-success' : 'bg-danger'}`}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="d-flex justify-content-center gap-2">
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleEdit(member)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(member._id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {team.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">No team members found. Add your first team member!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Profile Image</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="rounded-circle"
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Position</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.position}
                          onChange={(e) => setFormData({...formData, position: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Bio</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    ></textarea>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-4">
                      <label className="form-label">Department</label>
                      <select
                        className="form-select"
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                      >
                        <option value="management">Management</option>
                        <option value="development">Development</option>
                        <option value="marketing">Marketing</option>
                        <option value="support">Support</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Priority</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                        min="1"
                        max="10"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Status</label>
                      <div className="form-check form-switch mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        />
                        <label className="form-check-label">
                          Active
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingMember ? 'Update Member' : 'Add Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeam;
