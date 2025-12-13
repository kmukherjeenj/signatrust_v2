
interface JurisdictionRule {
    requireQualified: boolean;
    allowSimple: boolean;
  }
  
  interface JurisdictionRules {
    [key: string]: JurisdictionRule;
  }
  
  const jurisdictionRules: JurisdictionRules = {
    EU: { requireQualified: true, allowSimple: false },
    US: { requireQualified: false, allowSimple: true },
    UK: { requireQualified: false, allowSimple: true },
    CA: { requireQualified: false, allowSimple: true },
    // Add more country-specific rules as needed
  };
  
  export type SignatureType = 'simple' | 'advanced' | 'qualified';
  
  export async function getJurisdictionRequirements(country: string): Promise<JurisdictionRule> {
    return jurisdictionRules[country] || { requireQualified: false, allowSimple: true };
  }
  
  export function getSignatureType(jurisdiction: JurisdictionRule, userPreference: SignatureType): SignatureType {
    if (jurisdiction.requireQualified) return 'qualified';
    if (!jurisdiction.allowSimple && userPreference === 'simple') return 'advanced';
    return userPreference;
  }
  
  export function determineJurisdiction(userInfo: { country?: string }): string {
    return userInfo.country?.toUpperCase() || 'US'; // Default to US if country is not provided
  }