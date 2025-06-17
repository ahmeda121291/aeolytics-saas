import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Team {
  id: string;
  name: string;
  owner_id: string;
  plan: string;
  created_at: string;
  updated_at: string;
  owner_profile?: {
    full_name: string | null;
    email: string;
  };
}

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  permissions: any;
  invited_by: string | null;
  joined_at: string;
  user_profile?: {
    full_name: string | null;
    email: string;
  };
}

interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export function useTeams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      
      // Get teams where user is a member
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          user_profiles:owner_id (
            full_name,
            email
          )
        `)
        .eq('owner_id', user!.id);

      if (teamsError) throw teamsError;
      
      const userTeams = teamsData || [];
      setTeams(userTeams);

      if (userTeams.length > 0) {
        const teamId = userTeams[0].id;
        
        // Get team members
        const { data: membersData, error: membersError } = await supabase
          .from('team_members')
          .select(`
            *,
            user_profiles:user_id (
              full_name,
              email
            )
          `)
          .eq('team_id', teamId);

        if (membersError) throw membersError;
        setMembers(membersData || []);

        // Get pending invitations
        const { data: invitationsData, error: invitationsError } = await supabase
          .from('team_invitations')
          .select('*')
          .eq('team_id', teamId)
          .is('accepted_at', null)
          .gt('expires_at', new Date().toISOString());

        if (invitationsError) throw invitationsError;
        setInvitations(invitationsData || []);
      }

    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name,
          owner_id: user!.id,
          plan: 'agency'
        })
        .select()
        .single();

      if (error) throw error;

      setTeams([data]);
      toast.success('Team created successfully');
      
      // Refresh to get team members
      await fetchTeams();
    } catch (error: any) {
      console.error('Error creating team:', error);
      toast.error(error.message || 'Failed to create team');
    }
  };

  const inviteMember = async (teamId: string, email: string, role: 'admin' | 'editor' | 'viewer') => {
    try {
      const { data, error } = await supabase
        .from('team_invitations')
        .insert({
          team_id: teamId,
          email,
          role,
          invited_by: user!.id
        })
        .select()
        .single();

      if (error) throw error;

      setInvitations(prev => [...prev, data]);
      toast.success(`Invitation sent to ${email}`);
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast.error(error.message || 'Failed to send invitation');
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setMembers(prev => prev.filter(m => m.id !== memberId));
      toast.success('Member removed from team');
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error(error.message || 'Failed to remove member');
    }
  };

  const deleteInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      setInvitations(prev => prev.filter(i => i.id !== invitationId));
      toast.success('Invitation cancelled');
    } catch (error: any) {
      console.error('Error deleting invitation:', error);
      toast.error(error.message || 'Failed to cancel invitation');
    }
  };

  return {
    teams,
    members,
    invitations,
    loading,
    createTeam,
    inviteMember,
    removeMember,
    deleteInvitation,
    refetch: fetchTeams
  };
}