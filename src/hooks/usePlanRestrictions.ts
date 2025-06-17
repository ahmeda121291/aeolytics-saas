import { useAuth } from '../contexts/AuthContext';

export function usePlanRestrictions() {
  const { user } = useAuth();
  
  const planLimits = {
    free: {
      queries: 50,
      domains: 1,
      engines: ['ChatGPT'], // 🔒 RESTRICTED: Only ChatGPT for free users
      features: {
        advancedAnalytics: false,
        fixItBriefs: false,
        emailReports: false,
        whitelabelReports: false,
        apiAccess: false,
        teamCollaboration: false,
        integrations: false
      }
    },
    pro: {
      queries: 1000,
      domains: 5,
      engines: ['ChatGPT', 'Perplexity', 'Gemini'],
      features: {
        advancedAnalytics: true,
        fixItBriefs: true,
        emailReports: true,
        whitelabelReports: false,
        apiAccess: false,
        teamCollaboration: false,
        integrations: true // Slack/Notion when implemented
      }
    },
    agency: {
      queries: 10000,
      domains: 10,
      engines: ['ChatGPT', 'Perplexity', 'Gemini'],
      features: {
        advancedAnalytics: true,
        fixItBriefs: true,
        emailReports: true,
        whitelabelReports: true,
        apiAccess: true, // When implemented
        teamCollaboration: true, // When implemented
        integrations: true
      }
    }
  };

  const currentPlan = user?.profile?.plan || 'free';
  const limits = planLimits[currentPlan];

  const canAccessFeature = (feature: keyof typeof planLimits.free.features) => {
    return limits.features[feature];
  };

  const canUseEngine = (engine: string) => {
    return limits.engines.includes(engine);
  };

  const getAvailableEngines = () => {
    return limits.engines;
  };

  return {
    limits,
    canAccessFeature,
    canUseEngine,
    getAvailableEngines,
    currentPlan
  };
}