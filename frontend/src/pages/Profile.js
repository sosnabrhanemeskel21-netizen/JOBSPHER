import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { userService } from '../services/userService';
import { fileService } from '../services/fileService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import './Profile.css';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        resumePath: '',
    });
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await userService.getProfile();
            setFormData({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                phoneNumber: data.phoneNumber || '',
                address: data.address || '',
                resumePath: data.resumePath || '',
            });
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            let resumePath = formData.resumePath;
            if (resumeFile) {
                const uploadResponse = await fileService.uploadFile(resumeFile, 'resume');
                resumePath = uploadResponse.filePath;
            }

            const updatedUser = await userService.updateProfile({ ...formData, resumePath });

            // Update local auth context
            updateUser(updatedUser);

            setFormData({
                ...formData,
                resumePath: updatedUser.resumePath
            });
            setSuccess('Profile updated successfully');
            setResumeFile(null);
        } catch (err) {
            setError('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-page">
                <Navbar />
                <LoadingSpinner message="Loading profile..." />
            </div>
        );
    }

    return (
        <div className="profile-page">
            <Navbar />

            <div className="page-header-hazy">
                <div className="container animate-fade">
                    <h1>Your Account</h1>
                    <p className="page-subtitle">Manage your personal details and professional path.</p>
                </div>
            </div>

            <div className="container profile-layout animate-slide">
                <div className="card profile-card">
                    {error && <ErrorMessage message={error} />}
                    {success && <div className="success-message card">{success}</div>}

                    <form onSubmit={handleSubmit} className="hazy-form grid-form">
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        {user?.role === 'JOB_SEEKER' && (
                            <div className="form-group full-width resume-upload-section">
                                <label>Professional Resume</label>
                                <div className="file-input-group">
                                    <input
                                        type="file"
                                        id="resume-file"
                                        accept=".pdf,.doc,.docx,image/*"
                                        onChange={e => setResumeFile(e.target.files[0])}
                                        hidden
                                    />
                                    <label htmlFor="resume-file" className="btn btn-outline btn-sm">
                                        {resumeFile ? resumeFile.name : 'Choose New File'}
                                    </label>
                                    {formData.resumePath && (
                                        <a
                                            href={fileService.getDownloadUrl(formData.resumePath)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="view-current-link"
                                        >
                                            View Current Resume
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="form-actions full-width">
                            <button type="submit" disabled={saving} className="btn btn-primary">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="card identity-card">
                    <label>Account Role</label>
                    <h3>{user?.role === 'EMPLOYER' ? 'Organization Representative' : user?.role === 'ADMIN' ? 'System Administrator' : 'Candidate'}</h3>
                    <p className="email-meta">{user?.email}</p>
                </div>
            </div>
        </div>
    );
};

export default Profile;
