import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Edit, 
  Save, 
  X, 
  Upload,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'danger'>('general');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: user?.profile?.full_name || '',
    email: user?.email || '',
    avatar_url: user?.profile?.avatar_url || null,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailReports: true,
    citationAlerts: true,
    productUpdates: true,
    marketingEmails: false
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Handle file upload for avatar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Update profile information
  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      
      let avatarUrl = profileData.avatar_url;
      
      // Upload avatar if changed
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, avatarFile);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL for the uploaded file
        const { data } = await supabase.storage.from('profiles').getPublicUrl(filePath);
        avatarUrl = data.publicUrl;
      }
      
      // Update user profile
      const updates = {
        full_name: profileData.full_name,
        avatar_url: avatarUrl
      };
      
      await updateProfile(updates);
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const handleUpdatePassword = async () => {
    try {
      setLoading(true);
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('New passwords do not match');
      }
      
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) throw error;
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Password updated successfully');
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  // Update notification preferences
  const handleUpdateNotifications = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          notification_preferences: notificationSettings
        })
        .eq('id', user?.id);
        
      if (error) throw error;
      
      toast.success('Notification preferences updated');
    } catch (error: any) {
      console.error('Error updating notification preferences:', error);
      toast.error(error.message || 'Failed to update notification preferences');
    } finally {
      setLoading(false);
    }
  };

  // Delete account (danger zone)
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== user?.email) {
      toast.error('Email confirmation does not match');
      return;
    }
    
    try {
      setLoading(true);
      
      // First cancel any active subscriptions
      if (user?.profile?.stripe_subscription_id) {
        const { error: subError } = await supabase.functions.invoke('cancel-subscription', {
          body: {
            userId: user.id,
            subscriptionId: user.profile.stripe_subscription_id
          }
        });
        
        if (subError) throw subError;
      }
      
      // Delete user account
      const { error } = await supabase.auth.admin.deleteUser(user!.id);
      
      if (error) throw error;
      
      // Sign out
      await supabase.auth.signOut();
      
      toast.success('Your account has been deleted');
      window.location.href = '/';
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Account Settings</h2>
        <p className="text-gray-400">Manage your profile and account preferences</p>
      </div>
      
      {/* Tabs */}
      <div className="flex items-center border-b border-gray-700">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'general' 
              ? 'text-primary-500 border-b-2 border-primary-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          General
        </button>
        
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'security' 
              ? 'text-primary-500 border-b-2 border-primary-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Security
        </button>
        
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'notifications' 
              ? 'text-primary-500 border-b-2 border-primary-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Notifications
        </button>
        
        <button
          onClick={() => setActiveTab('danger')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'danger' 
              ? 'text-red-500 border-b-2 border-red-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Danger Zone
        </button>
      </div>
      
      {/* Content */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        {/* General */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
            
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-700 rounded-full overflow-hidden">
                  {avatarPreview || profileData.avatar_url ? (
                    <img 
                      src={avatarPreview || profileData.avatar_url!}
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-500/20">
                      <User className="w-8 h-8 text-primary-400" />
                    </div>
                  )}
                </div>
                
                <label className="absolute bottom-0 right-0 p-1 bg-primary-500 rounded-full cursor-pointer">
                  <Upload className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              
              <div>
                <h4 className="font-medium text-white">{user?.profile?.full_name || 'Your Name'}</h4>
                <p className="text-gray-400 text-sm">{user?.email}</p>
                <p className="text-accent-400 text-sm mt-1 capitalize">{user?.profile?.plan || 'Free'} Plan</p>
              </div>
            </div>
            
            {/* Form */}
            <div className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  To change your email, please contact support
                </p>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Security */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-3 pr-10 py-2 text-white focus:outline-none focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-3 pr-10 py-2 text-white focus:outline-none focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-3 pr-10 py-2 text-white focus:outline-none focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={handleUpdatePassword}
                  disabled={loading || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword}
                  className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </button>
                
                {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-red-400 text-sm mt-2">
                    Passwords do not match
                  </p>
                )}
              </div>
              
              <div className="pt-4 mt-4 border-t border-gray-700">
                <h4 className="font-medium text-white mb-2">Two-Factor Authentication</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
                
                <button
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  Set Up 2FA
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailReports}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailReports: e.target.checked }))}
                    className="mt-1 w-4 h-4 text-primary-500 border-gray-600 rounded focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-medium text-white">Weekly Email Reports</div>
                    <p className="text-sm text-gray-400">
                      Receive a weekly summary of your citation performance and activity.
                    </p>
                  </div>
                </label>
              </div>
              
              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.citationAlerts}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, citationAlerts: e.target.checked }))}
                    className="mt-1 w-4 h-4 text-primary-500 border-gray-600 rounded focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-medium text-white">Citation Alerts</div>
                    <p className="text-sm text-gray-400">
                      Get notified when new citations are found for your domains.
                    </p>
                  </div>
                </label>
              </div>
              
              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.productUpdates}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, productUpdates: e.target.checked }))}
                    className="mt-1 w-4 h-4 text-primary-500 border-gray-600 rounded focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-medium text-white">Product Updates</div>
                    <p className="text-sm text-gray-400">
                      Receive notifications about new features and improvements.
                    </p>
                  </div>
                </label>
              </div>
              
              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.marketingEmails}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                    className="mt-1 w-4 h-4 text-primary-500 border-gray-600 rounded focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-medium text-white">Marketing Emails</div>
                    <p className="text-sm text-gray-400">
                      Occasional promotional offers and marketing communications.
                    </p>
                  </div>
                </label>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={handleUpdateNotifications}
                  disabled={loading}
                  className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Preferences
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Danger Zone */}
        {activeTab === 'danger' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-red-400 mb-4">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Danger Zone</h3>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
              <h4 className="font-semibold text-white mb-2">Delete Account</h4>
              <p className="text-gray-300 text-sm mb-4">
                This action cannot be undone. It will permanently delete your account, all your data, and cancel any active subscriptions.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type your email to confirm: {user?.email}
                  </label>
                  <input
                    type="email"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    placeholder="your@email.com"
                  />
                </div>
                
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading || deleteConfirmation !== user?.email}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete My Account
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
              <h4 className="font-semibold text-white mb-2">Export Your Data</h4>
              <p className="text-gray-300 text-sm mb-4">
                Download all your personal data in a machine-readable format.
              </p>
              
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-dark-900 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                Export Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;