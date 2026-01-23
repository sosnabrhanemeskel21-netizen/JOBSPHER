import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { notificationService } from '../services/notificationService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import './Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            // data might be a paged response or a list
            setNotifications(data.content || data || []);
        } catch (err) {
            setError('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const { user } = useAuth(); // Make sure to destructure this from the hook

    const handleNotificationClick = async (notif) => {
        if (!notif.read) {
            await notificationService.markAsRead(notif.id);
        }

        if (notif.link) {
            // Fix for legacy/broken links
            if (notif.link.includes('/applications/')) {
                if (user && user.role === 'EMPLOYER') {
                    navigate('/employer');
                } else {
                    navigate('/my-applications');
                }
            } else {
                navigate(notif.link);
            }
        }
    };

    if (loading) {
        return (
            <div className="notifications-page">
                <Navbar />
                <LoadingSpinner message="Retrieving alerts..." />
            </div>
        );
    }

    return (
        <div className="notifications-page">
            <Navbar />

            <div className="page-header-hazy">
                <div className="container animate-fade">
                    <h1>Notifications</h1>
                    <p className="page-subtitle">Personal alerts and system updates.</p>
                </div>
            </div>

            <div className="container notifications-layout animate-slide">
                {error && <ErrorMessage message={error} />}

                {notifications.length === 0 ? (
                    <div className="card empty-card">
                        <p>You have no notifications yet.</p>
                    </div>
                ) : (
                    <div className="notifications-list">
                        {notifications.map(notif => (
                            <div
                                key={notif.id}
                                className={`card notification-card ${notif.read ? 'read' : 'unread'}`}
                                onClick={() => handleNotificationClick(notif)}
                            >
                                <div className="notif-content">
                                    <div className="notif-header">
                                        <h3>{notif.title}</h3>
                                        <span className="notif-date">{new Date(notif.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p className="notif-message">{notif.message}</p>
                                </div>
                                {!notif.read && <div className="unread-dot"></div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
