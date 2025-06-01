export const severityMap: { [key: string]: number } = {
  // Critical variations
  critical: 4,
  'critical severity': 4,
  'critical vulnerability': 4,
  'critical risk': 4,
  'severity: critical': 4,
  'risk: critical': 4,

  // High variations
  high: 3,
  'high severity': 3,
  'high vulnerability': 3,
  'high risk': 3,
  'severity: high': 3,
  'risk: high': 3,

  // Moderate/Medium variations
  moderate: 2,
  medium: 2,
  'moderate severity': 2,
  'medium severity': 2,
  'moderate vulnerability': 2,
  'medium vulnerability': 2,
  'moderate risk': 2,
  'medium risk': 2,
  'severity: moderate': 2,
  'severity: medium': 2,
  'risk: moderate': 2,
  'risk: medium': 2,

  // Low variations
  low: 1,
  'low severity': 1,
  'low vulnerability': 1,
  'low risk': 1,
  'severity: low': 1,
  'risk: low': 1,

  // Unknown/None variations
  unknown: 0,
  none: 0,
  'unknown severity': 0,
  'no severity': 0,
  'severity: unknown': 0,
  'severity: none': 0,
  'risk: unknown': 0,
  'risk: none': 0,
};

export const getSeverityWeight = (severity: string): number => {
  return severityMap[severity.toLowerCase()] ?? 0;
};
