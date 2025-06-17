import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Mail, 
  Crown, 
  Shield, 
  Edit, 
  Eye,
  X,
  Trash2,
  Copy,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useTeams } from '../hooks/useTeams';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const TeamManagement = () => {
  const { user } = useAuth();
  const { teams, members, invitations, loading, createTeam, inviteMember, removeMember, deleteInvitation } = useTeams();
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'viewer' as 'admin' | 'editor' | 'viewer'
  });

  const currentPlan = user?.profile?.plan || 'free';

  if (currentPlan !== 'agency') {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Team Collaboration</h3>
        <p className="text-gray-400 mb-6">
          Team collaboration is available on the Agency plan
        </p>
        <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-all">
          Upgrade to Agency
        </button>
      </div>
    );
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    try {
      await createTeam(newTeamName.trim());
      setNewTeamName('');
      setShowCreateTeam(false);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData.email.trim() || !teams[0]) return;

    try {
      await inviteMember(teams[0].id, inviteData.email.trim(), inviteData.role);
      setInviteData({ email: '', role: 'viewer' });
      setShowInviteMember(false);
    } catch (error) {
      console.error('Error inviting member:', error);
    }
  };

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/team/join/${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invite link copied to clipboard');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'editor': return <Edit className="w-4 h-4 text-green-500" />;
      default: return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="h-32 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Team Management</h2>
          <p className="text-gray-400">Collaborate with your team members</p>
        </div>
        
        <div className="flex items-center gap-3">
          {teams.length > 0 && (
            <button
              onClick={() => setShowInviteMember(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Invite Member
            </button>
          )}
          
          {teams.length === 0 && (
            <button
              onClick={() => setShowCreateTeam(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Team
            </button>
          )}
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No team yet</h3>
          <p className="text-gray-500 mb-6">
            Create your first team to start collaborating with others
          </p>
          <button
            onClick={() => setShowCreateTeam(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            Create Your Team
          </button>
        </div>
      ) : (
        <>
          {/* Team Overview */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white">{teams[0].name}</h3>
                <p className="text-gray-400">Team Owner: {teams[0].owner_profile?.full_name || teams[0].owner_profile?.email}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{members.length}</div>
                <div className="text-sm text-gray-400">Team Members</div>
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-3">
              <h4 className="font-medium text-white">Team Members</h4>
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {member.user_profile?.full_name || member.user_profile?.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        {getRoleIcon(member.role)}
                        {member.role}
                      </div>
                    </div>
                  </div>
                  
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => removeMember(member.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Pending Invitations */}
            {invitations.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="font-medium text-white">Pending Invitations</h4>
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <div>
                        <div className="font-medium text-white">{invitation.email}</div>
                        <div className="flex items-center gap-2 text-sm text-yellow-400">
                          {getRoleIcon(invitation.role)}
                          {invitation.role} • Expires {new Date(invitation.expires_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyInviteLink(invitation.token)}
                        className="text-gray-400 hover:text-accent-500 transition-colors"
                        title="Copy invite link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteInvitation(invitation.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Create Team Modal */}
      {showCreateTeam && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowCreateTeam(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create Team</h3>
              <button
                onClick={() => setShowCreateTeam(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g., Marketing Team"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={!newTeamName.trim()}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-all"
                >
                  Create Team
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateTeam(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Invite Member Modal */}
      {showInviteMember && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowInviteMember(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteMember(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="colleague@company.com"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="viewer">Viewer - Can view data</option>
                  <option value="editor">Editor - Can edit queries and domains</option>
                  <option value="admin">Admin - Can manage team members</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={!inviteData.email.trim()}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-all"
                >
                  Send Invitation
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteMember(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default TeamManagement;